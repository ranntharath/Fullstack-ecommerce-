"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  CheckCircle2,
  Gift,
  ImageIcon,
  Package,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddCartItemMutation } from "@/features/client/cart/api/cartApi";
import { Product, ProductMedia, ProductVariant } from "@/features/client/products/types";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { RootState } from "@/store/client/store";

interface ProductDetailsProps {
  product: Product;
}

function formatCurrency(value: string | number) {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDiscountBadge(product: Product) {
  const discount = product.active_discount;

  if (!discount) return "";

  const value = Number.parseFloat(discount.value);
  const formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(2);

  if (discount.discount_type === "percent") {
    return `-${formattedValue}%`;
  }

  return `-${formatCurrency(value)}`;
}

type SelectedOptions = Record<number, number>;

function getInitialSelectedOptions(variant: ProductVariant | undefined) {
  const selections: SelectedOptions = {};

  variant?.variant_options.forEach((variantOption) => {
    const groupId = variantOption.option_detail?.group;

    if (groupId) {
      selections[groupId] = variantOption.option;
    }
  });

  return selections;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { isAuthenticated, isHydrated } = useSelector((state: RootState) => state.auth);
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const medias = product.medias || [];
  const thumbnailMedia =
    medias.find((media) => media.is_thumbnail) || medias[0];
  const [selectedMedia, setSelectedMedia] = useState<ProductMedia | undefined>(
    thumbnailMedia,
  );
  const selectableVariants = useMemo(
    () => (product.variants || []).filter((variant) => variant.is_active),
    [product.variants],
  );
  const optionGroups = product.option_groups || [];
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() =>
    getInitialSelectedOptions(selectableVariants[0]),
  );
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const selectedVariant = useMemo(() => {
    if (selectableVariants.length === 0 || optionGroups.length === 0) {
      return selectableVariants[0];
    }

    const selectedOptionIds = Object.values(selectedOptions);

    if (selectedOptionIds.length < optionGroups.length) {
      return undefined;
    }

    return selectableVariants.find((variant) => {
      const variantOptionIds = variant.variant_options.map(
        (variantOption) => variantOption.option,
      );
      return selectedOptionIds.every((optionId) =>
        variantOptionIds.includes(optionId),
      );
    });
  }, [selectableVariants, optionGroups.length, selectedOptions]);

  const selectedImage = selectedVariant?.image
    ? getImageUrl(selectedVariant.image)
    : getImageUrl(selectedMedia?.image);
  const basePrice = Number.parseFloat(
    selectedVariant?.price || product.base_price,
  );
  const finalPrice = Number.parseFloat(
    selectedVariant?.variant_final_price || product.final_price,
  );
  const hasDiscount = !!product.active_discount;
  const stockCount =
    selectedVariant?.stock ??
    selectableVariants.reduce((total, variant) => total + variant.stock, 0);
  const hasCompleteSelection =
    optionGroups.length === 0 ||
    Object.keys(selectedOptions).length >= optionGroups.length;
  const inStock =
    (selectedVariant ? selectedVariant.stock > 0 : false) ||
    selectableVariants.length === 0;

  const specificationEntries = Object.entries(
    product.specification || {},
  ).filter(([, value]) => value !== null && value !== "");
  const activeFreeItems = (product.free_items || []).filter(
    (item) => item.is_active,
  );

  const isOptionAvailable = (groupId: number, optionId: number) =>
    selectableVariants.some((variant) => {
      const variantOptionIds = variant.variant_options.map(
        (variantOption) => variantOption.option,
      );
      const otherSelectedOptionIds = Object.entries(selectedOptions)
        .filter(([selectedGroupId]) => Number(selectedGroupId) !== groupId)
        .map(([, selectedOptionId]) => selectedOptionId);

      return (
        variantOptionIds.includes(optionId) &&
        otherSelectedOptionIds.every((selectedOptionId) =>
          variantOptionIds.includes(selectedOptionId),
        )
      );
    });

  const selectOption = (groupId: number, optionId: number) => {
    setSelectedOptions((currentSelections) => ({
      ...currentSelections,
      [groupId]: optionId,
    }));
    setAddedToCart(false);
    setCartError(null);
  };

  const handleAddToCart = async () => {
    if (!hasCompleteSelection || !inStock) return;

    if (!isAuthenticated) {
      setCartError("Please sign in to add this product to your cart.");
      return;
    }

    try {
      await addCartItem({
        product: product.id,
        variant: selectedVariant?.id ?? null,
        quantity: 1,
      }).unwrap();
      setAddedToCart(true);
      setCartError(null);
    } catch {
      setCartError("Could not add this product to your cart.");
    }
  };

  return (
    <div className="bg-slate-50/50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/"
            className="font-medium text-primary-color hover:underline"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/?category=${product.category_detail.slug}`}
            className="hover:text-primary-color"
          >
            {product.category_detail.name}
          </Link>
          <span>/</span>
          <span className="truncate text-slate-700">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-contain object-center p-4"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <ImageIcon className="h-16 w-16 stroke-[1.25]" />
                </div>
              )}

              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                {hasDiscount && (
                  <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold uppercase text-white">
                    {formatDiscountBadge(product)}
                  </span>
                )}
                {product.is_feature && (
                  <span className="rounded bg-slate-950 px-2 py-1 text-xs font-bold uppercase text-white">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {medias.length > 0 && (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {medias.map((media) => {
                  const mediaUrl = getImageUrl(media.image);
                  const isSelected =
                    selectedMedia?.id === media.id && !selectedVariant?.image;

                  return (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => setSelectedMedia(media)}
                      className={cn(
                        "aspect-square overflow-hidden rounded-lg border bg-white p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-color/25",
                        isSelected
                          ? "border-primary-color"
                          : "border-slate-200 hover:border-primary-color/45",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl}
                        alt={product.name}
                        className="h-full w-full rounded-md object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Link
                  href={`/?brand=${product.brand_detail.slug}`}
                  className="text-primary-color hover:underline"
                >
                  {product.brand_detail.name}
                </Link>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <Link
                  href={`/?category=${product.category_detail.slug}`}
                  className="text-slate-500 hover:text-primary-color"
                >
                  {product.category_detail.name}
                </Link>
              </div>

              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-3xl">
                {product.name}
              </h1>

              {product.tag_details.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tag_details.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <span className="text-3xl font-extrabold text-slate-950">
                  {formatCurrency(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="pb-1 text-base font-semibold text-slate-400 line-through">
                    {formatCurrency(basePrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {product.description}
                </p>
              )}

              {optionGroups.length > 0 && (
                <div className="mt-6 space-y-5">
                  {optionGroups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-bold text-slate-900">
                          {group.title}
                        </div>
                        {selectedOptions[group.id] && (
                          <div className="truncate text-xs font-semibold text-slate-500">
                            {
                              group.options.find(
                                (option) =>
                                  option.id === selectedOptions[group.id],
                              )?.value
                            }
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => {
                          const isSelected =
                            selectedOptions[group.id] === option.id;
                          const isAvailable = isOptionAvailable(
                            group.id,
                            option.id,
                          );

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => selectOption(group.id, option.id)}
                              disabled={!isAvailable}
                              className={cn(
                                "rounded-lg border px-3 py-1 text-sm font-semibold leading-5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-color/25 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300",
                                isSelected
                                  ? "border-primary-color bg-primary-color text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-primary-color/45 hover:text-primary-color",
                              )}
                            >
                              {option.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {selectedVariant && (
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      SKU:{" "}
                      <span className="text-slate-800">
                        {selectedVariant.sku}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2
                  className={cn(
                    "h-5 w-5",
                    inStock ? "text-emerald-600" : "text-red-600",
                  )}
                />
                <span className={inStock ? "text-emerald-700" : "text-red-700"}>
                  {!hasCompleteSelection
                    ? "Choose product options"
                    : inStock
                      ? `${stockCount || "Available"} in stock`
                      : "Out of stock"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={handleAddToCart}
                  className="h-11 bg-primary-color text-white hover:bg-primary-color/90"
                  disabled={!hasCompleteSelection || !inStock || isAddingToCart || !isHydrated}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isAddingToCart ? "Adding..." : addedToCart ? "Added to Cart" : "Add to Cart"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  disabled={!hasCompleteSelection || !inStock || isAddingToCart || !isHydrated}
                  onClick={handleAddToCart}
                >
                  Buy Now
                </Button>
              </div>
              {cartError && (
                <p className="mt-3 text-sm font-semibold text-red-700">
                  {cartError}
                </p>
              )}
              {addedToCart && (
                <p className="mt-3 text-sm font-semibold text-emerald-700">
                  Added to cart.
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <Truck className="mb-2 h-5 w-5 text-primary-color" />
                <div className="text-sm font-bold text-slate-900">
                  Fast Delivery
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Reliable shipping updates.
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <ShieldCheck className="mb-2 h-5 w-5 text-primary-color" />
                <div className="text-sm font-bold text-slate-900">
                  Secure Checkout
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Protected payment flow.
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <Package className="mb-2 h-5 w-5 text-primary-color" />
                <div className="text-sm font-bold text-slate-900">
                  Quality Packed
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Handled with care.
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Product Details
            </h2>
            {product.detail ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {product.detail}
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                No additional product detail yet.
              </p>
            )}

            {specificationEntries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Specifications
                </h3>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  {specificationEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {key}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-800">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary-color" />
              <h2 className="text-lg font-bold text-slate-950">
                Included Items
              </h2>
            </div>

            {activeFreeItems.length > 0 ? (
              <div className="mt-4 space-y-3">
                {activeFreeItems.map((item) => {
                  const imageUrl = getImageUrl(item.image);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 p-2"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <Gift className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                No free items are attached to this product.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
