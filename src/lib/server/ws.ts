import { WebSocket, WebSocketServer, type RawData } from "ws";
import {GATEWAY_PORT} from "$app/env/private"
import z from "zod";
import { db, schema } from "./db";
import { eq } from "drizzle-orm";
import { ENCODED_JWT_SECRET, getUserFromToken } from "./auth";
import { transact } from "./balance";
import { jwtVerify } from "jose";
import { parseCookie } from "cookie";

const intentSchema = z.union([
    z.object({
        intent: z.literal("observe"),
        id: z.number(),
        token: z.string()
    }),
    z.object({
        intent: z.literal("pay"),
        id: z.number()
    })
])

export type Intent = z.infer<typeof intentSchema>

export type ServerEvent = {
    event: "success",
    newBalance: string,
    service: number,
    t: number
}

export function wsJson<T extends z.ZodType>(ws: WebSocket, data: RawData, schema: T) {
    let intent_parsed
    try {
        intent_parsed = JSON.parse(data.toString())
    } catch {
        throw ws.close(1003, "Malformed json")
    }

    let res = schema.safeParse(intent_parsed)
    if (!res.success)
        throw ws.close(1008, "Malformed data")

    return res.data
}

export const gateway: WebSocketServer = new WebSocketServer({ port: GATEWAY_PORT })
const gateway_observer_change: Record<string, ReturnType<typeof Promise.withResolvers<void>>> = {}
const subscriptions: Record<string, WebSocket[]> = {}

function regenerateObserverChangePromise(service: number) {
    // in this order so that generators can attach to the new one
    // before we resolve
    const garbage = gateway_observer_change[service]
    gateway_observer_change[service] = Promise.withResolvers()
    if (garbage) garbage.resolve()
    return gateway_observer_change[service]
}

export function hasObservers(service: number) {
    return Boolean(subscriptions[service] && subscriptions[service].length)
}

/**
 * Be wary of memory leaks using this
 * I feel like there will be potential for there to be some
 */
export function getObserverChangePromise(service: number) {
    return (
        gateway_observer_change[service]
        ?? regenerateObserverChangePromise(service)
    ).promise
}

export async function subscribe(service: number, ws: WebSocket) {
    if (!subscriptions[service])
        subscriptions[service] = []
    subscriptions[service].push(ws)
    regenerateObserverChangePromise(service)

    const dc = () => {
        if (ws.readyState === WebSocket.OPEN)
            ws.close()

        const idx = subscriptions[service].indexOf(ws)
        if (idx !== -1) {
            subscriptions[service].splice(
                idx,
                1
            )
            regenerateObserverChangePromise(service)
        }
    }

    ws.on("error", dc)
    ws.on("close", dc)
    return dc
}

export async function publish(service: number, message: ServerEvent) {
    if (subscriptions[service])
        return subscriptions[service].map(ws => new Promise<void>(
            (res, rej) => ws.send(JSON.stringify(message), (e) => {
                if (e) return rej(e)
                else return res()
            })
        ))
}

export function setup() {
    gateway.on("listening", () => {
        console.info(`Gateway server listening: ${gateway.options.port}`)
    })

    gateway.on("connection", (ws, r) => {
        // maybe this shouldn't be a closure
        ws.on("message", (data) => (async () => {
            const {id, ...message} = wsJson(ws, data, intentSchema)
            // in all cases id resolves to a service so let's fetch that

            const [service] = await db.select()
                .from(schema.service)
                .where(eq(schema.service.id, id))

            if (!service)
                throw ws.close(1008, `Service ${id} doesn't exist`)

            if (message.intent === "pay") {
                if (hasObservers(id)) {
                    if (!r.headers.cookie) throw ws.close(1008, `Unauthorized`)
                    // check token signature
                    // sql can handle illegal transactions, but to try to make it
                    // a smidge faster, we're not going to fetch the user and check
                    // their balance since the page load should have already done it
                    // again, it should be ok because sql will handle and prevent
                    // illegal tx
                    let uid;
                    try { uid = (await jwtVerify(parseCookie(r.headers.cookie).token ?? "", ENCODED_JWT_SECRET)).payload.sub ?? "" }
                    catch { throw ws.close(1008, `Unauthorized`) }
                    
                    let tx;
                    try { tx = await transact(uid, `-${service.basePrice}`, `${service.wording === "activation" ? "Activated" : "Redeemed sparkles for"} ${service.name}`) }
                    catch { throw ws.close(1011, `Error making transaction`) }

                    const publishing = {
                        event: "success",
                        newBalance: tx.newBalance,
                        service: id,
                        t: Date.now()
                    } satisfies ServerEvent

                    await publish(id, publishing)
                    ws.send(JSON.stringify(publishing), () => ws.close())
                } else throw ws.close(1011, `Service is unavailable`)
            } else {
                if (message.token !== service.authenticationKey)
                    throw ws.close(1008, `Unauthorized`)
                
                subscribe(id, ws)
            }
        })().catch(e => void e))
    })
}