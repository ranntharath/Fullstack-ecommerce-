"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyOtpMutation, useSendOtpMutation } from "@/features/auth/api/authApi";
import { getAuthErrorMessage } from "@/features/auth/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

function VerifyOTPContent() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const purposeParam = searchParams.get("purpose");
  const wasAlreadySent = searchParams.get("sent") === "1";
  const purpose = purposeParam === "password_reset" ? "password_reset" : "email_verification";
  const isPasswordReset = purpose === "password_reset";
  const [countdown, setCountdown] = useState(() => (wasAlreadySent ? 60 : 0));
  const hasRequestedInitialOtp = useRef(false);
  const router = useRouter();

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();

  const handleSendOtp = useCallback(async (isInitial = false) => {
    if (!email || countdown > 0) return;
    
    setError(null);
    setMessage(null);

    try {
      await sendOtp({ email, purpose }).unwrap();
      if (!isInitial) setMessage("A new code has been sent to your email.");
      setCountdown(60);
    } catch (err: unknown) {
      if (!isInitial) {
        setError(getAuthErrorMessage(err, "Failed to send OTP. Please try again."));
      }
    }
  }, [countdown, email, purpose, sendOtp]);

  useEffect(() => {
    if (!email) {
      router.push(isPasswordReset ? "/auth/forgot-password" : "/auth/register");
    } else if (!wasAlreadySent && !hasRequestedInitialOtp.current) {
      hasRequestedInitialOtp.current = true;
      // Automatically send OTP on mount if no countdown is active
      // In a real app, you might want to check if they literally just registered vs refreshed the page.
      handleSendOtp(true);
    }
  }, [email, handleSendOtp, isPasswordReset, router, wasAlreadySent]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await verifyOtp({ email, code, purpose }).unwrap();
      if (isPasswordReset) {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
      } else {
        router.push("/auth/login");
      }
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Invalid OTP code. Please try again."));
    }
  };

  if (!email) return null; // Avoid rendering flash if email is missing

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-primary-color">
          {isPasswordReset ? "Verify Reset Code" : "Verify Email"}
        </CardTitle>
        <CardDescription className="text-center">
          We sent a 6-digit code to <span className="font-medium text-slate-800">{email}</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 flex flex-col items-center">
          {error && (
            <div className="w-full bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="w-full bg-green-50 text-green-600 p-3 rounded-md text-sm font-medium">
              {message}
            </div>
          )}

          <div className="flex justify-center w-full">
            <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-primary-color hover:bg-primary-color/90" disabled={isVerifying || code.length < 6}>
            {isVerifying ? "Verifying..." : "Verify Code"}
          </Button>
          
          <div className="text-center text-sm text-slate-500">
            Didn&apos;t receive the code?{" "}
            <button 
              type="button" 
              onClick={() => handleSendOtp()}
              disabled={countdown > 0 || isSending}
              className="text-primary-color font-medium hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export function VerifyOtpForm() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
