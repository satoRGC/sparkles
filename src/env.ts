import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';
import z from 'zod';

function optionalWhenBuilding<T extends z.ZodType>(i: T) {
    return building ? z.optional(i) : i
}

export const variables = defineEnvVars(({
	DATABASE_URL: { description: 'The database connection string.', schema: optionalWhenBuilding(z.string()) },
	SIS_SUFFIX: { description: 'Suffix to append to IDs when looking them up on Canvas', schema: optionalWhenBuilding(z.string()) },
	CANVAS_API_BASE: { description: 'Canvas REST API endpoint', schema: optionalWhenBuilding(z.string()) },
	COURSE_ID: { description: 'Course ID with all students', schema: optionalWhenBuilding(z.string()) },
	CANVAS_API_KEY: { description: 'Canvas API key', schema: optionalWhenBuilding(z.string()) },
	JWT_SECRET: {description: "HS256 JWT secret in hex", schema: optionalWhenBuilding(z.hex().length(64))},
	ADMINS: {description: "Comma deliminated ids as admins", schema: optionalWhenBuilding(z.string().transform(a => a.split(",").map(e => e.trim())))},
	ORIGIN: {description: "origin", public: true, schema: optionalWhenBuilding(z.string())},
	GATEWAY_PORT: {description: "port for gateway websocket server", schema: optionalWhenBuilding(z.coerce.number<string>())},
	GATEWAY: {description: "gateway websocket URI", schema: optionalWhenBuilding(z.string()), public: true}
}));
