"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface HomeBannerClientProps {
  bannerData: any[];
}

const HomeBannerClient = ({ bannerData }: HomeBannerClientProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const plugin = useRef(Autoplay({ delay: 2000 }));

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleDotClick = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const validBanners = bannerData.filter((banner: any) => banner.imageUrl);

  if (bannerData.length === 0 || validBanners.length === 0) {
    return (
      <div className="relative py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-shop_orange via-shop_dark_green to-shop_light_green opacity-10"></div>
        <div className="relative z-10 text-center">
          <p className="text-gray-500">
            {bannerData.length === 0
              ? "Không có banner nào để hiển thị"
              : "Không có banner nào có hình ảnh hợp lệ"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative py-8 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-20 h-20 bg-shop_orange/20 rounded-full animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-4 right-10 w-16 h-16 bg-shop_light_green/20 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-4 left-20 w-12 h-12 bg-shop_dark_green/20 rounded-full animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>

        <div className="relative z-10 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold py-4 animate-pulse">
            <span className="bg-gradient-to-r from-shop_orange via-shop_dark_green to-shop_light_green bg-clip-text text-transparent animate-gradient-x">
              Các chương trình khuyến mãi hấp dẫn đang diễn ra tại Khủng Long Châu
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 mt-2 animate-fade-in-up">
            <span
              className="inline-block animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              🔥
            </span>
            <span className="mx-2 font-semibold text-shop_dark_green">
              Giảm giá sốc
            </span>
            <span
              className="inline-block animate-bounce"
              style={{ animationDelay: "1s" }}
            >
              💎
            </span>
            <span className="mx-2 font-semibold text-shop_orange">
              Ưu đãi độc quyền
            </span>
            <span
              className="inline-block animate-bounce"
              style={{ animationDelay: "1.5s" }}
            >
              ⚡
            </span>
          </p>
        </div>
      </div>

      <div
        className="relative md:py-0 bg-shop_light_pink rounded-lg lg:px-0"
        onMouseEnter={() => plugin.current.stop()}
        onMouseLeave={() => plugin.current.reset()}
      >
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {validBanners.map((item: any, index: number) => (
              <CarouselItem key={index}>
                <div className="flex items-center justify-between rounded-lg">
                  <div className="block flex-1">
                    <Image
                      src={item.imageUrl}
                      alt={item.alt || item.title || "Banner image"}
                      width={2496}
                      height={764}
                      quality={100}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-7 text-shop_light_green size-6 max-md:hidden" />
          <CarouselNext className="right-7 text-shop_light_green size-6 max-md:hidden" />
        </Carousel>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-x-2">
          {validBanners.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-1 h-1 rounded-full ${
                index + 1 === current ? "bg-shop_dark_green" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeBannerClient;