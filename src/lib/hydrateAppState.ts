import type { QueryClient } from "@tanstack/react-query";
import { dbGetNotes } from "./db/local/notes";
import { getNoteQueryOptions, getNotesQueryOptions } from "./query-options";

let hydrated = false;

export async function hydrateNotesFromDB(queryClient: QueryClient) {
	if (hydrated) return; // ✅ only once
	hydrated = true;

	const notes = (await dbGetNotes())
		.filter((n) => !n.deleted)
		.sort((a, b) => b.updatedAt - a.updatedAt);

	queryClient.setQueryData(getNotesQueryOptions().queryKey, notes);
	for (const note of notes) {
		queryClient.setQueryData(getNoteQueryOptions(note.id).queryKey, note);
	}
}
