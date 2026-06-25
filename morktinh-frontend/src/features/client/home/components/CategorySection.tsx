"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Category } from "@/features/client/categories/types";
import { getImageUrl } from "@/lib/image-utils";

interface CategorySectionProps {
  categories: Category[];
  isLoading: boolean;
}

export function CategorySection({ categories, isLoading }: CategorySectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <span className="flex h-3 w-3 rounded-full bg-amber-500" />
          <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
            Shop by Category
          </h2>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-color">
          Browse
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="mx-auto aspect-square w-24 rounded-full bg-slate-100" />
              <div className="mx-auto mt-4 h-3 w-20 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.slice(0, 8).map((category) => {
            const imageUrl = getImageUrl(category.image);

            return (
              <Link
                key={category.id}
                href={`/products/?category=${category.slug}`}
                className="group flex h-44 flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 text-center transition-colors duration-200 hover:border-primary-color/45 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-color/25"
              >
                <div className="aspect-square w-24 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100 transition-transform duration-200 group-hover:-translate-y-0.5">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={category.name}
                      loading="lazy"
                      className="aspect-square h-full w-full rounded-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full">
                      <ImageIcon className="h-9 w-9 text-slate-400 stroke-[1.4]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-primary-color">
                    {category.name}
                  </h3>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Explore
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="py-4 text-sm text-slate-400">No categories are available yet.</p>
      )}
    </section>
  );
}
