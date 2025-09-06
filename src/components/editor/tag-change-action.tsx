import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $isAutoLinkNode, $isLinkNode } from "@lexical/link";
import { $isListItemNode } from "@lexical/list";
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
	List,
	Pilcrow,
	Quote,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const possibleTags = [
	{ tag: "p", label: "Paragraph", disabled: false },
	{ tag: "li", label: "List item", disabled: true },
	{ tag: "a", label: "Link", disabled: true },
	{ tag: "h1", label: "Heading 1", disabled: false },
	{ tag: "h2", label: "Heading 2", disabled: false },
	{ tag: "h3", label: "Heading 3", disabled: false },
	{ tag: "h4", label: "Heading 4", disabled: false },
	// { tag: "h5", label: "Heading 5", disabled: false },
	{ tag: "code", label: "Code", disabled: false },
	{ tag: "quote", label: "Quote", disabled: false },
] as const;

const getLabel = (tag: string | undefined) => {
	return possibleTags.find((item) => item.tag === tag)?.label;
};

const icons = {
	p: Pilcrow,
	li: List,
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

export const TagChangeActions = ({
	variant = "default",
}: {
	variant?: "minimal" | "default";
}) => {
	const [value, setValue] = useState<string>("");
	const [editor] = useLexicalComposerContext();

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();

		if (!selection) {
			setValue("");
			return;
		}

		const nodes = selection.getNodes();
		const node = nodes[0];
		const parentNode = node.getParent();

		if (!parentNode) {
			setValue("");
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
		} else if ($isListItemNode(parentNode)) {
			setValue("li");
		} else if ($isLinkNode(parentNode) || $isAutoLinkNode(parentNode)) {
			console.log("LINKKK");
			setValue("a");
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
			<SelectTrigger
				className={cn(
					// "!bg-transparent !dark:hover:bg-input/50",
					"dark:bg-transparent",
					variant === "default" && "w-[170px]",
				)}
			>
				<SelectValue placeholder={variant === "default" ? "No selection" : "-"}>
					{value && <Icon id={value} />}
					{variant === "default" && getLabel(value)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
				{possibleTags.map(({ tag, label, disabled }) => (
					<SelectItem
						key={tag}
						value={tag}
						disabled={disabled}
						className={cn(disabled && "hidden")}
					>
						<Icon id={tag} />
						{variant === "default" && label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
