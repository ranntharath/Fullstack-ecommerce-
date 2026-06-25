"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSendOtpMutation } from "@/features/auth/api/authApi";
import { getAuthErrorMessage } from "@/features/auth/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sendOtp, { isLoading }] = useSendOtpMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const cleanEmail = email.trim();
      await sendOtp({ email: cleanEmail, purpose: "password_reset" }).unwrap();
      router.push(`/auth/verify-otp?email=${encodeURIComponent(cleanEmail)}&purpose=password_reset&sent=1`);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Failed to send reset code. Please try again."));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-primary-color">Forgot Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email and we will send a reset code
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-2">
          <Button type="submit" className="w-full bg-primary-color hover:bg-primary-color/90" disabled={isLoading}>
            {isLoading ? "Sending code..." : "Send reset code"}
          </Button>
          <div className="text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-primary-color font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
