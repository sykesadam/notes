import { eq } from "drizzle-orm";
import { type LocalNote, localToRemote, remoteToLocal } from "../adapters";
import { db } from "./db";
import { notes } from "./schema";

export async function pullRemoteNotes(userId: string, lastPulledAt: number) {
	const rows = await db.query.notes.findMany({
		where: (n, { eq, and }) => and(eq(n.userId, userId), eq(n.deleted, false)),
	});

	return rows.map(remoteToLocal);
}

export async function pushLocalNote(localNote: LocalNote, userId: string) {
	const remoteNote = localToRemote(localNote, userId);

	const [existing] = await db
		.select()
		.from(notes)
		.where(eq(notes.id, localNote.id));

	if (!existing) {
		// If no existing note, insert
		await db.insert(notes).values(remoteNote);
		return { id: localNote.id, applied: true };
	}

	if (localNote.updatedAt > existing.updatedAt.getTime()) {
		// If local note is newer, update
		await db
			.update(notes)
			.set({
				name: localNote.name,
				editorState: localNote.editorState,
				deleted: localNote.deleted,
				updatedAt: new Date(localNote.updatedAt),
			})
			.where(eq(notes.id, localNote.id));

		return { id: localNote.id, applied: true };
	}

	// Local note is older → do nothing
	return { id: localNote.id, applied: false };
}
