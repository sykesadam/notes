import { createMiddleware, createServerFn } from "@tanstack/react-start";
import {
	getRequestHeaders,
	setResponseStatus,
} from "@tanstack/react-start/server";
import { auth } from "../auth";
import type { LocalNote } from "./adapters";
import { connectToDB } from "./local/notes";
import { pullRemoteNotes, pushLocalNote } from "./remote/functions";

interface GetRemoteNotes {
	lastPulledAt: number;
	changes: Array<{
		op: "upsert" | "delete";
		noteId: string;
		payload: LocalNote;
		createdAt: number;
	}>;
}

export const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({
			headers,
			query: {
				// ensure session is fresh
				// https://www.better-auth.com/docs/concepts/session-management#session-caching
				disableCookieCache: true,
			},
		});

		if (!session) {
			setResponseStatus(401);
			throw new Error("Unauthorized");
		}

		return next({ context: { user: session.user } });
	},
);

export const serverNotesSyncFn = createServerFn({
	method: "POST",
})
	.middleware([authMiddleware])
	.inputValidator((data: GetRemoteNotes) => data)
	.handler(async (ctx) => {
		const { lastPulledAt, changes } = ctx.data;
		const userId = ctx.context.user.id;

		const appliedIds: string[] = [];

		// 1️⃣ Apply incoming local changes → remote DB (LWW)
		for (const change of changes) {
			const result = await pushLocalNote(
				{ ...change.payload, id: change.noteId },
				userId,
			);

			if (result.applied) {
				appliedIds.push(change.noteId);
			}
		}

		// 2️⃣ Pull remote notes since last sync
		const pullNotes = await pullRemoteNotes(userId, lastPulledAt);

		// 3️⃣ New sync cursor (timestamp)
		const cursor = Date.now();

		return {
			appliedIds,
			pull: { notes: pullNotes },
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

	// 3️⃣ Call server sync
	const response = await serverNotesSyncFn({
		data: { lastPulledAt, changes: payload },
	});

	if (!response) return { success: false, notes: [] };

	const { appliedIds: serverAppliedIds, pull, cursor } = response;

	const tx = db.transaction(["outbox", "notes", "metadata"], "readwrite");
	const notesStore = tx.objectStore("notes");
	const outboxStore = tx.objectStore("outbox");

	// 4️⃣ Build local notes map
	const localNotesMap: Record<string, (typeof pull.notes)[0]> = {};
	for (const note of await notesStore.getAll()) {
		localNotesMap[note.id] = note;
	}

	// 5️⃣ Merge pulled notes using Last-Write-Wins
	for (const remoteNote of pull.notes) {
		const local = localNotesMap[remoteNote.id];
		if (!local || remoteNote.updatedAt >= local.updatedAt) {
			await notesStore.put(remoteNote);
			localNotesMap[remoteNote.id] = remoteNote;
		}
	}

	// 6️⃣ Remove outbox items for notes successfully pushed
	for (const id of serverAppliedIds) {
		await outboxStore.delete(id);
	}

	// 7️⃣ Update lastPulledAt
	await tx.objectStore("metadata").put({ id: "sync", lastPulledAt: cursor });
	await tx.done;

	// 8️⃣ Return updated notes
	return { success: true, notes: Object.values(localNotesMap) };
};
