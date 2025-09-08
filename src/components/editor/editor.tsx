import { CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import {
	type InitialConfigType,
	type InitialEditorStateType,
	LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { SelectionAlwaysOnDisplay } from "@lexical/react/LexicalSelectionAlwaysOnDisplay";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
	INSERT_TABLE_COMMAND,
	TableCellNode,
	TableNode,
	TableRowNode,
} from "@lexical/table";
import { Table } from "lucide-react";
import { Button } from "../ui/button";

export function TableAction() {
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

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { getEditorSizeLocalStorage } from "@/lib/utils";
import { AutoFocusPlugin } from "./autofocus-plugin";
import { MenuBar } from "./menu-bar";
import { emailMatcher, urlMatcher } from "./utils";

type EditorProps = {
	onChange?: (content: string) => void;
	defaultEditorState?: InitialEditorStateType;
};

const initialConfig: InitialConfigType = {
	namespace: "notes-editor",
	onError: (error: Error) => console.error(error),
	theme: {
		root: "prose dark:prose-invert max-w-none prose-zinc",
		text: {
			bold: "font-bold",
			italic: "italic",
			underline: "underline",
			strikethrough: "line-through",
			code: "font-mono bg-gray-100 rounded px-1 inline dark:text-zinc-900",
		},
		code: "font-mono bg-gray-100 rounded px-1 block dark:text-zinc-900",
	},
};

export function Editor({ defaultEditorState, onChange }: EditorProps) {
	const editorConfig: InitialConfigType = {
		...initialConfig,
		nodes: [
			QuoteNode,
			HeadingNode,
			CodeNode,
			ListNode,
			ListItemNode,
			LinkNode,
			AutoLinkNode,
			TableNode,
			TableRowNode,
			TableCellNode,
		],
		editorState: defaultEditorState,
	};

	return (
		<LexicalComposer initialConfig={editorConfig}>
			<MenuBar />

			<div
				data-id="editor-wrapper"
				data-editor-size={getEditorSizeLocalStorage()}
				className="mt-8 relative mx-auto w-full data-[editor-size=narrow]:max-w-prose"
			>
				<RichTextPlugin
					contentEditable={
						<ContentEditable
							className="w-full rounded-md outline-none"
							aria-placeholder={"Start typing..."}
							placeholder={
								<div className="text-muted-foreground absolute left-0 top-0 pointer-events-none animate-pulse">
									Start typing...
								</div>
							}
						/>
					}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<ListPlugin />
				<LinkPlugin />
				<SelectionAlwaysOnDisplay />
				{/* <ClickableLinkPlugin newTab /> */}
				<TablePlugin />
				<HorizontalRulePlugin />
				<AutoLinkPlugin matchers={[emailMatcher, urlMatcher]} />
				<CheckListPlugin />
				<TabIndentationPlugin />
				<AutoFocusPlugin />
				<HistoryPlugin />
				<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
				<OnChangePlugin
					onChange={(editorState) => {
						onChange?.(JSON.stringify(editorState.toJSON()));
					}}
				/>
			</div>
		</LexicalComposer>
	);
}
