/**
 * @file route.ts
 * @description 여행지 이미지 목록 조회 API Route
 *
 * 서버 사이드에서 TourAPI를 호출하여 여행지 이미지 목록을 조회
 * 클라이언트는 이 API Route를 통해 이미지 목록을 조회
 *
 * @dependencies
 * - lib/api/travel-api.ts: TravelApiClient
 * - types/travel.ts: TravelImageListResponse
 */

import { NextRequest, NextResponse } from "next/server";
import { travelApi } from "@/lib/api/travel-api";
import { logError } from "@/lib/utils/logger";

interface RouteParams {
  params: Promise<{ contentId: string }>;
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { contentId } = await params;
  
  console.group(`[API /api/travels/${contentId}/images] 이미지 목록 조회`);
  
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
    
    console.log("[API] contentId:", contentId);
    console.log("[API] TourAPI 이미지 목록 호출 시작");
    
    const response = await travelApi.getTravelImages(contentId);
    
    console.log("[API] TourAPI 응답 성공");
    console.groupEnd();
    
    // CORS 헤더 추가 및 캐싱 설정
    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200", // 10분 캐시, 20분 stale-while-revalidate
      },
    });
  } catch (error) {
    console.error("[API] 이미지 목록 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError(`[API /api/travels/${contentId}/images] API 요청 실패`, error instanceof Error ? error : new Error(String(error)), {
      contentId,
      errorMessage,
      errorStack,
    });
    console.groupEnd();
    
    return NextResponse.json(
      { 
        error: errorMessage,
        message: "이미지 목록을 불러오는데 실패했습니다.",
        details: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

