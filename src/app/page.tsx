import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
	const teamMembers = [
    { name: "Aryan Bharti", regNo: "22BCI0062" },
    { name: "Radhika ladha", regNo: "22BCI0087" },
    { name: "M.Sri Pranav", regNo: "22BCI0088" },
    { name: "Nalagatla Sathish", regNo: "22BCI0094" },
    { name: "Sibhi kishore", regNo: "22BCI0074" },
  ];

   const features = [
				{
					title: "Encrypted Password Storage",
					description:
						"Military-grade AES-256 encryption ensures your passwords are stored securely with client-side encryption.",
				},
				{
					title: "Two-Factor Authentication",
					description:
						"Enhanced security with email-based 2FA to protect your valuable data.",
				},
				{
					title: "Password Generator",
					description:
						"Generate strong, random passwords with customizable length and character types.",
				},
				{
					title: "Password Strength Checker",
					description:
						"Real-time password strength evaluation with helpful improvement suggestions.",
				},
				{
					title: "Secure Data Export",
					description:
						"Export your passwords in an encrypted format for safe backup and storage.",
				},
			];

	return (
		<main className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<div className="flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto pt-12">
				<h1 className="text-5xl font-bold tracking-tight">SecureVault</h1>
				<p className="text-xl text-muted-foreground">
					A Secure Password Management Solution
				</p>
				<div className="flex gap-4 pt-4">
					<Link href="/login">
						<Button variant="default" size="lg" className="px-8">
							Login
						</Button>
					</Link>
					<Link href="/register">
						<Button variant="outline" size="lg" className="px-8">
							Register
						</Button>
					</Link>
				</div>
			</div>

			<div className="mt-12">
				<h2 className="text-2xl font-semibold text-center mb-6">
					Team Members
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
					{teamMembers.map((member, _) => (
						<div key={member.regNo} className="p-4 border rounded-lg">
							<p className="font-medium">{member.name}</p>
							<p className="text-sm text-muted-foreground">{member.regNo}</p>
						</div>
					))}
				</div>
			</div>
			<div className="w-full max-w-4xl">
				<h2 className="text-2xl font-semibold text-center mb-8">
					Key Features
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => (
						<div
							key={feature.title}
							className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
						>
							<h3 className="font-semibold mb-2">{feature.title}</h3>
							<p className="text-sm text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}