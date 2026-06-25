export function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-36 rounded-xl bg-slate-200/70" />)}
      </div>
      <div className="h-40 rounded-xl bg-slate-200/70" />
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <div className="h-80 rounded-xl bg-slate-200/70" />
        <div className="h-80 rounded-xl bg-slate-200/70" />
      </div>
      <div className="h-80 rounded-xl bg-slate-200/70" />
    </div>
  );
}
