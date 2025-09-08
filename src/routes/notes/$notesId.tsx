import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Editor } from "@/components/editor/editor";
import {
	getNoteQueryOptions,
	saveNoteMutationOptions,
} from "@/lib/query-options";

export const Route = createFileRoute("/notes/$notesId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		context.queryClient.ensureQueryData(getNoteQueryOptions(params.notesId));
	},
	ssr: false,
});

function RouteComponent() {
	const { notesId } = Route.useParams();
	const { data } = useQuery(getNoteQueryOptions(notesId));

	const saveNoteMutation = useMutation(saveNoteMutationOptions());

	if (!data) {
		throw notFound();
	}

	return (
		<main className="pl-0 pr-4 md:pl-4 max-w-4xl mx-auto my-8">
			<h1 className="font-black text-3xl md:text-5xl mb-8 text-center">
				{data.name}
			</h1>
			<Editor
				defaultEditorState={data.editorState ? data.editorState : undefined}
				onChange={(content) => {
					saveNoteMutation.mutate({ id: notesId, editorState: content });
				}}
			/>
		</main>
	);
}
