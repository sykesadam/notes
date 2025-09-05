import { type DBSchema, openDB } from "idb";
import { nanoid } from "nanoid";

export interface NotesDB extends DBSchema {
	notes: {
		key: string;
		value: {
			id: string;
			name: string;
			editorState: string;
			createdAt: number;
			updatedAt: number;
		};
		indexes: { "by-name": string };
	};
}

const DB_VERSION = 1;

export const connectToDB = async () => {
	return openDB<NotesDB>("notes-app", DB_VERSION, {
		upgrade(db, oldVersion, newVersion) {
			console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
			if (!db.objectStoreNames.contains("notes")) {
				console.log("Creating 'notes' store...");

				const notesStore = db.createObjectStore("notes", {
					keyPath: "id",
				});

				notesStore.createIndex("by-name", "name");
			}
		},
	});
};

export const createNote = async (name: string, editorState = "") => {
	const db = await connectToDB();
	const tx = db.transaction("notes", "readwrite");
	const store = tx.objectStore("notes");
	const timestamp = Date.now();
	const newNote = await store.put({
		id: nanoid(),
		name,
		editorState: editorState,
		createdAt: timestamp,
		updatedAt: timestamp,
	});
	await tx.done;

	console.log(`Note '${name}' created.`);

	return newNote;
};

export const getNotes = async () => {
	const db = await connectToDB();
	const tx = db.transaction("notes", "readonly");
	const store = tx.objectStore("notes");
	return store.getAll();
};

export const getNote = async (id: string) => {
	const db = await connectToDB();
	const tx = db.transaction("notes", "readonly");
	const store = tx.objectStore("notes");
	return store.get(id);
};

export const saveNote = async (id: string, markdown: string) => {
	const db = await connectToDB();
	const tx = db.transaction("notes", "readwrite");
	const store = tx.objectStore("notes");
	const note = await store.get(id);

	const timestamp = Date.now();

	if (note) {
		await store
			.put({
				...note,
				editorState: markdown,
				updatedAt: timestamp,
			})
			.catch((e) => {
				console.error("Error updating note:", e);
			});
	} else {
		console.warn(`Note '${id}' not found.`);
	}
};
