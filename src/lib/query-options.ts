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

// Get all notes
export const getNotesQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.notes,
		queryFn: async () => {
			const notes = await dbGetNotes();
			return notes
				.filter((n) => !n.deleted)
				.sort((a, b) => b.updatedAt - a.updatedAt);
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
export function useDeleteNote() {
	const qc = useQueryClient();

	return mutationOptions({
		mutationFn: async (id: string) => dbDeleteNote(id),
		onSuccess: ({ id }) => {
			qc.removeQueries(getNoteQueryOptions(id));
			qc.invalidateQueries(getNotesQueryOptions());
		},
	});
}

export function useBackgroundSync() {
	const qc = useQueryClient();

	return useQuery({
		queryKey: ["syncNotes"],
		queryFn: async () => {
			const result = await syncNotes();

			if (result.success) {
				qc.invalidateQueries(getNotesQueryOptions());
			}

			return result;
		},
		refetchInterval: 15_000, // every 15 seconds
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		staleTime: Infinity,
	});
}
