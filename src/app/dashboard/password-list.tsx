"use client";

import { useEffect, useState } from "react";
import { deletePassword, getPasswords } from "@/app/server/password";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, TrashIcon } from "lucide-react";
import crypto from "node:crypto";
import type { DecryptedPassword } from "../server/helpers";

export default function PasswordList({
  passwords,
}: {
  passwords: DecryptedPassword[];
}) {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set()
  );

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4 pr-2">
      {passwords.map((password: DecryptedPassword) => (
        <div
          key={password.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
        >
          <div className="flex flex-row gap-4 items-center">
            <p className="font-medium">Service: {password.service}</p>
            <div className="h-4 w-px bg-border" />
            <p className="text-base">Username: {password.username}</p>
            <div className="h-4 w-px bg-border" />
            <p className="text-base font-mono">
              Password:{" "}
              {visiblePasswords.has(password.id)
                ? password.password
                : "••••••••"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => togglePasswordVisibility(password.id)}
            >
              {visiblePasswords.has(password.id) ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deletePassword(password.id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
