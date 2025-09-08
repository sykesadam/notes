import { eq } from "drizzle-orm";
import { type LocalNote, remoteToLocal } from "../adapters";
import { db } from "./db";
import { notes } from "./schema";

export async function pullRemoteNotes(userId: string, lastPulledAt: number) {
	const rows = await db.query.notes.findMany({
		where: (n, { and, eq, gt }) =>
			and(eq(n.userId, userId), gt(n.updatedAt, new Date(lastPulledAt))),
	});

	return rows.map(remoteToLocal);
}

export async function pushLocalNote(note: LocalNote, userId: string) {
	const [existing] = await db.select().from(notes).where(eq(notes.id, note.id)); // ✅ use eq() here

	// If no existing note, insert it
	if (!existing) {
		await db.insert(notes).values({
			...note,
			userId,
			createdAt: new Date(note.createdAt),
			updatedAt: new Date(note.updatedAt),
		});
		return;
	}

	// LWW: Only update if incoming note is newer
	if (note.updatedAt > existing.updatedAt.getTime()) {
		await db
			.update(notes)
			.set({
				name: note.name,
				editorState: note.editorState,
				deleted: note.deleted,
				updatedAt: new Date(note.updatedAt),
			})
			.where(eq(notes.id, note.id));
	}
}
