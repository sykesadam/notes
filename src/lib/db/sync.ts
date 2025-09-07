import { createServerFn } from "@tanstack/react-start";
import { connectToDB } from "./local/notes";

interface GetRemoteNotes {
	lastPulledAt: number;
	changes: Array<{
		op: "upsert" | "delete";
		noteId: string;
		payload: Partial<{
			id: string;
			name: string;
			editorState: string;
			createdAt: number;
			updatedAt: number;
			deleted: boolean;
		}>;
		createdAt: number;
	}>;
}

// TODO: this should actually only happen if authenticated
const serverNotesSyncFn = createServerFn()
	.validator((data: GetRemoteNotes) => data)
	.handler(async (ctx) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// TODO: connect to remote db

		const { lastPulledAt, changes } = ctx.data;

		const appliedIds: string[] = [];

		// // 1️⃣ Apply incoming changes (LWW)
		// for (const change of changes) {
		// 	const existing = await db.notes.findById(change.noteId);
		// 	if (!existing || change.payload.updatedAt >= existing.updatedAt) {
		// 		await db.notes.upsert(change.payload);
		// 	}
		// 	appliedIds.push(change.noteId);
		// }

		// // 2️⃣ Pull changes since lastPulledAt
		// const pullNotes = await db.notes
		// 	.where("updatedAt")
		// 	.gt(lastPulledAt)
		// 	.toArray();

		// // 3️⃣ Next cursor
		const cursor = Date.now(); // or server-generated timestamp

		// return {
		// 	appliedIds,
		// 	pull: { notes: pullNotes },
		// 	cursor,
		// };

		return {
			appliedIds,
			pull: {
				notes: [
					{
						id: "string",
						name: "string",
						editorState: "string",
						createdAt: 123,
						updatedAt: 123,
						deleted: false,
					},
				],
			},
			cursor,
		};
	});

export const syncNotes = async () => {
	const db = await connectToDB();

	// 1️⃣ Get last sync timestamp
	const metadata = await db.get("metadata", "sync");
	const lastPulledAt = metadata?.lastPulledAt ?? 0;

	// 2️⃣ Get all pending outbox items
	const outboxItems = await db.getAll("outbox");
	const payload = outboxItems.map((item) => ({
		op: item.op,
		noteId: item.noteId,
		payload: item.payload,
		createdAt: item.createdAt,
	}));

	const response = await serverNotesSyncFn({
		data: {
			lastPulledAt,
			changes: payload,
		},
	});

	if (!response) {
		return { success: false };
	}

	const { appliedIds, pull, cursor } = response;

	// 5️⃣ Remove applied items from outbox
	const tx = db.transaction(["outbox", "notes", "metadata"], "readwrite");

	for (const id of appliedIds) {
		await tx.objectStore("outbox").delete(id);
	}

	// Merge pulled notes
	const notesStore = tx.objectStore("notes");
	for (const remoteNote of pull.notes) {
		const local = await notesStore.get(remoteNote.id);
		if (!local || remoteNote.updatedAt >= local.updatedAt) {
			await notesStore.put(remoteNote);
		}
	}

	// Update lastPulledAt
	await tx.objectStore("metadata").put({ id: "sync", lastPulledAt: cursor });

	await tx.done;

	return { success: true };
};
