import { hash, verify } from "argon2";
import { fetchUserFromCanvas } from "./canvas";
import { db, schema, type User } from "./db";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { ADMINS, JWT_SECRET } from "$app/env/private"

export const ENCODED_JWT_SECRET = Buffer.from(JWT_SECRET, 'hex')
export class IncorrectPasswordError extends Error {}

/**
 * Make a default password to update a user with.
 * @param studentId Student ID to make password for
 * @returns 
 */
export async function mkDefaultPass(studentId: string): Promise<Pick<User, "password" | "usingDefault">> {
    const {sortable_name} = await fetchUserFromCanvas(studentId)
    return {
        password: await hash(sortable_name.split(",")[0]),
        usingDefault: true
    }
}

/**
 * Make a custom password to update a user with.
 * @param newPassword New password
 * @returns 
 */
export async function mkCustomPass(newPassword: string): Promise<Pick<User, "password" | "usingDefault">> {
    return {
        password: await hash(newPassword),
        usingDefault: false
    }
}


/**
 * Create a user for a student ID.
 * @param studentId Student ID to create a user for.
 */
async function spawn(studentId: string): Promise<Pick<User, "id" | "password" | "usingDefault">> {
    const inserting = {
        id: studentId,
        ...(await mkDefaultPass(studentId))
    }
    await db.insert(schema.user).values(inserting)
    return inserting
}

/**
 * Login a user with studentId and their last name.
 * @param studentId Their student id.
 * @param password Their pwd.
 * @returns A jwt to use as a cookie.
 */
export async function login(studentId: string, password: string) {
    const match = (
        await db.select()
            .from(schema.user)
            .where(
                eq(schema.user.id, studentId)
            )
    )[0] ?? await spawn(studentId);

    if (!(await verify(match.password, password)))
        throw new IncorrectPasswordError()

    return new SignJWT()
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(match.id)
        .setIssuedAt()
        .setExpirationTime('1w')
        .sign(ENCODED_JWT_SECRET)
}

export async function getUserFromToken(jwt: string) {
    const output = await jwtVerify(jwt, ENCODED_JWT_SECRET)
    const dbOutput = (
        await db.select()
            .from(schema.user)
            .where(
                eq(schema.user.id, output.payload.sub!)
            )
    )[0]
    if (!dbOutput) throw new Error(`user not found?`) // maybe this should be its own error type
    return {
        ...dbOutput,
        admin: ADMINS.includes(dbOutput.id)
    }
}