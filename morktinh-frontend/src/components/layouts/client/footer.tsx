"use client";

import React, { useState } from "react";
import Link from "next/link";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="mt-auto bg-slate-900 border-t border-slate-800 text-slate-400">
      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Brand Info */}
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-white hover:text-primary-color transition-colors duration-200">
              Morktinh
            </Link>
            <p className="text-sm text-slate-400 max-w-sm">
              Your premium destination for the latest technology, fashion, and everyday essentials. Crafted with love and powered by innovation.
            </p>
            <div className="flex space-x-6">
              {/* Facebook Icon */}
              <Link href="#" className="hover:text-primary-color transition-colors duration-200">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              {/* Twitter/X Icon */}
              <Link href="#" className="hover:text-primary-color transition-colors duration-200">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              {/* Instagram Icon */}
              <Link href="#" className="hover:text-primary-color transition-colors duration-200">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054 9.39.42 10.793 6.175 10.793 10.793 0 4.617-1.403 10.373-10.793 10.793-1.137.047-1.41.054-3.71.054s-2.563-.006-3.702-.054C4.58 23.332 3 17.65 3 12c0-5.65 1.58-11.373 10.793-10.793.93-.043 1.28-.054 3.71-.054zm-.218 1.977c-2.408 0-2.717.01-3.664.053-5.215.237-6.086 3.09-6.086 8.748 0 5.657.87 8.51 6.086 8.748.947.043 1.256.053 3.664.053s2.717-.01 3.664-.053c5.215-.237 6.086-3.09 6.086-8.748 0-5.657-.87-8.51-6.086-8.748-.947-.043-1.256-.053-3.664-.053zm0 3.42a4.603 4.603 0 110 9.206 4.603 4.603 0 010-9.206zm0 1.977a2.625 2.625 0 100 5.25 2.625 2.625 0 000-5.25z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Dynamic Categories column */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Categories
                </h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link href="/products" className="text-sm text-slate-400 hover:text-primary-color transition-colors duration-150">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?sort=newest" className="text-sm text-slate-400 hover:text-primary-color transition-colors duration-150">
                      New Arrivals
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?has_discount=true" className="text-sm text-slate-400 hover:text-primary-color transition-colors duration-150">
                      On Sale
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?in_stock=true" className="text-sm text-slate-400 hover:text-primary-color transition-colors duration-150">
                      In Stock
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Customer Support Column */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Support
                </h3>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-primary-color transition-colors duration-150">
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-primary-color transition-colors duration-150">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-primary-color transition-colors duration-150">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-slate-400 hover:text-primary-color transition-colors duration-150">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Subscribe to our newsletter
              </h3>
              <p className="text-sm text-slate-400">
                Get the latest news and promotions delivered straight to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-color/50 focus:ring-2 focus:ring-primary-color/10"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary-color px-4 py-2 text-sm font-semibold text-white hover:bg-primary-color/90 transition-colors duration-150"
                >
                  Subscribe
                </button>
              </form>
              {subscribed && (
                <p className="text-xs text-green-400 animate-fade-in">
                  Thanks for subscribing! Check your inbox soon.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 border-t border-slate-800 pt-8 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Morktinh Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-slate-500">
            <Link href="#" className="hover:text-primary-color transition-colors duration-150">Privacy</Link>
            <Link href="#" className="hover:text-primary-color transition-colors duration-150">Terms</Link>
            <Link href="#" className="hover:text-primary-color transition-colors duration-150">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
