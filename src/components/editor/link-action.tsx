import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	SELECTION_CHANGE_COMMAND,
	// COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import { Link, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function LinkAction() {
	const [editor] = useLexicalComposerContext();
	const [isLink, setIsLink] = useState(false);

	const insertOrRemoveLink = () => {
		editor.update(() => {
			const selection = $getSelection();

			if ($isRangeSelection(selection)) {
				if (isLink) {
					editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
					setIsLink(false);
				} else {
					const linkUrl = window.prompt("Enter the URL");
					if (linkUrl) {
						editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
					}
				}
			}
		});
	};

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				const selection = $getSelection();
				const parent = selection?.getNodes()?.[0]?.getParent();
				setIsLink($isLinkNode(parent));
				return false;
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor]);

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			onClick={insertOrRemoveLink}
			className="dark:bg-transparent bg-transparent"
		>
			{isLink ? <Unlink /> : <Link />}
		</Button>
	);
}
