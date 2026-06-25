"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "@/features/auth/api/authApi";
import { setCredentials } from "@/features/auth/authSlice";
import { getAuthErrorMessage } from "@/features/auth/utils";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login({ email, password }).unwrap();

      // Save credentials in Redux and localStorage
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.access,
          refreshToken: response.refresh,
        })
      );

      // Redirect based on returnUrl or role
      if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
        router.replace(nextPath);
      } else {
        router.replace("/");
      }
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Invalid email or password"));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-primary-color">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to login to your account
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-2">
          <Button type="submit" className="w-full bg-primary-color hover:bg-primary-color/90" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center text-sm">
            <Link href="/auth/forgot-password" className="text-primary-color font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary-color font-medium hover:underline">
              Register here
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
