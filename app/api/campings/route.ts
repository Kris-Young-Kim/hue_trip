/**
 * @file route.ts
 * @description 캠핑장 목록 조회 API Route
 *
 * 서버 사이드에서 고캠핑 API를 호출하여 CORS 문제를 해결
 * 클라이언트는 이 API Route를 통해 캠핑장 목록을 조회
 *
 * @dependencies
 * - lib/api/camping-api.ts: CampingApiClient
 * - types/camping.ts: CampingFilter, CampingListResponse
 */

import { NextRequest, NextResponse } from "next/server";
import { campingApi } from "@/lib/api/camping-api";
import type { CampingFilter } from "@/types/camping";
import { logError } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  console.group("[API /api/campings] 캠핑장 목록 조회");
  
  try {
    // 환경 변수 확인
    const apiKey = process.env.GOCAMPING_API_KEY;
    if (!apiKey) {
      console.error("[API] GOCAMPING_API_KEY 환경 변수가 설정되지 않았습니다.");
      console.groupEnd();
      return NextResponse.json(
        { 
          error: "API 키가 설정되지 않았습니다.",
          message: "서버 환경 변수 GOCAMPING_API_KEY를 확인해주세요."
        },
        { status: 500 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    
    console.log("[API] 쿼리 파라미터:", Object.fromEntries(searchParams.entries()));
    
    const filter: CampingFilter = {
      pageNo: parseInt(searchParams.get("pageNo") || "1", 10),
      numOfRows: parseInt(searchParams.get("numOfRows") || "20", 10),
      doNm: searchParams.get("doNm") || undefined,
      sigunguNm: searchParams.get("sigunguNm") || undefined,
      induty: searchParams.get("induty") || undefined,
      sbrsCl: searchParams.get("sbrsCl") || undefined,
      keyword: searchParams.get("keyword") || undefined,
      sortOrder: (searchParams.get("sortOrder") as CampingFilter["sortOrder"]) || undefined,
    };

    console.log("[API] 필터:", filter);
    console.log("[API] 고캠핑 API 호출 시작");
    
    const response = await campingApi.getCampingList(filter);
    
    console.log("[API] 고캠핑 API 응답 성공");
    console.groupEnd();
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] 캠핑장 목록 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError("[API /api/campings] API 요청 실패", error instanceof Error ? error : new Error(String(error)), {
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      errorMessage,
      errorStack,
    });
    console.groupEnd();
    
    return NextResponse.json(
      { 
        error: errorMessage,
        message: "캠핑장 목록을 불러오는데 실패했습니다.",
        details: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

