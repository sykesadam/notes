import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "@/env";
import { db } from "./db/remote/db";
import * as schemas from "./db/remote/schema";

export const auth = betterAuth({
	baseURL: env.VITE_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schemas,
		},
		usePlural: true,
	}),
	plugins: [tanstackStartCookies()],
	emailAndPassword: {
		enabled: true,
	},
});
