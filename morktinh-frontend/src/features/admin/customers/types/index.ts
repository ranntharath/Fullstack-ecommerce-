export interface AdminCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: "customer";
  is_active: boolean;
  is_email_verified: boolean;
  last_login: string | null;
}

export interface CustomerFormValues {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password?: string;
  password_confirm?: string;
  is_active: boolean;
  is_email_verified: boolean;
}
