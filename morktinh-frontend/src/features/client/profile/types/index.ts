export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  profile_picture: string | null;
  is_email_verified: boolean;
  role: string;
  profile?: {
    register_type: string | null;
    google_id: string | null;
    google_avatar: string | null;
  };
}

export interface UpdateUserProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture?: File | null;
}

export interface CustomerAddress {
  id: number;
  recipient_name: string;
  address_line1: string;
  address_line2: string | null;
  phone: string;
  city: string;
  district: string;
  commune: string;
}

export type CustomerAddressRequest = Omit<CustomerAddress, "id">;
