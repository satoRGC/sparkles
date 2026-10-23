import { currentUser } from "#lib/server/authenticated.server.ts";
import { db, schema } from "#lib/server/db/index.ts";
import { create, purge } from "#lib/server/voucher.ts";
import { form, getRequestEvent } from "$app/server";
import { error } from "console";
import z from "zod";

export const createVoucher = form(z.object({
    amount: z.int().min(1).max(20)
}), async ({amount}) => {
    await currentUser().withAdmin();

    return {
        success: true,
        voucherId: await create(amount)
    }
})

export const purgeVouchers = form("unchecked", async () => {
    await currentUser().withAdmin();

    let purged = await purge()

    return {
        success: true,
        purged
    }
})