import {
	$isListItemNode,
	$isListNode,
	INSERT_CHECK_LIST_COMMAND,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	type ListType,
	REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection } from "lexical";
import { Check, List, ListOrdered } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const possibleListFormats: ListType[] = ["number", "bullet", "check"] as const;

const icons = {
	check: Check,
	bullet: List,
	number: ListOrdered,
};

export function ListActions({ size = "default" }: { size?: "sm" | "default" }) {
	const [editor] = useLexicalComposerContext();
	const [value, setValue] = useState<ListType | "">("");

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

		if ($isListItemNode(parentNode)) {
			const grandParent = parentNode.getParent();

			if ($isListNode(grandParent)) {
				setValue(grandParent.getListType());
			}
		} else if ($isListItemNode(node)) {
			const grandParent = node.getParent();

			if ($isListNode(grandParent)) {
				setValue(grandParent.getListType());
			}
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

	const handleChange = (val: ListType | "") => {
		setValue(val);

		if (val === value || val === "") {
			editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);

			return;
		}

		if (val === "number") {
			editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
		}

		if (val === "bullet") {
			editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
		}

		if (val === "check") {
			editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
		}
	};

	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={handleChange}
			size={size}
		>
			{possibleListFormats.map((format) => {
				const Icon = icons[format];
				return (
					<ToggleGroupItem
						key={format}
						value={format}
						aria-label={format}
						variant="outline"
						size={size}
					>
						<Icon />
					</ToggleGroupItem>
				);
			})}
		</ToggleGroup>
	);
}
