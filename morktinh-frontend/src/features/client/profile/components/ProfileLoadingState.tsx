export function ProfileLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-color mb-4"></div>
      <p className="text-slate-500 text-sm">Verifying access...</p>
    </div>
  );
}
