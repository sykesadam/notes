import { CodeNode } from "@lexical/code";
import {
	type InitialConfigType,
	type InitialEditorStateType,
	LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { getEditorSizeLocalStorage } from "@/lib/utils";
import { AutoFocusPlugin } from "./autofocus-plugin";
import { MenuBar } from "./menu-bar";

type EditorProps = {
	onChange?: (content: string) => void;
	defaultEditorState?: InitialEditorStateType;
};

const initialConfig: InitialConfigType = {
	namespace: "notes-editor",
	onError: (error: Error) => console.error(error),
	theme: {
		root: "prose max-w-none text-foreground",
		text: {
			bold: "font-bold",
			italic: "italic",
			underline: "underline",
			strikethrough: "line-through",
			code: "font-mono bg-gray-100 rounded px-1 inline",
		},
		code: "font-mono bg-gray-100 rounded px-1 inline",
	},
};

export function Editor({ defaultEditorState, onChange }: EditorProps) {
	const editorConfig: InitialConfigType = {
		...initialConfig,
		nodes: [QuoteNode, HeadingNode, CodeNode],
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
							className="p-2 w-full rounded-md"
							aria-placeholder={"Start typing..."}
							placeholder={<div>Start typing...</div>}
						/>
					}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<AutoFocusPlugin />
				<HistoryPlugin />
				<OnChangePlugin
					onChange={(editorState) => {
						onChange?.(JSON.stringify(editorState.toJSON()));
					}}
				/>
			</div>
		</LexicalComposer>
	);
}
