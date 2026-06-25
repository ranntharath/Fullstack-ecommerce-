"use client";

export function ProductDetailsSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:px-8">
      <div className="space-y-4">
        <div className="aspect-square w-full animate-pulse rounded-lg bg-slate-100" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
        <div className="h-24 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}
