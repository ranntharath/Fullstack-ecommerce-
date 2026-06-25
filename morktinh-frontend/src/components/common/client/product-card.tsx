"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ImageIcon, Layers, Tag } from "lucide-react";
import { ProductListItem } from "@/features/client/products/types";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [now, setNow] = useState<number | null>(null);
  const thumbnailMedia = product.medias?.find((media) => media.is_thumbnail) || product.medias?.[0];
  const imageUrl = thumbnailMedia ? getImageUrl(thumbnailMedia.image) : "";
  const basePrice = Number.parseFloat(product.base_price);
  const finalPrice = Number.parseFloat(product.final_price);
  const activeDiscount = product.active_discount;
  const hasDiscount = !!activeDiscount;
  const primaryTag = product.tag_details?.[0];
  const discountCountdown = getDiscountCountdown(activeDiscount?.end_date, now);

  useEffect(() => {
    if (!activeDiscount?.end_date) return;

    const timeoutId = window.setTimeout(() => setNow(Date.now()), 0);
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [activeDiscount?.end_date]);

  const formatCurrency = (amount: number) => (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  );

  const formatDiscountBadge = () => {
    if (!activeDiscount) return "";

    const value = Number.parseFloat(activeDiscount.value);
    const formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(2);

    if (activeDiscount.discount_type === "percent") {
      return `-${formattedValue}%`;
    }

    return `-${formatCurrency(value)}`;
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors duration-200 hover:border-primary-color/45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-color/25",
        className
      )}
    >
      <div className="relative h-36 w-full bg-slate-100 sm:h-44 lg:h-48">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-opacity duration-200 group-hover:opacity-95"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageIcon className="h-11 w-11 stroke-[1.4]" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {hasDiscount && (
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              {formatDiscountBadge()}
            </span>
          )}
          {product.is_feature && (
            <span className="rounded bg-slate-950 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              Featured
            </span>
          )}
        </div>

      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500">
          <span className="truncate text-primary-color">
            {product.brand_detail?.name || "Morktinh"}
          </span>
          {product.category_detail?.name && (
            <>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="truncate">
                {product.category_detail.name}
              </span>
            </>
          )}
        </div>

        <h3 className="mt-1.5 min-h-9 text-sm font-semibold leading-snug text-slate-950 line-clamp-2 transition-colors duration-200 group-hover:text-primary-color sm:text-[15px]">
          {product.name}
        </h3>

        <div className="mt-1.5 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {product.variants_count} {product.variants_count === 1 ? "variant" : "variants"}
          </span>
          {primaryTag && (
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {primaryTag.name}
            </span>
          )}
        </div>

        {discountCountdown && (
          <div className="mt-2 inline-flex max-w-full items-center gap-1.5 text-[11px] font-semibold text-red-600">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="text-slate-500">Sale ends</span>
            <span className="tabular-nums">
              {discountCountdown === "Ended" ? "Ended" : discountCountdown}
            </span>
          </div>
        )}

        <div className="mt-auto pt-2">
          {hasDiscount && (
            <div className="mb-1 text-[11px] font-medium text-slate-400 line-through sm:text-xs">
              {formatCurrency(basePrice)}
            </div>
          )}
          <span className="text-base font-bold leading-none text-slate-950 sm:text-lg">
            {formatCurrency(finalPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function getDiscountCountdown(endDate: string | undefined, now: number | null) {
  if (!endDate || now === null) return null;

  const endTime = new Date(endDate).getTime();
  const remainingMs = endTime - now;

  if (!Number.isFinite(endTime)) return null;
  if (remainingMs <= 0) return "Ended";

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}
