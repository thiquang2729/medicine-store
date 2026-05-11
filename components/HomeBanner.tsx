import React from "react";
import { bannerService } from "@/services/banner.service";
import HomeBannerClient from "./HomeBannerClient";

// Server Component - fetch dữ liệu từ server
const HomeBanner = async () => {
  // Fetch dữ liệu banner từ Postgres Server
  const bannerData: any = await bannerService.getBanners();

  return <HomeBannerClient bannerData={bannerData} />;
};

export default HomeBanner;
