import {
	autoUpdate,
	limitShift,
	offset,
	shift,
	size,
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
	const isTypingRef = useRef(false);

	const editorWidth = editor.getRootElement()?.clientWidth || 0;

	const { refs, floatingStyles } = useFloating({
		whileElementsMounted: autoUpdate,
		placement: "top",
		middleware: [
			offset(10),

			size({
				apply({ elements }) {
					Object.assign(elements.floating.style, {
						maxWidth: editorWidth + "px",
						width: editorWidth + "px",
					});
				},
			}),
			shift({
				padding: {
					left: editor.getRootElement()?.getBoundingClientRect().left || 0,
					right:
						window.innerWidth -
							(editor.getRootElement()?.getBoundingClientRect().left || 0) -
							editorWidth || 0,
				},
				crossAxis: false,
				limiter: limitShift(),
			}),
		],
	});

	const hideMenu = useCallback(() => {
		setShowActions(false);
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
			let rect = domRange.getBoundingClientRect();

			if (rect.width === 0 && rect.height === 0) {
				// If selection is empty (cursor in empty paragraph), use cursor position
				const span = document.createElement("span");
				span.textContent = "|";
				span.style.position = "absolute";
				span.style.visibility = "hidden";
				const tempRange = domRange.cloneRange();
				tempRange.insertNode(span);
				rect = span.getBoundingClientRect();
				span.parentNode?.removeChild(span);
			}
			refs.setReference({
				getBoundingClientRect: () => rect,
			});
			setShowActions(true);
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
				if (isTypingRef.current) {
					isTypingRef.current = false;
					return false;
				}

				updateMenu();

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
			style={{
				...floatingStyles,
			}}
			className={cn(
				"overflow-x-auto",
				"absolute z-50 flex gap-1 bg-background rounded-lg",
				"transition-transform duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
				showActions
					? "opacity-100 transition"
					: "opacity-0 pointer-events-none",
				isSelecting && "pointer-events-none",
			)}
		>
			<InlineTextActions size="sm" />
			<ListActions size="sm" />
			<TagChangeActions variant="minimal" size="sm" />
			<LinkAction size="sm" />
		</div>
	);
};
