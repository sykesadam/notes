import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	KEY_,
	KEY_DOWN_COMMAND,
} from "lexical";
import { Maximize, Meh, Shrink, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	cn,
	getEditorSizeLocalStorage,
	setEditorSizeLocalStorage,
} from "@/lib/utils";
import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { HistoryActions } from "./history-actions";
import { InlineTextActions } from "./inline-text-actions";
import { TagChangeActions } from "./tag-change-action";

const EditorResize = () => {
	const [editorWidth, setEditorWidth] = useState<"narrow" | "default">(
		getEditorSizeLocalStorage() ?? "default",
	);

	const handleClick = () => {
		const newValue = editorWidth === "default" ? "narrow" : "default";
		setEditorWidth(newValue);
		setEditorSizeLocalStorage(newValue);

		const el = document.querySelector("[data-id='editor-wrapper']") as
			| HTMLElement
			| undefined;
		if (el) {
			console.log(el.dataset);
			el.dataset.editorSize = newValue;
		}
	};

	return (
		<Button
			className="hidden md:flex"
			type="button"
			variant="outline"
			size="icon"
			onClick={handleClick}
		>
			{editorWidth === "default" ? <Shrink /> : <Maximize />}
		</Button>
	);
};

const FloatingActions = () => {
	const [editor] = useLexicalComposerContext();
	const [showActions, setShowActions] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const [isTyping, setIsTyping] = useState(false);
	const actionsRef = useRef<HTMLDivElement>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

	useEffect(() => {
		// Register keyboard command to detect typing
		return editor.registerCommand(
			KEY_DOWN_COMMAND,
			() => {
				setIsTyping(true);

				// Clear previous timeout
				if (typingTimeoutRef.current) {
					clearTimeout(typingTimeoutRef.current);
				}

				// Reset typing state after 1 second of no typing
				typingTimeoutRef.current = setTimeout(() => {
					setIsTyping(false);
				}, 1000);

				return false; // Let other plugins handle the command
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor]);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const selection = $getSelection();

				if (!selection || isTyping) {
					setShowActions(false);
					return;
				}

				// TODO: have some sort of debounce so I dont change position so much when making selection

				const domSelection = window.getSelection();
				const domRange = domSelection?.getRangeAt(0);
				const rect = domRange?.getBoundingClientRect();

				console.log(rect);

				if (rect) {
					setPosition({
						top: rect.top + window.scrollY,
						left: rect.left + window.scrollX,
					});
				}

				setShowActions(true);
			});
		});
	}, [editor, isTyping]);

	console.log(position);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div
			ref={actionsRef}
			className={cn(
				"absolute z-50 flex gap-2 bg-background/85 backdrop-blur-sm shadow-md transition duration-200 translate-y-[calc(-100%-0.5rem)] -translate-x-1/2",
				showActions
					? "opacity-100 scale-100"
					: "opacity-0 scale-0 pointer-events-none",
			)}
			style={{
				top: `${position.top ?? 16}px`,
				left: `${position.left}px`,
			}}
		>
			<InlineTextActions />
			<TagChangeActions variant="minimal" />
		</div>
	);
};

export function MenuBar() {
	const [zenMode, setZenMode] = useState(false);

	return (
		<>
			<div
				className={cn(
					"flex gap-2 sticky top-0 py-4",
					!zenMode && "bg-background/85 backdrop-blur-sm",
					zenMode && "w-fit ml-auto",
				)}
			>
				{!zenMode && (
					<>
						<HistoryActions />
						<InlineTextActions />
						<TagChangeActions />
					</>
				)}

				<div className="ml-auto flex gap-2">
					{!zenMode && <EditorResize />}

					<Toggle
						aria-label="Toggle Zen"
						variant="outline"
						pressed={zenMode}
						onPressedChange={setZenMode}
					>
						{zenMode ? <Smile /> : <Meh />}
						Zen
					</Toggle>
				</div>
			</div>

			{zenMode && <FloatingActions />}
		</>
	);
}
