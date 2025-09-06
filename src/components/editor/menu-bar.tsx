import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	KEY_DOWN_COMMAND,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Maximize, Meh, Shrink, Smile } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { ListActions } from './list-actions';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/react';

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
	const [isSelecting, setIsSelecting] = useState(false);
	const [isPositioned, setIsPositioned] = useState(false)
  const isTypingRef = useRef(false);

  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'top',
    middleware: [
      offset(10),
      flip({ padding: 10 }),
      shift({ padding: 10 }),
    ],
  });

	const hideMenu = useCallback(() => {
    setShowActions(false);
    setIsPositioned(false);
  }, []);

  const updateMenu = useCallback(() => {
    editor.getEditorState().read(() => {
      // Don't show menu if the editor is composing an update.
      if (editor.isComposing())
        return;


      const selection = $getSelection();
      const nativeSelection = window.getSelection();

      if (
        !nativeSelection ||
        !$isRangeSelection(selection) ||
        !editor.getRootElement()?.contains(nativeSelection.anchorNode)
      ) {
        hideMenu()
        return;
      }

      const domRange = nativeSelection.getRangeAt(0);
      refs.setReference({
        getBoundingClientRect: () => domRange.getBoundingClientRect(),
      });
      setShowActions(true);
			setIsPositioned(true);
    });
  }, [editor, refs]);

	useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handlePointerDown = () => {
      setIsSelecting(true);
    };
    const handlePointerUp = () => {
      setIsSelecting(false);
    };

    rootElement.addEventListener('pointerdown', handlePointerDown);
    rootElement.addEventListener('pointerup', handlePointerUp);

    return () => {
      rootElement.removeEventListener('pointerdown', handlePointerDown);
      rootElement.removeEventListener('pointerup', handlePointerUp);
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
        'absolute z-50 flex gap-2 bg-background rounded-lg',
        'transition-opacity duration-200 ease-in-out',
        showActions ? 'opacity-100 transition' : 'opacity-0 pointer-events-none',
				isSelecting && 'pointer-events-none',
				isPositioned && 'transition-transform duration-200 ease-in-out'
      )}
    >
			<InlineTextActions />
			<ListActions />
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
						<ListActions />
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
