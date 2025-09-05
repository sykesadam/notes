import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createHeadingNode,
	$createQuoteNode,
	$isHeadingNode,
	$isQuoteNode,
	type HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode, $getSelection, $isParagraphNode } from "lexical";
import {
	Code2,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Pilcrow,
	Quote,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const possibleTags = [
	{ tag: "p", label: "Paragraph" },
	{ tag: "h1", label: "Heading 1" },
	{ tag: "h2", label: "Heading 2" },
	{ tag: "h3", label: "Heading 3" },
	{ tag: "h4", label: "Heading 4" },
	{ tag: "h5", label: "Heading 5" },
	{ tag: "code", label: "Code block" },
	{ tag: "quote", label: "Quote" },
] as const;

const getLabel = (tag: string | undefined) => {
	return possibleTags.find((item) => item.tag === tag)?.label;
};

const icons = {
	p: Pilcrow,
	h1: Heading1,
	h2: Heading2,
	h3: Heading3,
	h4: Heading4,
	h5: Heading5,
	code: Code2,
	quote: Quote,
} as const;

const Icon = ({ id }: { id: string }) => {
	const Comp = icons[id as keyof typeof icons];

	if (!Comp) return null;

	return <Comp className="text-foreground" strokeWidth={1.5} />;
};

export const TagChangeActions = () => {
	const [value, setValue] = useState<string>();
	const [editor] = useLexicalComposerContext();

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();

		if (!selection) {
			console.log("här2?");

			setValue(undefined);
			return;
		}

		const nodes = selection.getNodes();
		const node = nodes[0];
		const parentNode = node.getParent();

		if (!parentNode) {
			setValue(undefined);
			return;
		}

		if ($isCodeNode(parentNode)) {
			setValue("code");
		} else if ($isQuoteNode(parentNode)) {
			setValue("quote");
		} else if ($isHeadingNode(parentNode)) {
			setValue(parentNode.getTag());
		} else if ($isParagraphNode(parentNode)) {
			setValue("p");
		} else if ($isHeadingNode(node)) {
			setValue(node.getTag());
		} else if ($isParagraphNode(node)) {
			setValue("p");
		} else {
			console.warn("fan hit vill man ju inte komma asså");
			setValue(undefined);
		}
	}, []);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateToolbar();
			});
		});
	}, [editor, updateToolbar]);

	const handleChange = (val: string) => {
		setValue(val);

		editor.update(() => {
			const selection = $getSelection();

			if (!selection) return;

			switch (val) {
				case "p":
					$setBlocksType(selection, () => $createParagraphNode());
					break;
				case "code":
					$setBlocksType(selection, () => $createCodeNode());
					break;
				case "quote":
					$setBlocksType(selection, () => $createQuoteNode());
					break;
				case "h1":
				case "h2":
				case "h3":
				case "h4":
					$setBlocksType(selection, () =>
						$createHeadingNode(val as HeadingTagType),
					);
					break;
				default:
					break;
			}
		});
	};

	return (
		<Select value={value} onValueChange={handleChange}>
			<SelectTrigger className="w-[170px]">
				<SelectValue placeholder="No selection">
					{value && <Icon id={value} />}
					{getLabel(value)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{possibleTags.map(({ tag, label }) => (
					<SelectItem key={tag} value={tag}>
						<Icon id={tag} />
						{label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
