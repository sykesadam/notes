import {
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	ListType,
	REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { List, ListOrdered, ListStart } from "lucide-react";
import { useState } from "react";
import { Toggle } from "../ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const possibleListFormats = ["number", "bullet"] as const;

const icons = {
	number: List,
	bullet: ListOrdered,
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

	// return (
	// 	<div className="flex gap-1">
	// 		<Toggle
	// 			aria-label="Bullet List"
	// 			onPressedChange={handleBulletList}
	// 			variant="outline"
	// 			size="sm"
	// 		>
	// 			<ListStart className="h-4 w-4" />
	// 		</Toggle>
	// 		<Toggle
	// 			aria-label="Numbered List"
	// 			onPressedChange={handleNumberedList}
	// 			variant="outline"
	// 			size="sm"
	// 		>
	// 			<ListOrdered className="h-4 w-4" />
	// 		</Toggle>
	// 	</div>
	// );
}
