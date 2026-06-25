import Link from "next/link";
import { PackageCheck, PackageX } from "lucide-react";
import { LowStockItem } from "../types";

interface LowStockInventoryProps {
  items: LowStockItem[];
  totalCount: number;
  threshold: number;
}

export function LowStockInventory({ items, totalCount, threshold }: LowStockInventoryProps) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900">Low stock inventory</h2>
            {totalCount > 0 && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 ring-1 ring-inset ring-rose-200">
                {totalCount}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">Active variants with {threshold} or fewer units remaining</p>
        </div>
        <Link href="/admin/products" className="shrink-0 text-xs font-semibold text-primary-color hover:underline">
          Manage inventory
        </Link>
      </div>

      {items.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/products/edit/${item.product_id}`}
              className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-primary-color/40 hover:bg-blue-50/30"
            >
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.stock === 0 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                <PackageX className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-primary-color">{item.product_name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">SKU: {item.sku}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${item.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>{item.stock}</p>
                <p className="text-[10px] text-slate-400">in stock</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
          <PackageCheck className="size-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">Inventory looks healthy—no variants are running low.</p>
        </div>
      )}
    </section>
  );
}
