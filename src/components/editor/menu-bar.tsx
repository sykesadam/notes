import { Maximize, Meh, Shrink, Smile } from "lucide-react";
import { useState } from "react";
import {
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

export function MenuBar() {
	const [zenMode, setZenMode] = useState(false);

	return (
		<div className="flex gap-2 sticky top-8 bg-white">
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
	);
}
