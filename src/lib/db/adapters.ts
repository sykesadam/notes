import type { InsertNote, RemoteNote } from "./remote/schema";

export interface LocalNote {
	id: string;
	name: string;
	editorState: string;
	createdAt: number;
	updatedAt: number;
	deleted: boolean;
}

// 1️⃣ Remote (Postgres/Drizzle) → Local (IndexedDB)
export function remoteToLocal(note: RemoteNote): LocalNote {
	return {
		id: note.id,
		name: note.name,
		editorState: note.editorState,
		createdAt: note.createdAt.getTime(),
		updatedAt: note.updatedAt.getTime(),
		deleted: note.deleted,
	};
}

// 2️⃣ Local (IndexedDB) → Remote Insert (for Drizzle upsert)
export function localToRemote(note: LocalNote, userId: string): InsertNote {
	return {
		id: note.id,
		userId,
		name: note.name,
		editorState: note.editorState,
		createdAt: new Date(note.createdAt),
		updatedAt: new Date(note.updatedAt),
		deleted: note.deleted,
	};
}
