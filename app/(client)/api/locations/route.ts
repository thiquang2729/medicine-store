import { NextResponse } from "next/server";
import { locationService } from "@/services/location.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "provinces") {
      const provinces = await locationService.getProvinces();
      // Map về định dạng phù hợp với frontend hiện tại nếu cần
      const mappedProvinces = provinces.map((p) => ({
        _id: p.id,
        name: p.name,
      }));
      return NextResponse.json(mappedProvinces);
    } else if (type === "wards") {
      const provinceId = searchParams.get("provinceId");
      if (!provinceId) {
        return new NextResponse("Missing provinceId", { status: 400 });
      }
      const wards = await locationService.getWardsByProvince(provinceId);
      const mappedWards = wards.map((w) => ({
        _id: w.id,
        name: w.name,
        province: {
          _ref: w.provinceId,
        },
      }));
      return NextResponse.json(mappedWards);
    }

    return new NextResponse("Invalid type", { status: 400 });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
