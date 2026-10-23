import { IncorrectPasswordError, login } from "#lib/server/auth.ts";
import { currentUser } from "#lib/server/authenticated.server.ts";
import { CanvasUserNotFoundError } from "#lib/server/canvas.ts";
import { form, getRequestEvent } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import z from "zod";

export const loginOrRegister = form(
    z.object({
        studentId: z.string().regex(/^201\d{6}$/, {error: "Must be a valid student ID (your 2011)"}),
        lastName: z.string()
    }), async ({studentId, lastName}) => {
        const {cookies, url} = getRequestEvent()
        try {
            cookies.set(
                'token',
                await login(studentId, lastName),
                {secure:false}
            )
            redirect(303, url.searchParams.get(`then`) || "/")
        } catch (e) {
            if (e instanceof CanvasUserNotFoundError || e instanceof IncorrectPasswordError)
                return {
                    success: false,
                    message: `Check your student ID or last name; it should be capitalized / appear as it does on Canvas.`
                }
            throw e
        }
    }
)