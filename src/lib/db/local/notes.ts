import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { nanoid } from "nanoid";
import { generateTitle } from "@/lib/generateTitle";
import type { LocalNote } from "../adapters";

export interface NotesDB extends DBSchema {
	notes: {
		key: string;
		value: LocalNote;
		indexes: { "by-name": string; "by-updatedAt": number };
	};

	outbox: {
		key: string;
		value: {
			id: string;
			op: "upsert" | "delete";
			noteId: string;
			payload: LocalNote;
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

	// Check if there is already an outbox item for this note
	const allOutbox = await outboxStore.getAll();
	const existingOutboxItem = allOutbox.find((item) => item.noteId === note.id);

	if (existingOutboxItem) {
		// Replace the payload of the existing outbox item
		await outboxStore.put({
			...existingOutboxItem,
			payload: note,
			createdAt: timestamp,
			op: "upsert",
			attempt: 0,
		});
	} else {
		// Create a new outbox item
		await outboxStore.put({
			id: nanoid(),
			noteId: note.id,
			op: "upsert",
			payload: note,
			createdAt: timestamp,
			attempt: 0,
		});
	}

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

	// Mark note as deleted locally
	await notesStore.put(tombstone);

	// Check if outbox already has an item for this note
	const allOutbox = await outboxStore.getAll();
	const existingOutboxItem = allOutbox.find((item) => item.noteId === id);

	if (existingOutboxItem) {
		// Update existing outbox item with delete operation
		await outboxStore.put({
			...existingOutboxItem,
			payload: tombstone,
			op: "delete",
			createdAt: timestamp,
			attempt: 0,
		});
	} else {
		// Create new outbox item
		await outboxStore.put({
			id: nanoid(),
			noteId: id,
			op: "delete",
			payload: tombstone,
			createdAt: timestamp,
			attempt: 0,
		});
	}

	await tx.done;
	return tombstone;
};

export const dbGetNotes = async () => {
	const db = await connectToDB();
	const tx = db.transaction("notes", "readonly");
	const store = tx.objectStore("notes");
	return ((await store.getAll()) ?? []).sort(
		(a, b) => b.updatedAt - a.updatedAt,
	);
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
