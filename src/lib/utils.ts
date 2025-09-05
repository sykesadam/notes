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
