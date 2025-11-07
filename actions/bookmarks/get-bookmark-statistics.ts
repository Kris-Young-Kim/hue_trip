/**
 * @file get-bookmark-statistics.ts
 * @description 북마크 통계/분석 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";
import { REGION_LIST, TRAVEL_TYPE_LIST } from "@/constants/travel";

interface AreaStat {
  areaCode: string;
  count: number;
}

interface TypeStat {
  contentTypeId: string;
  count: number;
}

interface MonthlyTrend {
  month: string;
  count: number;
}

export interface BookmarkStatisticsResult {
  success: boolean;
  totalBookmarks?: number;
  areaStats?: Array<AreaStat & { label: string }>;
  typeStats?: Array<TypeStat & { label: string }>;
  monthlyTrend?: MonthlyTrend[];
  favoriteSummary?: string;
  error?: string;
}

function formatAreaCode(areaCode: string | null): string {
  if (!areaCode) return "기타";
  const match = REGION_LIST.find((region) => region.value === areaCode);
  return match?.label ?? "기타";
}

function formatType(contentTypeId: string | null): string {
  if (!contentTypeId) return "기타";
  const match = TRAVEL_TYPE_LIST.find((type) => type.value === contentTypeId);
  return match?.label ?? "기타";
}

export async function getBookmarkStatistics(): Promise<BookmarkStatisticsResult> {
  console.group("[getBookmarkStatistics] 북마크 통계 조회 시작");

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getBookmarkStatistics] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = createClerkSupabaseClient();

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[getBookmarkStatistics] 사용자 조회 실패:", userError);
      logError(
        "[getBookmarkStatistics] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("id, content_id, created_at")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false });

    if (bookmarksError) {
      console.error("[getBookmarkStatistics] 북마크 조회 실패:", bookmarksError);
      logError(
        "[getBookmarkStatistics] 북마크 조회 실패",
        bookmarksError instanceof Error ? bookmarksError : new Error(String(bookmarksError))
      );
      console.groupEnd();
      return { success: false, error: "북마크 데이터를 불러오는데 실패했습니다." };
    }

    if (!bookmarks || bookmarks.length === 0) {
      console.log("[getBookmarkStatistics] 북마크 없음");
      console.groupEnd();
      return {
        success: true,
        totalBookmarks: 0,
        areaStats: [],
        typeStats: [],
        monthlyTrend: [],
        favoriteSummary: "아직 수집된 북마크 데이터가 없습니다.",
      };
    }

    const contentIds = Array.from(new Set(bookmarks.map((item) => item.content_id)));

    const { data: travelData, error: travelsError } = await supabase
      .from("travels")
      .select("contentid, areacode, contenttypeid, title")
      .in("contentid", contentIds);

    if (travelsError) {
      console.error("[getBookmarkStatistics] 여행지 데이터 조회 실패:", travelsError);
      logError(
        "[getBookmarkStatistics] 여행지 데이터 조회 실패",
        travelsError instanceof Error ? travelsError : new Error(String(travelsError))
      );
      console.groupEnd();
      return { success: false, error: "여행지 데이터를 불러오는데 실패했습니다." };
    }

    const travelMap = new Map(
      (travelData || []).map((travel) => [travel.contentid, travel])
    );

    const areaMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();

    bookmarks.forEach((bookmark) => {
      const travel = travelMap.get(bookmark.content_id);
      const areaCode = travel?.areacode ?? "기타";
      const typeId = travel?.contenttypeid ?? "기타";

      areaMap.set(areaCode, (areaMap.get(areaCode) ?? 0) + 1);
      typeMap.set(typeId, (typeMap.get(typeId) ?? 0) + 1);

      const monthKey = new Date(bookmark.created_at)
        .toISOString()
        .slice(0, 7);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + 1);
    });

    const areaStats = Array.from(areaMap.entries())
      .map(([areaCode, count]) => ({
        areaCode,
        count,
        label: formatAreaCode(areaCode),
      }))
      .sort((a, b) => b.count - a.count);

    const typeStats = Array.from(typeMap.entries())
      .map(([contentTypeId, count]) => ({
        contentTypeId,
        count,
        label: formatType(contentTypeId),
      }))
      .sort((a, b) => b.count - a.count);

    const monthlyTrend = Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const topArea = areaStats[0];
    const topType = typeStats[0];

    const favoriteSummary = topArea && topType
      ? `${topArea.label} 지역의 ${topType.label} 여행지를 가장 많이 북마크하고 있어요.`
      : "아직 확실한 취향이 드러나지 않았어요.";

    logInfo("[getBookmarkStatistics] 통계 계산 완료", {
      totalBookmarks: bookmarks.length,
      areaCount: areaStats.length,
      typeCount: typeStats.length,
    });
    console.groupEnd();

    return {
      success: true,
      totalBookmarks: bookmarks.length,
      areaStats,
      typeStats,
      monthlyTrend,
      favoriteSummary,
    };
  } catch (error) {
    console.error("[getBookmarkStatistics] 통계 계산 오류:", error);
    logError(
      "[getBookmarkStatistics] 통계 계산 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "북마크 통계를 계산하는 중 오류가 발생했습니다." };
  }
}

