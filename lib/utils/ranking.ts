/**
 * @file ranking.ts
 * @description 인기도 및 랭킹 계산 유틸리티
 *
 * 여행지의 인기도 점수를 계산하고 랭킹을 산출하는 함수들
 *
 * 주요 기능:
 * 1. 인기도 점수 계산 (조회수, 북마크 수 가중치)
 * 2. 랭킹 조회 (지역별, 타입별)
 * 3. 인기 여행지 목록 조회
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - lib/utils/popularity.ts: calculatePopularityScore
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { calculatePopularityScore } from "@/lib/utils/popularity";

export interface TravelRanking {
  contentId: string;
  title: string;
  popularityScore: number;
  viewCount: number;
  bookmarkCount: number;
  shareCount: number;
}

/**
 * 인기 여행지 목록 조회
 * @param limit 조회할 개수 (기본값: 10)
 * @param region 지역 필터 (선택적)
 * @returns 인기 여행지 목록
 */
export async function getPopularTravels(
  limit: number = 10,
  region?: string,
): Promise<TravelRanking[]> {
  console.group(
    `[Ranking] 인기 여행지 조회: limit=${limit}, region=${region || "전체"}`,
  );

  try {
    const supabase = await createClerkSupabaseClient();

    // 통계 데이터 조회
    const query = supabase
      .from("travel_stats")
      .select("*")
      .order("bookmark_count", { ascending: false })
      .order("view_count", { ascending: false })
      .limit(limit);

    const { data: stats, error } = await query;

    if (error) {
      console.error("[Ranking] 통계 조회 실패:", error);
      return [];
    }

    if (!stats || stats.length === 0) {
      console.log("[Ranking] 통계 데이터 없음");
      return [];
    }

    // 인기도 점수 계산
    const rankings: TravelRanking[] = stats.map((stat) => ({
      contentId: stat.content_id,
      title: "", // 나중에 TourAPI에서 조회 필요
      popularityScore: calculatePopularityScore(
        stat.view_count || 0,
        stat.bookmark_count || 0,
        stat.share_count || 0,
      ),
      viewCount: stat.view_count || 0,
      bookmarkCount: stat.bookmark_count || 0,
      shareCount: stat.share_count || 0,
    }));

    // 인기도 점수 순으로 정렬
    rankings.sort((a, b) => b.popularityScore - a.popularityScore);

    console.log(`[Ranking] 인기 여행지 ${rankings.length}개 조회 완료`);
    return rankings;
  } catch (error) {
    console.error("[Ranking] 인기 여행지 조회 오류:", error);
    return [];
  } finally {
    console.groupEnd();
  }
}

/**
 * 지역별 인기 여행지 조회
 * @param region 지역명 (예: "서울", "경기")
 * @param limit 조회할 개수 (기본값: 10)
 * @returns 인기 여행지 목록
 */
export async function getPopularTravelsByRegion(
  region: string,
  limit: number = 10,
): Promise<TravelRanking[]> {
  console.log(`[Ranking] 지역별 인기 여행지 조회: ${region}`);

  // TODO: 지역 필터링을 위해서는 TourAPI를 통해 해당 지역의 여행지 목록을 먼저 조회한 후
  // 통계 데이터와 조인해야 함
  // 현재는 전체 인기 여행지를 반환
  return getPopularTravels(limit);
}

/**
 * 여행지 타입별 인기 여행지 조회
 * @param travelType 여행지 타입 (예: "관광지", "문화시설", "축제", "숙박")
 * @param limit 조회할 개수 (기본값: 10)
 * @returns 인기 여행지 목록
 */
export async function getPopularTravelsByType(
  travelType: string,
  limit: number = 10,
): Promise<TravelRanking[]> {
  console.log(`[Ranking] 타입별 인기 여행지 조회: ${travelType}`);

  // TODO: 타입 필터링을 위해서는 TourAPI를 통해 해당 타입의 여행지 목록을 먼저 조회한 후
  // 통계 데이터와 조인해야 함
  // 현재는 전체 인기 여행지를 반환
  return getPopularTravels(limit);
}

/**
 * @deprecated getPopularCampings 대신 getPopularTravels 사용
 * 호환성을 위해 유지
 */
export interface CampingRanking {
  contentId: string;
  facltNm: string;
  popularityScore: number;
  viewCount: number;
  bookmarkCount: number;
  shareCount: number;
}

export async function getPopularCampings(
  limit: number = 10,
  region?: string,
): Promise<CampingRanking[]> {
  const travels = await getPopularTravels(limit, region);
  return travels.map((t) => ({
    contentId: t.contentId,
    facltNm: t.title,
    popularityScore: t.popularityScore,
    viewCount: t.viewCount,
    bookmarkCount: t.bookmarkCount,
    shareCount: t.shareCount,
  }));
}

export async function getPopularCampingsByRegion(
  region: string,
  limit: number = 10,
): Promise<CampingRanking[]> {
  const travels = await getPopularTravelsByRegion(region, limit);
  return travels.map((t) => ({
    contentId: t.contentId,
    facltNm: t.title,
    popularityScore: t.popularityScore,
    viewCount: t.viewCount,
    bookmarkCount: t.bookmarkCount,
    shareCount: t.shareCount,
  }));
}

export async function getPopularCampingsByType(
  campingType: string,
  limit: number = 10,
): Promise<CampingRanking[]> {
  const travels = await getPopularTravelsByType(campingType, limit);
  return travels.map((t) => ({
    contentId: t.contentId,
    facltNm: t.title,
    popularityScore: t.popularityScore,
    viewCount: t.viewCount,
    bookmarkCount: t.bookmarkCount,
    shareCount: t.shareCount,
  }));
}
