import { zodResolver } from "@hookform/resolvers/zod";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Link, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const formSchema = z.object({
	link: z.string().refine(
		(val) => {
			const isUrl = z.url().safeParse(val).success;
			const isEmail = z.email().safeParse(val).success;
			return isUrl || isEmail;
		},
		{
			message: "Please enter a valid URL or a valid email address.",
		},
	),
});

export function LinkAction({ size }: { size?: "sm" }) {
	const [editor] = useLexicalComposerContext();
	const [isLink, setIsLink] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isSelectionEmpty, setIsSelectionEmpty] = useState(true);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			link: "",
		},
		mode: "onSubmit",
	});

	const removeLink = () => {
		editor.update(() => {
			const selection = $getSelection();

			if ($isRangeSelection(selection)) {
				editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
				setIsLink(false);
			}
		});
	};

	const insertLink = (value: string) => {
		editor.update(() => {
			const selection = $getSelection();

			if ($isRangeSelection(selection)) {
				editor.dispatchCommand(TOGGLE_LINK_COMMAND, value);
			}
		});
	};

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		insertLink(values.link);

		setIsOpen(false);

		// Make time for dialog to close
		setTimeout(() => {
			form.reset();
		}, 500);
	};

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				const selection = $getSelection();

				if ($isRangeSelection(selection)) {
					const anchorNode = selection.anchor.getNode();
					const parent = selection?.getNodes()?.[0]?.getParent();
					setIsLink($isLinkNode(parent));

					setIsSelectionEmpty(
						anchorNode.getTextContent() === "" && selection.isCollapsed(),
					);
				} else {
					setIsSelectionEmpty(true);
				}

				return false;
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor]);

	if (isLink) {
		return (
			<Button
				type="button"
				variant="outline"
				size="icon"
				onClick={removeLink}
				className={cn(
					"dark:bg-transparent bg-transparent",
					size === "sm" && "size-8",
				)}
			>
				<Unlink />
				<span className="sr-only">Remove selected link</span>
			</Button>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="icon"
					className={cn(
						"dark:bg-transparent bg-transparent",
						size === "sm" && "size-8",
					)}
					disabled={isSelectionEmpty}
				>
					<Link />
					<span className="sr-only">Add link</span>
				</Button>
			</DialogTrigger>
			<DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle>Add a link</DialogTitle>
					<DialogDescription className="sr-only">
						Here you can add some link.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8 mt-4"
					>
						<FormField
							control={form.control}
							name="link"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="sr-only">Link</FormLabel>
									<FormControl>
										<Input placeholder="Add your link..." {...field} />
									</FormControl>
									<FormDescription>Supports email and url</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex gap-2 justify-end">
							<DialogClose asChild>
								<Button type="button" variant="secondary">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit">Submit</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
