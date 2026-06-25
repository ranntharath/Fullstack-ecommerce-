export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  profile_picture?: string | null;
  role: string;
}

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password?: string;
  password_confirm?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface SendOtpRequest {
  email: string;
  purpose: "email_verification" | "password_reset" | "login";
}

export interface SendOtpResponse {
  message: string;
  expires_at: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  purpose: "email_verification" | "password_reset" | "login";
}

export interface VerifyOtpResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
  password_confirm: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  message: string;
  refresh: string;
  access: string;
  user: User;
}
