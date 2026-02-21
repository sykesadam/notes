import { Maximize, Meh, Shrink, Smile } from "lucide-react";
import { useState } from "react";
import {
	cn,
	getEditorSizeLocalStorage,
	setEditorSizeLocalStorage,
} from "@/lib/utils";
import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { FloatingActions } from "./floating-actions";
import { HistoryActions } from "./history-actions";
import { InlineTextActions } from "./inline-text-actions";
import { LinkAction } from "./link-action";
import { ListActions } from "./list-actions";
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
			el.dataset.editorSize = newValue;
		}
	};

	return (
		<Button
			className="hidden md:flex bg-transparent dark:bg-transparent"
			type="button"
			variant="outline"
			size="icon"
			onClick={handleClick}
		>
			{editorWidth === "default" ? <Shrink /> : <Maximize />}
		</Button>
	);
};

export function MenuBar() {
	const [zenMode, setZenMode] = useState(false);

	return (
		<>
			<div
				className={cn(
					"flex gap-2 sticky top-0 py-4 flex-wrap gap-y-2 sm:gap-y-6",
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
						<LinkAction />
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
