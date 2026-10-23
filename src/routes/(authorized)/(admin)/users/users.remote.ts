import { mkCustomPass, mkDefaultPass } from "#lib/server/auth.ts";
import { currentUser } from "#lib/server/authenticated.server.ts";
import { transact } from "#lib/server/balance.ts";
import { db, schema } from "#lib/server/db/index.ts";
import { form, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import z from "zod";

export const adminGetUser = query(z.string(), async (id) => {
    await currentUser().withAdmin();
    let [user] = await db.select()
        .from(schema.user)
        .where(eq(schema.user.id, id))
    if (!user)
        error(404, 'User not found')
    return user
})

// this is so so bad this shouldn't depend on server but i'm laaaazy
// i just want the bare minimum for now
export const adminGetUserForm = form(z.object({id: z.string()}), async (id) => {
    await currentUser().withAdmin();
    return id
})

export const zeroUserBal = form(z.object({id: z.string()}), async ({id}) => {
    await currentUser().withAdmin();
    const [{balance}] = await db.select({balance: schema.user.balance})
        .from(schema.user)
        .where(eq(schema.user.id, id))
    if (balance === "0")
        return {success: false, message: "Already zero"}
    await transact(id, `-${balance}`, `Account balance zero'ed`)
    return {success: true, message: "Zeroed"}
})

export const resetPwd = form(z.object({id: z.string()}), async ({id}) => {
    await currentUser().withAdmin();
    await db.update(schema.user)
        .set(await mkDefaultPass(id))
        .where(eq(schema.user.id, id))
    return {success: true}
})

export const changeOwnPwd = form(z.object({newPwd: z.string().min(8)}), async ({newPwd}) => {
    const {id} = await currentUser().withAdmin();
    await db.update(schema.user)
        .set(await mkCustomPass(newPwd))
        .where(eq(schema.user.id, id))
    return {success: true}
})