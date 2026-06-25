"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingCart } from "lucide-react";
import { useGetClientCategoriesQuery } from "@/features/client/categories/api/categoriesApi";
import { useGetClientBrandsQuery } from "@/features/client/brands/api/brandsApi";
import { useGetCartItemsQuery } from "@/features/client/cart/api/cartApi";
import { logout } from "@/features/auth/authSlice";
import { RootState } from "@/store/client/store";
import { Button } from "@/components/ui/button";
import { ConfirmLogoutDialog } from "@/components/common/ConfirmLogoutDialog";
import { baseApi } from "@/store/baseApi";

function useHydratedClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const { user, isAuthenticated, isHydrated } = useSelector((state: RootState) => state.auth);
  const isHydratedClient = useHydratedClient();
  const { data: categories = [] } = useGetClientCategoriesQuery();
  const { data: brands = [] } = useGetClientBrandsQuery();
  const { data: cartItems = [] } = useGetCartItemsQuery(undefined, {
    skip: !isHydratedClient || !isHydrated || !isAuthenticated,
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const canRenderAuthActions = isHydratedClient && isHydrated;
  const showAuthenticatedActions = canRenderAuthActions && isAuthenticated && user;
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const canRenderCartCount = isHydratedClient && isHydrated && isAuthenticated;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const handleLogout = () => {
    setLogoutOpen(false);
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold tracking-tight text-primary-color">
              Morktinh
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-medium text-slate-700 transition-colors duration-150 hover:text-primary-color"
            >
              Products
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setCategoriesOpen(!categoriesOpen);
                  setBrandsOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-primary-color transition-colors duration-150"
              >
                Categories
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-60 overflow-y-auto">
                    {categories.length === 0 ? (
                      <span className="block px-4 py-2 text-sm text-slate-400">No categories</span>
                    ) : (
                      categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${category.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-color transition-colors duration-150"
                        >
                          {category.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Brands Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setBrandsOpen(!brandsOpen);
                  setCategoriesOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-primary-color transition-colors duration-150"
              >
                Brands
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${brandsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {brandsOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-60 overflow-y-auto">
                    {brands.length === 0 ? (
                      <span className="block px-4 py-2 text-sm text-slate-400">No brands</span>
                    ) : (
                      brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/products?brand=${brand.slug}`}
                          onClick={() => setBrandsOpen(false)}
                          className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-color transition-colors duration-150"
                        >
                          {brand.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 pl-10 text-sm outline-none transition-all duration-200 focus:border-primary-color/50 focus:bg-white focus:ring-2 focus:ring-primary-color/10"
            />
            <button type="submit" className="absolute left-3 top-2.5 text-slate-400 hover:text-primary-color">
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Right Actions: Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors duration-150 hover:border-primary-color/40 hover:text-primary-color focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-color/20"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            {canRenderCartCount && cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary-color px-1.5 text-[11px] font-bold leading-none text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {!canRenderAuthActions ? (
            <div className="h-9 w-32 rounded-full bg-slate-100" />
          ) : showAuthenticatedActions ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setCategoriesOpen(false);
                  setBrandsOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors duration-150"
              >
                <div className="h-5 w-5 rounded-full bg-primary-color/10 text-primary-color flex items-center justify-center font-bold text-xs">
                  {user.first_name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                </div>
                <span>Hi, {user.first_name || "User"}</span>
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-color transition-colors duration-150"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-color transition-colors duration-150"
                  >
                    Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-color transition-colors duration-150"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => setLogoutOpen(true)}
                    className="w-full text-left block rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-700 hover:text-primary-color">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-primary-color text-white hover:bg-primary-color/90">
                  Register  
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-color/20"
          >
            <span className="sr-only">Open Menu</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 shadow-inner space-y-4 animate-in slide-in-from-top duration-300">
          {/* Search bar mobile */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 pl-10 text-sm outline-none focus:border-primary-color/50 focus:bg-white"
            />
            <button type="submit" className="absolute left-3 top-2.5 text-slate-400">
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          {/* Nav Links */}
          <div className="space-y-2">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-primary-color"
            >
              Products
            </Link>

            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</p>
            <div className="grid grid-cols-2 gap-2 px-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-slate-700 hover:text-primary-color"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Brands</p>
            <div className="grid grid-cols-2 gap-2 px-2">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/products?brand=${b.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-slate-700 hover:text-primary-color"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Auth Actions Mobile */}
          <div className="px-2 flex flex-col gap-2">
            {!canRenderAuthActions ? (
              <div className="h-10 w-full rounded-lg bg-slate-100" />
            ) : showAuthenticatedActions ? (
              <>
                <div className="text-sm font-medium text-slate-700">
                  Logged in as <span className="font-semibold text-primary-color">{user.first_name || user.email}</span>
                </div>
                <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">
                    <ShoppingCart className="h-4 w-4" />
                    Cart{canRenderCartCount && cartCount > 0 ? ` (${cartCount})` : ""}
                  </Button>
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">
                    Profile
                  </Button>
                </Link>
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">
                    Orders
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button onClick={() => setLogoutOpen(true)} variant="destructive" className="w-full">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">
                    <ShoppingCart className="h-4 w-4" />
                    Cart{canRenderCartCount && cartCount > 0 ? ` (${cartCount})` : ""}
                  </Button>
                </Link>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full bg-primary-color text-white">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
    <ConfirmLogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={handleLogout} />
    </>
  );
}
