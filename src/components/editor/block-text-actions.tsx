import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createQuoteNode, $isQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode, $getSelection } from "lexical";
import { Code2, Quote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const possibleTextFormats = ["code", "quote"] as const;

type Icons = keyof typeof icons;

const icons = {
	code: Code2,
	quote: Quote,
};

export const BlockTextActions = ({ className }: { className?: string }) => {
	const [value, setValue] = useState<Icons | "">("");
	const [editor] = useLexicalComposerContext();

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();

		if (!selection) return;

		const nodes = selection.getNodes();
		const parentNode = nodes[0].getParent();

		if (!parentNode) {
			setValue("");
			return;
		}

		if ($isCodeNode(parentNode)) {
			setValue("code");
		} else if ($isQuoteNode(parentNode)) {
			setValue("quote");
		} else {
			setValue("");
		}
	}, []);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateToolbar();
			});
		});
	}, [editor, updateToolbar]);

	const handleChange = (val: Icons) => {
		setValue(val);

		editor.update(() => {
			const selection = $getSelection();

			if (!selection) return;

			if (val === "quote") {
				$setBlocksType(selection, () => $createQuoteNode());
			} else if (val === "code") {
				$setBlocksType(selection, () => $createCodeNode());
			} else {
				$setBlocksType(selection, () => $createParagraphNode());
			}
		});
	};

	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={handleChange}
			className={className}
		>
			{possibleTextFormats.map((format) => {
				const Icon = icons[format];
				return (
					<ToggleGroupItem
						key={format}
						variant="outline"
						value={format}
						aria-label={format}
					>
						<Icon />
					</ToggleGroupItem>
				);
			})}
		</ToggleGroup>
	);
};
