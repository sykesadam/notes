import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const editorSizeSchema = z.enum(["default", "narrow"]);
export type EditorSize = z.infer<typeof editorSizeSchema>;

export function getEditorSizeLocalStorage() {
	if (typeof window === "undefined") return "default";

	const { data } = editorSizeSchema.safeParse(
		window.localStorage.getItem("editor-size"),
	);

	if (!data) return "default";

	return data;
}

export function setEditorSizeLocalStorage(editorSize: EditorSize) {
	if (typeof window === "undefined") return;

	window.localStorage.setItem("editor-size", editorSize);
}

export function getClientCookie(name: string) {
	const cookies = document.cookie.split("; ");
	for (const cookie of cookies) {
		const [key, value] = cookie.split("=");
		if (key === name) return decodeURIComponent(value);
	}
	return null;
}

interface CookieOptions {
	expires?: Date | number; // Date object or number of days
	path?: string;
	domain?: string;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
}

export function setClientCookie(
	name: string,
	value: string,
	options: CookieOptions = {},
) {
	let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

	if (options.expires) {
		let expiresStr: string;
		if (typeof options.expires === "number") {
			const d = new Date();
			d.setTime(d.getTime() + options.expires * 24 * 60 * 60 * 1000);
			expiresStr = d.toUTCString();
		} else {
			expiresStr = options.expires.toUTCString();
		}
		cookieStr += `; expires=${expiresStr}`;
	}

	if (options.path) cookieStr += `; path=${options.path}`;
	if (options.domain) cookieStr += `; domain=${options.domain}`;
	if (options.secure) cookieStr += `; secure`;
	if (options.sameSite) cookieStr += `; samesite=${options.sameSite}`;

	document.cookie = cookieStr;
}
