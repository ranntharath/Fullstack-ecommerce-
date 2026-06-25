"use client";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white animate-pulse"
        >
          <div className="h-36 w-full bg-slate-200 sm:h-44 lg:h-48" />
          <div className="p-2.5 sm:p-3">
            <div className="h-3 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-full rounded bg-slate-200" />
            <div className="mt-1.5 h-4 w-4/5 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
            <div className="mt-4 h-5 w-2/5 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
