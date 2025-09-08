import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-up")({
	component: RouteComponent,
});

const formSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

function RouteComponent() {
	const navigate = useNavigate();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onSubmit",
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const { error } = await authClient.signUp.email(
			{
				email: values.email,
				name: "",
				password: values.password,
			},
			{
				onRequest: (ctx) => {
					//show loading
				},
				onSuccess: (ctx) => {
					//redirect to the dashboard or sign in page
				},
				onError: (ctx) => {
					// display the error message
					alert(ctx.error.message);
				},
			},
		);

		if (error) {
			console.log(error);
			return;
		}

		navigate({ to: "/notes" });
	};

	return (
		<div className="pl-0 pr-4 md:pl-4 py-12 flex flex-col items-center justify-center max-w-4xl w-full mx-auto gap-4">
			<h1 className="text-2xl md:text-4xl font-bold">Create an account</h1>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="rounded-md border space-y-6 mt-4 p-6 shadow max-w-sm w-full"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="Enter your email"
										{...field}
									/>
								</FormControl>
								{/* <FormDescription>Supports email and url</FormDescription> */}
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Enter your password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex gap-2 justify-end">
						<Button variant="link" asChild>
							<Link to="/sign-in">Already have account?</Link>
						</Button>

						<Button type="submit">Create account</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
