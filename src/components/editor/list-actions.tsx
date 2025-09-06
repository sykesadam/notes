import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Check, List, ListOrdered } from "lucide-react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const possibleListFormats = ["number", "bullet", "check"] as const;

const icons = {
	number: List,
	bullet: ListOrdered,
  check: Check
};

export function ListActions() {
	const [editor] = useLexicalComposerContext();
	const [value, setValue] = useState<string>("");

	// ListType
	const handleChange = (val: string) => {
		setValue(val);

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
			// className={className}
		>
			{possibleListFormats.map((format) => {
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
}
