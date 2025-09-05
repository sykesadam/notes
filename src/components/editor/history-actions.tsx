import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
} from "lexical";
import { Redo, Undo } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function HistoryActions() {
	const [editor] = useLexicalComposerContext();
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	useEffect(() => {
		const undoListener = editor.registerCommand(
			CAN_UNDO_COMMAND,
			(payload) => {
				setCanUndo(payload);
				return false;
			},
			1,
		);

		const redoListener = editor.registerCommand(
			CAN_REDO_COMMAND,
			(payload) => {
				setCanRedo(payload);
				return false;
			},
			1,
		);

		// Return cleanup function that removes both listeners
		return () => {
			undoListener();
			redoListener();
		};
	}, [editor]);

	return (
		<div className="flex">
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="shadow-none rounded-r-none border-r-0"
				disabled={!canUndo}
				onClick={() => {
					editor.dispatchCommand(UNDO_COMMAND, undefined);
				}}
			>
				<Undo />
			</Button>

			<Button
				type="button"
				variant="outline"
				size="icon"
				className="shadow-none rounded-l-none"
				disabled={!canRedo}
				onClick={() => {
					editor.dispatchCommand(REDO_COMMAND, undefined);
				}}
			>
				<Redo />
			</Button>
		</div>
	);
}
