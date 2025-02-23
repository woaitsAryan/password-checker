"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { storePassword } from "@/app/server/password";
import { Wand2, Eye, EyeOff } from "lucide-react";
import { revalidatePath } from "next/cache";
import { revalidate } from "../server/revalidate";

interface AddPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPasswordDialog({
  open,
  onOpenChange,
}: AddPasswordDialogProps) {
  const [service, setService] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const checkPasswordStrength = (pass: string): number => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.match(/[A-Z]/)) score += 1;
    if (pass.match(/[a-z]/)) score += 1;
    if (pass.match(/[0-9]/)) score += 1;
    if (pass.match(/[^A-Za-z0-9]/)) score += 1;
    return score;
  };

  const getStrengthColor = (strength: number): string => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await storePassword({
        service,
        username,
        password,
      });

      revalidate("/dashboard");

      onOpenChange(false);
      setService("");
      setUsername("");
      setPassword("");
      setPasswordStrength(0);
    } catch (error) {
      console.error("Failed to store password:", error);
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    const numbers = "0123456789";

    // Generate password with at least one number
    let generatedPassword = numbers.charAt(
      Math.floor(Math.random() * numbers.length)
    );
    for (let i = 1; i < length; i++) {
      generatedPassword += charset.charAt(
        Math.floor(Math.random() * charset.length)
      );
    }

    generatedPassword = generatedPassword
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setPassword(generatedPassword);
    setPasswordStrength(checkPasswordStrength(generatedPassword));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Input
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g., Google, Twitter"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username or email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePassword}
                title="Generate Password"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-1 flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  key={i}
                  className={`h-full flex-1 rounded-full ${
                    i < passwordStrength
                      ? getStrengthColor(passwordStrength)
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {passwordStrength <= 1 && "Weak"}
              {passwordStrength > 1 && passwordStrength <= 3 && "Medium"}
              {passwordStrength > 3 && "Strong"}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
