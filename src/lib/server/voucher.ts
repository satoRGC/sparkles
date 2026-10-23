import { and, count, eq, gt, gte, lt, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { transact } from "./balance";

export class VoucherNotFoundError extends Error {}

/**
 * Create a voucher
 * @param amount Amount of Sparkles to assign to voucher
 * @returns Voucher ID
 */
export async function create(amount: number) {
    const [{id}] = await db.insert(schema.voucher)
        .values({ amount })
        .returning({ id: schema.voucher.id })
    return id
}

/**
 * Purges expired vouchers from db
 * @returns Count of expired vouchers removed
 */
export async function purge() {
    const ret = await db.delete(schema.voucher)
        .where(lt(schema.voucher.expiry, sql`CURRENT_TIMESTAMP`))
        .returning({ id: schema.voucher.id })
    return ret.length
}

/**
 * Redeem a voucher to user id
 * @param key Voucher id
 * @param to User id to return to
 * @returns Transaction id and new account balance
 */
export async function redeem(key: string, to: string) {
    return db.transaction(async (tx) => {
        const rows = await tx.delete(schema.voucher)
            .where(and(
                gte(schema.voucher.expiry, sql`CURRENT_TIMESTAMP`),
                eq(schema.voucher.id, key)
            ))
            .returning({ amount: schema.voucher.amount })
        
        if (rows.length === 0)
            throw new VoucherNotFoundError();
        const [{amount}] = rows
        
        // TODO: load events from rhythmgames.atsa.to to flesh out reason
        return transact(to, amount.toString(), `Loaded funds`)
    })
}