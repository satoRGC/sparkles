import { currentUser } from "#lib/server/authenticated.server.ts";
import { undo } from "#lib/server/balance.ts";
import { db, schema } from "#lib/server/db/index.ts";
import { form, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { desc, eq } from "drizzle-orm";
import { hasObservers } from "#lib/server/ws.ts";
import z from "zod";

export const getTransactions = query(z.string(), async (forId) => {
    const user = await currentUser();

    if (forId !== user.id && !user.admin)
        error(403, "Forbidden")

    return db.select()
        .from(schema.transaction)
        .where(eq(schema.transaction.userId, forId))
        .orderBy(desc(schema.transaction.timestamp))
        .limit(50)
})

export const undoTransaction = form(z.object({
    id: z.number()
}), async ({id}) => {
    await currentUser().withAdmin();
    return undo(id)
})