import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { nanoid } from "nanoid";
import { generateTitle } from "@/lib/generateTitle";

export interface NotesDB extends DBSchema {
	notes: {
		key: string;
		value: {
			id: string;
			name: string;
			editorState: string;
			createdAt: number;
			updatedAt: number;
			deleted: boolean;
		};
		indexes: { "by-name": string; "by-updatedAt": number };
	};

	outbox: {
		key: string;
		value: {
			id: string;
			op: "upsert" | "delete";
			noteId: string;
			payload: Partial<NotesDB["notes"]["value"]>;
			createdAt: number;
			attempt: number;
		};
	};

	metadata: {
		key: string;
		value: { id: string; lastPulledAt: number | null };
	};
}

const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<NotesDB>> | null = null;
export const connectToDB = async () => {
	if (dbPromise) return dbPromise;

	dbPromise = openDB<NotesDB>("notes-app", DB_VERSION, {
		upgrade(db, oldVersion, newVersion) {
			console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
			if (!db.objectStoreNames.contains("notes")) {
				console.log("Creating 'notes' store...");

				const notesStore = db.createObjectStore("notes", {
					keyPath: "id",
				});

				notesStore.createIndex("by-name", "name");
				notesStore.createIndex("by-updatedAt", "updatedAt");
			}
			if (!db.objectStoreNames.contains("outbox"))
				db.createObjectStore("outbox", { keyPath: "id" });
			if (!db.objectStoreNames.contains("metadata"))
				db.createObjectStore("metadata", { keyPath: "id" });
		},
	});

	return dbPromise;
};

export const dbCreateNote = async (name?: string, editorState = "") => {
	const db = await connectToDB();
	const tx = db.transaction(["notes", "outbox"], "readwrite");
	const notesStore = tx.objectStore("notes");
	const outboxStore = tx.objectStore("outbox");

	let noteName = name;

	if (!noteName) {
		noteName = generateTitle();
	}

	const timestamp = Date.now();
	const note = {
		id: nanoid(),
		name: noteName,
		editorState,
		createdAt: timestamp,
		updatedAt: timestamp,
		deleted: false,
	};

	await notesStore.put(note);

	await outboxStore.add({
		id: nanoid(),
		op: "upsert",
		noteId: note.id,
		payload: note,
		createdAt: timestamp,
		attempt: 0,
	});

	await tx.done;
	return note;
};

export const dbSaveNote = async (id: string, editorState: string) => {
	const db = await connectToDB();
	const tx = db.transaction(["notes", "outbox"], "readwrite");
	const notesStore = tx.objectStore("notes");
	const outboxStore = tx.objectStore("outbox");

	const note = await notesStore.get(id);

	if (!note) throw new Error(`Note '${id}' not found`);

	const timestamp = Date.now();
	const updated = { ...note, editorState, updatedAt: timestamp };

	await notesStore.put(updated);

	await outboxStore.add({
		id: nanoid(),
		op: "upsert",
		noteId: id,
		payload: updated,
		createdAt: timestamp,
		attempt: 0,
	});

	await tx.done;
	return updated;
};

export const dbDeleteNote = async (id: string) => {
	const db = await connectToDB();
	const tx = db.transaction(["notes", "outbox"], "readwrite");
	const notesStore = tx.objectStore("notes");
	const outboxStore = tx.objectStore("outbox");

	const note = await notesStore.get(id);
	if (!note) throw new Error(`Could not delete note ${id}`);

	const timestamp = Date.now();
	const tombstone = { ...note, deleted: true, updatedAt: timestamp };

	await notesStore.put(tombstone);

	await outboxStore.add({
		id: nanoid(),
		op: "delete",
		noteId: id,
		payload: tombstone,
		createdAt: timestamp,
		attempt: 0,
	});

	await tx.done;
	return tombstone;
};

export const dbGetNotes = async () => {
	const db = await connectToDB();
	const tx = db.transaction("notes", "readonly");
	const store = tx.objectStore("notes");
	return store.getAll();
};

export const dbGetNote = async (id: string) => {
	const db = await connectToDB();
	const tx = db.transaction("notes", "readonly");
	const store = tx.objectStore("notes");
	const note = await store.get(id);

	if (!note) throw new Error(`Note ${id} was not found`);

	return note;
};

export const dbGetLastPulledAt = async () => {
	const db = await connectToDB();
	return (await db.get("metadata", "sync"))?.lastPulledAt ?? null;
};

export const dbSetLastPulledAt = async (timestamp: number) => {
	const db = await connectToDB();
	await db.put("metadata", { id: "sync", lastPulledAt: timestamp });
};
