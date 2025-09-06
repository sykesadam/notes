import {
	autoUpdate,
	flip,
	offset,
	shift,
	useFloating,
} from "@floating-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	KEY_DOWN_COMMAND,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { InlineTextActions } from "./inline-text-actions";
import { LinkAction } from "./link-action";
import { ListActions } from "./list-actions";
import { TagChangeActions } from "./tag-change-action";

export const FloatingActions = () => {
	const [editor] = useLexicalComposerContext();
	const [showActions, setShowActions] = useState(false);
	const [isSelecting, setIsSelecting] = useState(false);
	const [isPositioned, setIsPositioned] = useState(false);
	const isTypingRef = useRef(false);

	const { refs, floatingStyles } = useFloating({
		whileElementsMounted: autoUpdate,
		placement: "top",
		middleware: [offset(10), flip({ padding: 10 }), shift({ padding: 10 })],
	});

	const hideMenu = useCallback(() => {
		setShowActions(false);
		setIsPositioned(false);
	}, []);

	const updateMenu = useCallback(() => {
		editor.getEditorState().read(() => {
			// Don't show menu if the editor is composing an update.
			if (editor.isComposing()) return;

			const selection = $getSelection();
			const nativeSelection = window.getSelection();

			if (
				!nativeSelection ||
				!$isRangeSelection(selection) ||
				!editor.getRootElement()?.contains(nativeSelection.anchorNode)
			) {
				hideMenu();
				return;
			}

			const domRange = nativeSelection.getRangeAt(0);
			refs.setReference({
				getBoundingClientRect: () => domRange.getBoundingClientRect(),
			});
			setShowActions(true);
			setIsPositioned(true);
		});
	}, [editor, refs, hideMenu]);

	useEffect(() => {
		const rootElement = editor.getRootElement();
		if (!rootElement) return;

		const handlePointerDown = () => {
			setIsSelecting(true);
		};
		const handlePointerUp = () => {
			setIsSelecting(false);
		};

		rootElement.addEventListener("pointerdown", handlePointerDown);
		rootElement.addEventListener("pointerup", handlePointerUp);

		return () => {
			rootElement.removeEventListener("pointerdown", handlePointerDown);
			rootElement.removeEventListener("pointerup", handlePointerUp);
		};
	}, [editor]);

	useEffect(() => {
		// Hide the menu when typing starts.
		const unregisterKeyDown = editor.registerCommand(
			KEY_DOWN_COMMAND,
			() => {
				isTypingRef.current = true;
				setShowActions(false);
				return false;
			},
			COMMAND_PRIORITY_LOW,
		);

		const unregisterSelectionChange = editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				// We use a timeout to allow the KEY_DOWN_COMMAND to run first.
				// This helps us distinguish a selection change from typing vs. a click.
				setTimeout(() => {
					if (isTypingRef.current) {
						isTypingRef.current = false; // Reset the flag
						return;
					}
					updateMenu();
				}, 50); // A small delay is enough

				return false;
			},
			COMMAND_PRIORITY_LOW,
		);

		return () => {
			unregisterKeyDown();
			unregisterSelectionChange();
		};
	}, [editor, updateMenu]);

	return (
		<div
			ref={refs.setFloating}
			style={floatingStyles}
			className={cn(
				"absolute z-50 flex gap-2 bg-background rounded-lg",
				"transition-opacity duration-200 ease-in-out",
				showActions
					? "opacity-100 transition"
					: "opacity-0 pointer-events-none",
				isSelecting && "pointer-events-none",
				isPositioned && "transition-transform duration-200 ease-in-out",
			)}
		>
			<InlineTextActions />
			<ListActions />
			<TagChangeActions variant="minimal" />
			<LinkAction />
		</div>
	);
};
