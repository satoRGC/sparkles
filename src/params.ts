import { defineParams } from "@sveltejs/kit/params";
import z from "zod";

export const params = defineParams({
    serviceIdOrNew: z.union([z.coerce.number<string>(), z.literal("new")]),
    serviceId: z.coerce.number<string>()
})