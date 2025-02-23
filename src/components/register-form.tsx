'use client'

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { registerUser } from "@/app/server/user";
import { redirect } from "next/navigation";

export function RegisterForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;
		const email = formData.get("email") as string;
		const name = formData.get("name") as string;
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		await registerUser({ email, password, name });
		redirect("/dashboard");
		// cookies().set("auth-token", token);
	};


	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Register</CardTitle>
					<CardDescription>
						Enter your email below to register to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input id="name" name="name" placeholder="John Doe" required />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									name="email"
									placeholder="m@example.com"
									required
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
								</div>
								<Input id="password" name="password" type="password" required />
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="confirmPassword">Confirm Password</Label>
								</div>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									required
								/>
							</div>
							<Button type="submit" className="w-full">
								Register
							</Button>
						</div>
						<div className="mt-4 text-center text-sm">
							Already have an account?{" "}
							<a href="/login" className="underline underline-offset-4">
								Login
							</a>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
