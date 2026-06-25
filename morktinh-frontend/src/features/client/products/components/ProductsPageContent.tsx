"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGetClientBrandsQuery } from "@/features/client/brands/api/brandsApi";
import { useGetClientCategoriesQuery } from "@/features/client/categories/api/categoriesApi";
import { CatalogResults } from "@/features/client/home/components/CatalogResults";
import { useGetClientProductsQuery } from "@/features/client/products/api/productsApi";

const PRICE_MIN = 0;
const PRICE_MAX = 1000;

type SortValue = "newest" | "oldest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

type DropdownOption = {
  value: string;
  label: string;
};

interface FilterDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "all";
  const sort = (searchParams.get("sort") as SortValue | null) || "newest";
  const minPrice = Number(searchParams.get("min_price") || PRICE_MIN);
  const maxPrice = Number(searchParams.get("max_price") || PRICE_MAX);
  const inStock = searchParams.get("in_stock") === "true";
  const hasDiscount = searchParams.get("has_discount") === "true";
  const [searchInput, setSearchInput] = useState(search || "");
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("min_price") || "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("max_price") || "");

  const { data: categories = [] } = useGetClientCategoriesQuery();
  const { data: brands = [] } = useGetClientBrandsQuery();

  const selectedCategory = category === "all" ? undefined : category;
  const selectedBrand = brand === "all" ? undefined : brand;

  const { data: products = [], isLoading: productsLoading } = useGetClientProductsQuery({
    search,
    category: selectedCategory,
    brand: selectedBrand,
    sort,
    min_price: minPrice > PRICE_MIN ? String(minPrice) : undefined,
    max_price: maxPrice < PRICE_MAX ? String(maxPrice) : undefined,
    in_stock: inStock || undefined,
    has_discount: hasDiscount || undefined,
  });

  const updateFilter = useCallback((key: string, value?: string | boolean | number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (
      value === undefined ||
      value === "" ||
      value === false ||
      value === "all" ||
      (key === "min_price" && Number(value) <= PRICE_MIN) ||
      (key === "max_price" && Number(value) >= PRICE_MAX)
    ) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }

    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products");
  }, [router, searchParams]);

  const clearFilters = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/products");
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if ((searchParams.get("search") || "") !== searchInput) {
        updateFilter("search", searchInput.trim());
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [searchInput, searchParams, updateFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if ((searchParams.get("min_price") || "") !== minPriceInput) {
        updateFilter("min_price", minPriceInput);
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [minPriceInput, searchParams, updateFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if ((searchParams.get("max_price") || "") !== maxPriceInput) {
        updateFilter("max_price", maxPriceInput);
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [maxPriceInput, searchParams, updateFilter]);

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((item) => ({ value: item.slug, label: item.name })),
  ];

  const brandOptions = [
    { value: "all", label: "All brands" },
    ...brands.map((item) => ({ value: item.slug, label: item.name })),
  ];

  const sortOptions: DropdownOption[] = [
    { value: "newest", label: "Newest first" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
    { value: "oldest", label: "Oldest first" },
  ];

  return (
    <main className="flex-1 bg-slate-50/50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse products with filters on the left and results on the right.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:self-start">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary-color" />
                <h2 className="text-base font-bold text-slate-950">Filters</h2>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-slate-500">
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="catalog-search">Search</Label>
                <div className="relative">
                  <Input
                    id="catalog-search"
                    value={searchInput}
                    placeholder="Search products"
                    className="pr-9"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        updateFilter("search", event.currentTarget.value.trim());
                      }
                    }}
                    onChange={(event) => setSearchInput(event.currentTarget.value)}
                    onBlur={(event) => updateFilter("search", event.currentTarget.value.trim())}
                  />
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <FilterDropdown label="Category" value={category} options={categoryOptions} onChange={(value) => updateFilter("category", value)} />
              <FilterDropdown label="Brand" value={brand} options={brandOptions} onChange={(value) => updateFilter("brand", value)} />
              <FilterDropdown label="Sort" value={sort} options={sortOptions} onChange={(value) => updateFilter("sort", value)} />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Price range</Label>
                  <span className="text-xs font-semibold text-slate-500">
                    ${minPrice} - ${maxPrice}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">Min</div>
                    <Input
                      type="number"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step="0.01"
                      value={minPriceInput}
                      placeholder="0"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          updateFilter("min_price", event.currentTarget.value);
                        }
                      }}
                      onChange={(event) => setMinPriceInput(event.currentTarget.value)}
                      onBlur={(event) => updateFilter("min_price", event.currentTarget.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">Max</div>
                    <Input
                      type="number"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step="0.01"
                      value={maxPriceInput}
                      placeholder="1000"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          updateFilter("max_price", event.currentTarget.value);
                        }
                      }}
                      onChange={(event) => setMaxPriceInput(event.currentTarget.value)}
                      onBlur={(event) => updateFilter("max_price", event.currentTarget.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="in-stock" className="text-sm text-slate-700">
                    In stock only
                  </Label>
                  <Switch id="in-stock" checked={inStock} onCheckedChange={(checked) => updateFilter("in_stock", checked)} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="has-discount" className="text-sm text-slate-700">
                    On sale
                  </Label>
                  <Switch id="has-discount" checked={hasDiscount} onCheckedChange={(checked) => updateFilter("has_discount", checked)} />
                </div>
              </div>
            </div>
          </aside>

          <CatalogResults
            search={search}
            category={categories.find((item) => item.slug === selectedCategory)?.name || selectedCategory}
            brand={brands.find((item) => item.slug === selectedBrand)?.name || selectedBrand}
            products={products}
            isLoading={productsLoading}
            onClearFilters={clearFilters}
            productGridClassName="lg:grid-cols-3"
          />
        </div>
      </div>
    </main>
  );
}
