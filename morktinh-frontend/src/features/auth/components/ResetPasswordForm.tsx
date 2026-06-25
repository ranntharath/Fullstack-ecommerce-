"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useResetPasswordMutation } from "@/features/auth/api/authApi";
import { getAuthErrorMessage } from "@/features/auth/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const code = searchParams.get("code");
  const [formData, setFormData] = useState({
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !code) {
      setError("Please verify your reset code first.");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({ email, code, ...formData }).unwrap();
      router.push("/auth/login");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Failed to reset password. Please try again."));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-primary-color">Set New Password</CardTitle>
        <CardDescription className="text-center">
          Create a new password for your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirm">Confirm Password</Label>
            <Input id="password_confirm" type="password" required value={formData.password_confirm} onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-2">
          <Button type="submit" className="w-full bg-primary-color hover:bg-primary-color/90" disabled={isLoading}>
            {isLoading ? "Saving password..." : "Reset password"}
          </Button>
          <div className="text-center text-sm text-slate-500">
            Need a new code?{" "}
            <Link href="/auth/forgot-password" className="text-primary-color font-medium hover:underline">
              Send again
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
