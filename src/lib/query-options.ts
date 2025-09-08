import {
	mutationOptions,
	queryOptions,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	dbCreateNote,
	dbDeleteNote,
	dbGetNote,
	dbGetNotes,
	dbSaveNote,
} from "@/lib/db/local/notes";
import { syncNotes } from "./db/sync";

const queryKeys = {
	notes: ["notes"] as const,
	note: (id: string) => ["note", id] as const,
};

export const hydrateCache = () => {
	const qc = useQueryClient();

	return useQuery({
		queryKey: ["app-hydration"],
		queryFn: async () => {
			const notes = (await dbGetNotes()).filter((n) => !n.deleted);

			qc.setQueryData(getNotesQueryOptions().queryKey, notes);

			for (const note of notes) {
				qc.setQueryData(getNoteQueryOptions(note.id).queryKey, note);
			}

			return {
				success: true,
			};
		},
	});
};

// Get all notes
export const getNotesQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.notes,
		queryFn: async () => {
			const notes = await dbGetNotes();
			return notes.filter((n) => !n.deleted);
		},
	});

// Get single note
export const getNoteQueryOptions = (id: string) =>
	queryOptions({
		queryKey: queryKeys.note(id),
		queryFn: async () => dbGetNote(id),
	});

// Create note
export function createNoteMutationOptions() {
	const qc = useQueryClient();

	return mutationOptions({
		mutationFn: async (payload: { name?: string; editorState?: string }) => {
			const note = await dbCreateNote(payload.name, payload.editorState);
			return note;
		},
		onSuccess: (note) => {
			qc.setQueryData(getNoteQueryOptions(note.id).queryKey, note);
			qc.invalidateQueries(getNotesQueryOptions());
		},
	});
}

// Save/update note
export const saveNoteMutationOptions = () => {
	const qc = useQueryClient();

	return mutationOptions({
		mutationFn: async ({
			id,
			editorState,
		}: {
			id: string;
			editorState: string;
		}) => dbSaveNote(id, editorState),
		onSuccess: (note) => {
			qc.setQueryData(getNoteQueryOptions(note.id).queryKey, note);
			qc.invalidateQueries(getNotesQueryOptions());
		},
	});
};

// Delete note
export function deleteNoteMutationOptions() {
	const qc = useQueryClient();

	return mutationOptions({
		mutationFn: async (id: string) => dbDeleteNote(id),
		onSuccess: ({ id }) => {
			qc.removeQueries(getNoteQueryOptions(id));
			qc.invalidateQueries(getNotesQueryOptions());
		},
	});
}

export function useBackgroundSync(enabled: boolean) {
	const qc = useQueryClient();

	return useQuery({
		enabled: enabled,
		queryKey: ["syncNotes"],
		queryFn: async () => {
			const result = await syncNotes();

			if (result.success) {
				qc.invalidateQueries(getNotesQueryOptions());
				qc.setQueryData(
					getNotesQueryOptions().queryKey,
					result.notes.filter((note) => !note.deleted),
				);

				result.notes.forEach((note) => {
					if (note.deleted) return;
					qc.setQueryData(getNoteQueryOptions(note.id).queryKey, note);
				});
			}

			return result;
		},
		retry: 2,
		refetchInterval: 120_000, // every 2 minutes
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		staleTime: Infinity,
	});
}
