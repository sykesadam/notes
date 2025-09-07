import { env } from "@/env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from './db/remote/db';

export const auth = betterAuth({
	baseURL: env.VITE_URL,
	database: drizzleAdapter(db, {
		provider: "sqlite",
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
	},
});
