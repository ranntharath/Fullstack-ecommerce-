import { CartItem } from "@/features/client/cart/types";
import { CustomerAddressRequest } from "@/features/client/profile/types";
import { getImageUrl } from "@/lib/image-utils";

export const emptyAddress: CustomerAddressRequest = {
  recipient_name: "",
  address_line1: "",
  address_line2: "",
  phone: "",
  city: "",
  district: "",
  commune: "",
};

export function formatCurrency(value: string | number) {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function getCartItemImage(item: CartItem) {
  const variantImage = item.variant_detail?.image;
  const productImage =
    item.product_detail.medias?.find((media) => media.is_thumbnail)?.image ||
    item.product_detail.medias?.[0]?.image;

  return getImageUrl(variantImage || productImage);
}

export function getCheckoutErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object"
  ) {
    const data = error.data as Record<string, unknown>;
    const firstValue = Object.values(data)[0];

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return "Could not place your order. Please check the details and try again.";
}
