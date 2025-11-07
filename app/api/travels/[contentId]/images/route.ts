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
import { getServiceRoleClient } from "@/lib/supabase/service-role";

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
  
  try {
    // 환경 변수 확인
    const apiKey = process.env.TOUR_API_KEY;
    
    // TourAPI 시도 (API 키가 있는 경우)
    if (apiKey) {
      try {
        const response = await travelApi.getTravelImages(contentId);
        
        // CORS 헤더 추가 및 캐싱 설정
        return NextResponse.json(response, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200", // 10분 캐시, 20분 stale-while-revalidate
          },
        });
      } catch (tourApiError) {
        // TourAPI 실패 시 Supabase fallback 시도
        const errorStatus = (tourApiError as Error & { status?: number })?.status;
        
        // 500 에러는 일시적 서버 오류이므로 조용히 fallback
        if (errorStatus === 500) {
          // Supabase fallback으로 진행
        } else {
          // 다른 에러는 로깅
          logError(
            `[API /api/travels/${contentId}/images] TourAPI 실패`,
            tourApiError instanceof Error ? tourApiError : new Error(String(tourApiError)),
            { contentId, status: errorStatus }
          );
        }
      }
    }
    
    // Supabase fallback: travels 테이블에서 이미지 정보 조회
    const supabase = getServiceRoleClient();
    const { data: travel, error: supabaseError } = await supabase
      .from("travels")
      .select("firstimage, contentid")
      .eq("contentid", contentId)
      .maybeSingle();
    
    if (supabaseError) {
      logError(
        `[API /api/travels/${contentId}/images] Supabase 조회 실패`,
        supabaseError instanceof Error ? supabaseError : new Error(String(supabaseError)),
        { contentId }
      );
    }
    
    // Supabase에서 이미지가 있으면 빈 응답 구조로 반환 (대표 이미지만)
    if (travel?.firstimage) {
      return NextResponse.json(
        {
          response: {
            header: {
              resultCode: "0000",
              resultMsg: "OK",
            },
            body: {
              items: {
                item: [],
              },
            },
          },
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
          },
        }
      );
    }
    
    // 모든 방법 실패 시 빈 응답 반환
    return NextResponse.json(
      {
        response: {
          header: {
            resultCode: "0000",
            resultMsg: "OK",
          },
          body: {
            items: {
              item: [],
            },
          },
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    
    logError(
      `[API /api/travels/${contentId}/images] 예상치 못한 오류`,
      error instanceof Error ? error : new Error(String(error)),
      { contentId }
    );
    
    // 에러 발생 시에도 빈 응답 구조 반환 (클라이언트에서 대표 이미지 사용)
    return NextResponse.json(
      {
        response: {
          header: {
            resultCode: "0000",
            resultMsg: "OK",
          },
          body: {
            items: {
              item: [],
            },
          },
        },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  }
}

