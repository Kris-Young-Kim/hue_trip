/**
 * @file admin-stats.ts
 * @description 관리자 통계 조회 Server Actions
 *
 * KPI 대시보드에서 사용할 통계 데이터를 조회하는 Server Actions
 *
 * 주요 기능:
 * 1. 총 사용자 수 조회
 * 2. 총 여행지 조회 수 조회
 * 3. 총 북마크 수 조회
 * 4. 총 리뷰 수 조회
 * 5. 인기 여행지 TOP 10 조회
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface AdminStats {
  totalUsers: number;
  totalViews: number;
  totalBookmarks: number;
  totalReviews: number;
  popularTravels: {
    contentId: string;
    viewCount: number;
    bookmarkCount: number;
    shareCount: number;
  }[];
  // 호환성을 위해 유지
  popularCampings?: {
    contentId: string;
    viewCount: number;
    bookmarkCount: number;
    shareCount: number;
  }[];
}

/**
 * 사용자 역할 확인
 * @param requiredRole 필요한 최소 역할 ('admin' | 'editor' | 'user')
 * @returns 권한 여부
 */
export async function checkUserRole(requiredRole: "admin" | "editor" | "user" = "admin"): Promise<boolean> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return false;
    }

    // 개발 환경: ADMIN_USER_IDS가 설정되지 않았으면 모든 로그인 사용자 허용
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()).filter(Boolean) || [];
    const isDevelopment = process.env.NODE_ENV === "development";
    
    if (adminUserIds.length === 0 && isDevelopment) {
      return true; // 개발 환경에서 환경변수가 없으면 모든 사용자 허용
    }

    // 환경변수에 명시된 사용자는 관리자 권한
    if (adminUserIds.includes(userId)) {
      return true;
    }

    // Supabase에서 사용자 역할 확인
    const supabase = getServiceRoleClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", userId)
      .single();

    if (error || !user) {
      // 사용자가 없으면 기본적으로 권한 없음
      return false;
    }

    const userRole = (user.role as "admin" | "editor" | "user") || "user";

    // 역할 권한 체크
    const roleHierarchy = { admin: 3, editor: 2, user: 1 };
    const requiredLevel = roleHierarchy[requiredRole];
    const userLevel = roleHierarchy[userRole];

    return userLevel >= requiredLevel;
  } catch (error) {
    console.error("[checkUserRole] 권한 확인 오류:", error);
    return false;
  }
}

/**
 * 관리자 권한 확인 (하위 호환성)
 * @returns 관리자 여부
 */
async function checkAdminPermission(): Promise<boolean> {
  return checkUserRole("admin");
}

/**
 * 관리자 통계 조회
 * @returns 통계 데이터 또는 null (권한 없음)
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  console.group("[AdminStats] 통계 조회 시작");

  try {
    // 관리자 권한 확인
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[AdminStats] 관리자 권한 없음");
      return null;
    }

    const supabase = getServiceRoleClient(); // 관리자 통계는 RLS 우회 필요

    // 총 사용자 수 조회
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("[AdminStats] 사용자 수 조회 실패:", usersError);
    }

    // 총 조회 수 조회 (travel_stats 테이블 사용)
    let totalViews = 0;
    const { data: viewsData, error: viewsError } = await supabase
      .from("travel_stats")
      .select("view_count");

    // travel_stats 테이블이 없는 경우 조용히 처리
    if (viewsError) {
      const errorMessage = viewsError instanceof Error 
        ? viewsError.message 
        : (typeof viewsError === "object" && viewsError !== null && "message" in viewsError)
          ? String((viewsError as { message: unknown }).message)
          : String(viewsError);
      
      // 테이블이 없다는 에러는 무시 (마이그레이션 미적용 가능)
      if (errorMessage.includes("Could not find the table") || 
          errorMessage.includes("does not exist") ||
          errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        // 조용히 처리 (totalViews는 이미 0으로 초기화됨)
      } else {
        console.error("[AdminStats] 조회 수 조회 실패:", errorMessage);
      }
    } else {
      totalViews = viewsData?.reduce((sum, stat) => sum + (stat.view_count || 0), 0) || 0;
    }

    // 총 북마크 수 조회
    const { count: totalBookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("*", { count: "exact", head: true });

    if (bookmarksError) {
      const errorMessage = bookmarksError instanceof Error 
        ? bookmarksError.message 
        : (typeof bookmarksError === "object" && bookmarksError !== null && "message" in bookmarksError)
          ? String((bookmarksError as { message: unknown }).message)
          : String(bookmarksError);
      console.error("[AdminStats] 북마크 수 조회 실패:", errorMessage);
    }

    // 총 리뷰 수 조회
    const { count: totalReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    if (reviewsError) {
      const errorMessage = reviewsError instanceof Error 
        ? reviewsError.message 
        : (typeof reviewsError === "object" && reviewsError !== null && "message" in reviewsError)
          ? String((reviewsError as { message: unknown }).message)
          : String(reviewsError);
      console.error("[AdminStats] 리뷰 수 조회 실패:", errorMessage);
    }

    // 인기 여행지 TOP 10 조회
    let popularTravels: {
      contentId: string;
      viewCount: number;
      bookmarkCount: number;
      shareCount: number;
    }[] = [];
    
    const { data: popularData, error: popularError } = await supabase
      .from("travel_stats")
      .select("*")
      .order("bookmark_count", { ascending: false })
      .order("view_count", { ascending: false })
      .limit(10);

    if (popularError) {
      const errorMessage = popularError instanceof Error 
        ? popularError.message 
        : (typeof popularError === "object" && popularError !== null && "message" in popularError)
          ? String((popularError as { message: unknown }).message)
          : String(popularError);
      
      // 테이블이 없다는 에러는 무시 (마이그레이션 미적용 가능)
      if (errorMessage.includes("Could not find the table") || 
          errorMessage.includes("does not exist") ||
          errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        // 조용히 처리 (popularTravels는 이미 빈 배열로 초기화됨)
      } else {
        console.error("[AdminStats] 인기 여행지 조회 실패:", errorMessage);
      }
    } else {
      popularTravels = popularData?.map((stat) => ({
        contentId: stat.content_id,
        viewCount: stat.view_count || 0,
        bookmarkCount: stat.bookmark_count || 0,
        shareCount: stat.share_count || 0,
      })) || [];
    }

    const stats: AdminStats = {
      totalUsers: totalUsers || 0,
      totalViews: totalViews,
      totalBookmarks: totalBookmarks || 0,
      totalReviews: totalReviews || 0,
      popularTravels,
      // 호환성을 위해 유지
      popularCampings: popularTravels,
    };

    console.log("[AdminStats] 통계 조회 완료:", {
      totalUsers: stats.totalUsers,
      totalViews: stats.totalViews,
      totalBookmarks: stats.totalBookmarks,
      totalReviews: stats.totalReviews,
      popularCount: stats.popularTravels.length,
    });

    return stats;
  } catch (error) {
    console.error("[AdminStats] 통계 조회 오류:", error);
    return null;
  } finally {
    console.groupEnd();
  }
}

