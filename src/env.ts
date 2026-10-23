import { defineEnvVars } from '@sveltejs/kit/env';
import z from 'zod';

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	SIS_SUFFIX: { description: 'Suffix to append to IDs when looking them up on Canvas' },
	CANVAS_API_BASE: { description: 'Canvas REST API endpoint' },
	COURSE_ID: { description: 'Course ID with all students' },
	CANVAS_API_KEY: { description: 'Canvas API key' },
	JWT_SECRET: {description: "HS256 JWT secret in hex", schema: z.hex().length(64)},
	ADMINS: {description: "Comma deliminated ids as admins", schema: z.string().transform(a => a.split(",").map(e => e.trim()))},
	ORIGIN: {description: "origin", schema: z.string(), public: true},
	GATEWAY_PORT: {description: "port for gateway websocket server", schema: z.coerce.number<string>()},
	GATEWAY: {description: "gateway websocket URI", schema: z.string(), public: true}
});
