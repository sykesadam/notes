import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getWebRequest, setResponseStatus } from "@tanstack/react-start/server";
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
		console.log("getWebRequest().headers", getWebRequest().headers);
		const session = await auth.api.getSession({
			headers: getWebRequest().headers,
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
	.validator((data: GetRemoteNotes) => data)
	.handler(async (ctx) => {
		const { lastPulledAt, changes } = ctx.data;
		const userId = ctx.context.user.id;

		const appliedIds: string[] = [];

		// 1️⃣ Apply local changes → remote
		for (const change of changes) {
			// Upsert payload
			await pushLocalNote(
				{
					...change.payload,
					id: change.noteId,
				},
				userId,
			);

			appliedIds.push(change.noteId);
		}

		// 2️⃣ Pull remote changes since last sync
		const pullNotes = await pullRemoteNotes(userId, lastPulledAt);

		// 3️⃣ New sync cursor (timestamp of this sync)
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
			notesStore.put(remoteNote);
		}
	}

	// Update lastPulledAt
	await tx.objectStore("metadata").put({ id: "sync", lastPulledAt: cursor });

	await tx.done;

	return { success: true };
};
