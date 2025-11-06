/**
 * @file route.ts
 * @description 여행지 목록 조회 API Route
 *
 * 서버 사이드에서 TourAPI를 호출하여 CORS 문제를 해결
 * 클라이언트는 이 API Route를 통해 여행지 목록을 조회
 *
 * @dependencies
 * - lib/api/travel-api.ts: TravelApiClient
 * - types/travel.ts: TravelFilter, TravelListResponse
 */

import { NextRequest, NextResponse } from "next/server";
import { travelApi } from "@/lib/api/travel-api";
import type { TravelFilter } from "@/types/travel";
import { logError } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  console.group("[API /api/travels] 여행지 목록 조회");
  
  try {
    // 환경 변수 확인
    const apiKey = process.env.TOUR_API_KEY;
    if (!apiKey) {
      console.error("[API] TOUR_API_KEY 환경 변수가 설정되지 않았습니다.");
      console.groupEnd();
      return NextResponse.json(
        { 
          error: "API 키가 설정되지 않았습니다.",
          message: "서버 환경 변수 TOUR_API_KEY를 확인해주세요."
        },
        { status: 500 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    
    console.log("[API] 쿼리 파라미터:", Object.fromEntries(searchParams.entries()));
    
    const filter: TravelFilter = {
      pageNo: parseInt(searchParams.get("pageNo") || "1", 10),
      numOfRows: parseInt(searchParams.get("numOfRows") || "20", 10),
      areaCode: searchParams.get("areaCode") || undefined,
      sigunguCode: searchParams.get("sigunguCode") || undefined,
      contentTypeId: searchParams.get("contentTypeId") || undefined,
      cat1: searchParams.get("cat1") || undefined,
      cat2: searchParams.get("cat2") || undefined,
      cat3: searchParams.get("cat3") || undefined,
      keyword: searchParams.get("keyword") || undefined,
      arrange: searchParams.get("arrange") || undefined,
    };

    console.log("[API] 필터:", filter);
    console.log("[API] TourAPI 호출 시작");
    
    // 키워드가 있으면 검색, 없으면 목록 조회
    let response;
    if (filter.keyword) {
      const { keyword, ...searchFilter } = filter;
      response = await travelApi.searchTravel(keyword, searchFilter);
    } else {
      response = await travelApi.getTravelList(filter);
    }
    
    console.log("[API] TourAPI 응답 성공");
    console.groupEnd();
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] 여행지 목록 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError("[API /api/travels] API 요청 실패", error instanceof Error ? error : new Error(String(error)), {
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      errorMessage,
      errorStack,
    });
    console.groupEnd();
    
    return NextResponse.json(
      { 
        error: errorMessage,
        message: "여행지 목록을 불러오는데 실패했습니다.",
        details: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

