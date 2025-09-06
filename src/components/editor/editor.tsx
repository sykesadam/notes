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
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
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
		],
		editorState: defaultEditorState,
	};

	return (
		<LexicalComposer initialConfig={editorConfig}>
			<MenuBar />

			<div
				data-id="editor-wrapper"
				data-editor-size={getEditorSizeLocalStorage()}
				className="mt-8 mx-auto w-full data-[editor-size=narrow]:max-w-prose"
			>
				<RichTextPlugin
					contentEditable={
						<ContentEditable
							className="p-2 w-full rounded-md outline-none"
							aria-placeholder={"Start typing..."}
							placeholder={<div>Start typing...</div>}
						/>
					}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<ListPlugin />
				<LinkPlugin />
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
