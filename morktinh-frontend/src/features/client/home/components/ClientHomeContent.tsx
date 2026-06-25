"use client";

import { Button } from "@/components/ui/button";
import { useGetClientBannersQuery } from "@/features/client/banners/api/bannersApi";
import { useGetClientCategoriesQuery } from "@/features/client/categories/api/categoriesApi";
import { useGetClientProductsQuery } from "@/features/client/products/api/productsApi";
import { getImageUrl } from "@/lib/image-utils";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { CategorySection } from "./CategorySection";
import { ProductSection } from "./ProductSection";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export function ClientHomeContent() {
  const { data: banners = [], isLoading: bannersLoading } = useGetClientBannersQuery();
  const { data: categories = [], isLoading: categoriesLoading } = useGetClientCategoriesQuery();
  const { data: bestSellingProducts = [], isLoading: bestSellingLoading } = useGetClientProductsQuery({ tag: "best-selling" });
  const { data: newArrivals = [], isLoading: newArrivalsLoading } = useGetClientProductsQuery({ sort: "newest" });

  return (
    <div className="flex-1 bg-slate-50/50 pb-16">
      <section className="relative h-87.5 overflow-hidden bg-slate-900 text-white sm:h-112.5 lg:h-125">
        {bannersLoading ? (
          <div className="flex h-full w-full animate-pulse items-center justify-center bg-slate-900">
            <div className="font-medium text-slate-500">Loading premium deals...</div>
          </div>
        ) : banners.length > 0 ? (
          <div className="relative h-full w-full [--swiper-navigation-size:24px] [--swiper-theme-color:#2C5EAD]">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={0}
              slidesPerView={1}
              autoplay={{ delay: 6000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation={true}
              className="h-full w-full"
            >
              {banners.map((banner) => {
                const imgUrl = getImageUrl(banner.banner_image);

                return (
                  <SwiperSlide key={banner.id} className="relative h-full w-full">
                    {imgUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgUrl}
                        alt={banner.title || "Marketing slide"}
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center animate-in fade-in duration-700">
                      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="max-w-xl space-y-4 sm:space-y-6">
                          {banner.title && (
                            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
                              {banner.title}
                            </h1>
                          )}
                          {banner.description && (
                            <p className="max-w-md text-base text-slate-200 drop-shadow-sm sm:text-lg">
                              {banner.description}
                            </p>
                          )}
                          {banner.button_title && (
                            <div className="pt-2">
                              <Button
                                className="font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                                style={{ backgroundColor: banner.button_color || "#2C5EAD" }}
                              >
                                {banner.button_title}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ) : (
          <div className="relative flex h-full w-full items-center bg-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(44,94,173,0.15),rgba(255,255,255,0))]" />
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 text-center sm:px-6 lg:px-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover Your Next <span className="text-primary-color">Favorites</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
                Shop the finest curated collections with unbeatable prices. Fast shipping, secure payments, and premium support.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Button className="bg-primary-color px-6 py-2.5 font-semibold text-white hover:bg-primary-color/90">
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <CategorySection categories={categories} isLoading={categoriesLoading} />
          <ProductSection
            title="Best Sellers"
            label="Top Choice"
            accentClassName="bg-primary-color animate-pulse"
            products={bestSellingProducts}
            isLoading={bestSellingLoading}
            emptyMessage="No best selling products currently featured."
          />
          <ProductSection
            title="New Arrivals"
            label="Latest Drops"
            accentClassName="bg-teal-500 animate-pulse"
            products={newArrivals}
            isLoading={newArrivalsLoading}
            emptyMessage="No products found in new arrivals."
          />
        </div>
      </div>
    </div>
  );
}
