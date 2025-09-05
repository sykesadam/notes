import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	FORMAT_TEXT_COMMAND,
	type TextFormatType,
} from "lexical";
import { Bold, Code, Italic, Strikethrough, Underline } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const possibleTextFormats = [
	"bold",
	"italic",
	"underline",
	"strikethrough",
	"code",
] as const;

const icons = {
	bold: Bold,
	italic: Italic,
	underline: Underline,
	strikethrough: Strikethrough,
	code: Code,
};

export const InlineTextActions = ({ className }: { className?: string }) => {
	const [value, setValue] = useState<string[]>([]);
	const [editor] = useLexicalComposerContext();

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();

		if (!$isRangeSelection(selection)) return;

		const formats = new Set<TextFormatType>();

		// Check all possible text formats and update the set
		for (const format of possibleTextFormats) {
			if (selection.hasFormat(format)) {
				formats.add(format);
			} else {
				formats.delete(format);
			}
		}

		setValue(Array.from(formats));
	}, []);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateToolbar();
			});
		});
	}, [editor, updateToolbar]);

	const handleChange = (val: TextFormatType[]) => {
		setValue(val);

		for (const format of val) {
			editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
		}
	};

	return (
		<ToggleGroup
			type="multiple"
			value={value}
			onValueChange={handleChange}
			className={className}
		>
			{possibleTextFormats.map((format) => {
				const Icon = icons[format];
				return (
					<ToggleGroupItem
						key={format}
						value={format}
						aria-label={format}
						variant="outline"
					>
						<Icon />
					</ToggleGroupItem>
				);
			})}
		</ToggleGroup>
	);
};
