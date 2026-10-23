import { transact } from "#lib/server/balance.ts";
import { form, getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";
export const logout = form("unchecked", async () => {
        const {cookies} = getRequestEvent()
        cookies.delete("token")
        redirect(303, "/login")
    }
)