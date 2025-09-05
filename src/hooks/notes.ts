import { getNote, getNotes, saveNote } from "@/lib/db/notes";
import { mutationOptions, queryOptions } from "@tanstack/react-query";

const queryKeys = {
	notes: ["notes"] as const,
	note: (id: string) => ["note", id] as const,
};

export const getNotesQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.notes,
		queryFn: getNotes,
	});

export const getNoteQueryOptions = (id: string) =>
	queryOptions({
		queryKey: queryKeys.note(id),
		queryFn: () => getNote(id),
	});

export const saveNoteMutationOptions = (id: string) => {
	return mutationOptions({
		mutationFn: (editorState: string) => saveNote(id, editorState),
	});
};
