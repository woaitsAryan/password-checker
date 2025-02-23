import { redirect } from "next/navigation";
import { getCurrentUser } from "../server/user";
import Dashboard from "./dashboard";
import { getDecryptedPasswords } from "../server/password";
export default async function DashboardOuter(){
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const passwords = await getDecryptedPasswords();

  return <Dashboard user={user} passwords={passwords} />;
}