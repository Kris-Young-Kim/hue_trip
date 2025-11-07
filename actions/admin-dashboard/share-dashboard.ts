/**
 * @file share-dashboard.ts
 * @description 대시보드 공유 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface ShareDashboardInput {
  dashboardId: string;
  sharedWithUserIds: string[]; // Clerk user IDs
  permission?: "view" | "edit";
}

export interface ShareDashboardResult {
  success: boolean;
  error?: string;
}

export async function shareDashboard(
  input: ShareDashboardInput
): Promise<ShareDashboardResult> {
  console.group("[shareDashboard] 대시보드 공유 시작");
  console.log("대시보드 ID:", input.dashboardId);
  console.log("공유 대상:", input.sharedWithUserIds.length);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[shareDashboard] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 사용자 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[shareDashboard] 사용자 조회 실패:", userError);
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 대시보드 조회 및 권한 확인
    const { data: dashboard, error: dashboardError } = await supabase
      .from("dashboard_configs")
      .select("*")
      .eq("id", input.dashboardId)
      .single();

    if (dashboardError || !dashboard) {
      console.error("[shareDashboard] 대시보드 조회 실패:", dashboardError);
      console.groupEnd();
      return { success: false, error: "대시보드를 찾을 수 없습니다." };
    }

    if (dashboard.user_id !== userData.id) {
      console.warn("[shareDashboard] 권한 없음");
      console.groupEnd();
      return { success: false, error: "대시보드를 공유할 권한이 없습니다." };
    }

    // 공유 대상 사용자 조회
    const { data: sharedUsers, error: usersError } = await supabase
      .from("users")
      .select("id")
      .in("clerk_id", input.sharedWithUserIds);

    if (usersError) {
      console.error("[shareDashboard] 공유 대상 사용자 조회 실패:", usersError);
      console.groupEnd();
      return { success: false, error: "공유 대상 사용자를 찾을 수 없습니다." };
    }

    // 기존 공유 삭제
    const { error: deleteError } = await supabase
      .from("dashboard_shares")
      .delete()
      .eq("dashboard_id", input.dashboardId);

    if (deleteError) {
      console.error("[shareDashboard] 기존 공유 삭제 실패:", deleteError);
      // 계속 진행
    }

    // 새 공유 추가
    if (sharedUsers && sharedUsers.length > 0) {
      const shares = sharedUsers.map((user) => ({
        dashboard_id: input.dashboardId,
        shared_with_user_id: user.id,
        shared_by_user_id: userData.id,
        permission: input.permission || "view",
      }));

      const { error: insertError } = await supabase
        .from("dashboard_shares")
        .insert(shares);

      if (insertError) {
        console.error("[shareDashboard] 공유 추가 실패:", insertError);
        console.groupEnd();
        return { success: false, error: "대시보드 공유에 실패했습니다." };
      }

      // 대시보드 공유 상태 업데이트
      await supabase
        .from("dashboard_configs")
        .update({ is_shared: true })
        .eq("id", input.dashboardId);
    }

    console.log("[shareDashboard] 대시보드 공유 완료");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("[shareDashboard] 대시보드 공유 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "대시보드 공유 중 오류가 발생했습니다.",
    };
  }
}

