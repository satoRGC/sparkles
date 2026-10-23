import { eq, sql } from "drizzle-orm";
import { db, schema } from "./db";

/**
 * Perform a transaction
 * @param userId User to perform transaction to
 * @param amount In what amount
 * @param reason Reason for transaction
 * @returns Transaction ID and user's new balance
 */
export async function transact(userId: string, amount: string, reason?: string) {
    return db.transaction(async (tx) => {
        const [{newBalance}] = await tx.update(schema.user)
            .set({balance: sql`${schema.user.balance} + ${amount}`})
            .where(eq(schema.user.id, userId))
            .returning({ newBalance: schema.user.balance })

        // negative balance check was moved out to allow for
        // this logic (if the user's new balance is negative and the user is spending,
        // then rollback the transaction)
        if (newBalance.startsWith("-") && amount.startsWith("-"))
            tx.rollback()
        
        const [{transaction}] = await tx.insert(schema.transaction)
            .values({ userId, amount, reason })
            .returning({ transaction: schema.transaction.id })
        return {
            newBalance, transaction
        }
    })
}

/**
 * Undo a transaction
 * @param id Transaction to undo
 * @returns 
 */
export async function undo(id: number) {
    return db.transaction(async (tx) => {
        const [entry] = await tx.delete(schema.transaction)
            .where(eq(schema.transaction.id, id))
            .returning({forUser: schema.transaction.userId, amount: schema.transaction.amount})
        
        if (!entry)
            tx.rollback()
        const {amount, forUser} = entry

        await tx.update(schema.user)
            .set({balance: sql`${schema.user.balance} - ${amount}`})
            .where(eq(schema.user.id, forUser))
    })
}