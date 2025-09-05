import { env } from "@/env";
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
	baseURL: env.VITE_URL,
	database: new Database("./sqlite.db"),
	emailAndPassword: {
		enabled: true,
	},
});
