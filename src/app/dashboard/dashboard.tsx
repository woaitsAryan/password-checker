"use client";
import type { Password, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PlusIcon, KeyIcon, ShieldCheckIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useState } from "react";
import AddPasswordDialog from "./add-password-dialog";
import PasswordList from "./password-list";
import type { DecryptedPassword } from "../server/helpers";

interface DashboardProps {
  user: User;
  passwords: DecryptedPassword[];
}

export default function Dashboard({ user, passwords }: DashboardProps) {
  const [isAddPasswordOpen, setIsAddPasswordOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Password Manager</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <Button onClick={() => setIsAddPasswordOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Password
        </Button>
      </div>

      <div className="h-fit">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <KeyIcon className="mr-2 h-5 w-5" />
              Stored Passwords
            </CardTitle>
            <CardDescription>Securely stored credentials</CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-7rem)] overflow-y-auto">
            <PasswordList passwords={passwords} />
          </CardContent>
        </Card>
      </div>

      <AddPasswordDialog
        open={isAddPasswordOpen}
        onOpenChange={setIsAddPasswordOpen}
      />
    </div>
  );
}
