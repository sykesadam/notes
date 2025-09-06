import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { Table } from "lucide-react";
import { Button } from "../ui/button";

export function InsertActions() {
	const [editor] = useLexicalComposerContext();

	const insertTable = () => {
		// Dispatch the command to insert a table with 3 rows and 3 columns
		editor.dispatchCommand(INSERT_TABLE_COMMAND, {
			rows: "3",
			columns: "3",
		});
	};

	return (
		<Button type="button" variant="outline" size="icon" onClick={insertTable}>
			<Table />
		</Button>
	);
}
