import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { env } from "@/env";

export const auth = betterAuth({
	baseURL: env.VITE_URL,
	database: new Database("./sqlite.db"),
	emailAndPassword: {
		enabled: true,
	},
});
