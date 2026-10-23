import { getUserFromToken } from '#lib/server/auth.ts';
import { error, redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import {ADMINS} from "$app/env/private"
import { setup } from '#lib/server/ws.ts';

setup()

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("token")
	try {
		if (token)
			event.locals.user = await getUserFromToken(token)
	} catch(e) {
		event.cookies.delete("token")
	}
	
	if (event.route.id?.startsWith("/(sessionless)") && event.locals.user)
		redirect(303, "/")
	
	if (event.route.id?.startsWith("/(authorized)") && !event.locals.user)
		redirect(303, `/login?then=${encodeURIComponent(event.url.pathname)}`)
	
	if (event.route.id?.startsWith("/(authorized)/(admin)") && !event.locals.user?.admin)
		error(403, "Forbidden")

	return resolve(event);
};