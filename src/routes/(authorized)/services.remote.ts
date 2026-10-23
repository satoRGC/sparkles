import { currentUser } from "#lib/server/authenticated.server.ts"
import { db, schema } from "#lib/server/db/index.ts";
import { form, query } from "$app/server"
import z from "zod"
import {eq, sql} from "drizzle-orm"
import { redirect } from "@sveltejs/kit";
import { getObserverChangePromise, hasObservers } from "#lib/server/ws.ts";

export const getServices = query(z.int().optional(), async (id) => {
    const user = await currentUser();
    return db.select({
        id: schema.service.id,
        name: schema.service.name,
        basePrice: schema.service.basePrice,
        wording: schema.service.wording,
        ...(
            user.admin
            ? { authenticationKey: schema.service.authenticationKey }
            : {}
        )
    })
        .from(schema.service)
        .where(id ? eq(schema.service.id, id) : undefined)
})

export const putService = form(z.object({
    // we need to have a fake undefined here to use as id
    // so that we can use it in .for(), otherwise svelte
    // renders different values
    id: z.union([z.int().optional(), z.literal("_")]),
    name: z.string().min(1),
    basePrice: z.number().min(1),
    authenticationKey: z.string().min(1),
    wording: z.enum(schema.service.wording.enumValues)
}), async (newVersion) => {
    await currentUser().withAdmin();

    const inserting = {
        ...newVersion,
        basePrice: newVersion.basePrice.toFixed(1),
        id: newVersion.id === "_" ? undefined : newVersion.id
    }
    const [{id}] = await db.insert(schema.service)
        .values(inserting)
        .onConflictDoUpdate({
            target: schema.service.id,
            set: inserting
        })
        .returning({id: schema.service.id})

    getServices().refresh()
    getServices(id).refresh()

    if (inserting.id === undefined)
        redirect(303, `/services/${id}`)
    else return { success: true }
})

export const deleteService = form(z.object({
    id: z.int()
}), async ({id}) => {
    await currentUser().withAdmin();
    await db.delete(schema.service)
        .where(eq(schema.service.id, id))
    getServices().refresh()
    getServices(id).refresh()
    redirect(303, `/services`)
})

export const liveHasObservers = query.live(z.number(), async function*(id) {
    await currentUser().withAdmin();
    while (true) {
        yield hasObservers(id);
        await getObserverChangePromise(id);
    }
})