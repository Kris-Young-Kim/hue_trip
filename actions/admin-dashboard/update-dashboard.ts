/**
 * @file update-dashboard.ts
 * @description 대시보드 업데이트 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface UpdateDashboardInput {
  dashboardId: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  isShared?: boolean;
  layoutConfig?: Record<string, any>;
}

export interface UpdateDashboardResult {
  success: boolean;
  error?: string;
}

export async function updateDashboard(
  input: UpdateDashboardInput
): Promise<UpdateDashboardResult> {
  console.group("[updateDashboard] 대시보드 업데이트 시작");
  console.log("입력:", input);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[updateDashboard] 인증되지 않은 사용자");
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
      console.error("[updateDashboard] 사용자 조회 실패:", userError);
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
      console.error("[updateDashboard] 대시보드 조회 실패:", dashboardError);
      console.groupEnd();
      return { success: false, error: "대시보드를 찾을 수 없습니다." };
    }

    if (dashboard.user_id !== userData.id) {
      console.warn("[updateDashboard] 권한 없음");
      console.groupEnd();
      return { success: false, error: "대시보드를 수정할 권한이 없습니다." };
    }

    // 기본 대시보드로 설정하는 경우, 기존 기본 대시보드 해제
    if (input.isDefault) {
      await supabase
        .from("dashboard_configs")
        .update({ is_default: false })
        .eq("user_id", userData.id)
        .eq("is_default", true)
        .neq("id", input.dashboardId);
    }

    // 대시보드 업데이트
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.isDefault !== undefined) updateData.is_default = input.isDefault;
    if (input.isShared !== undefined) updateData.is_shared = input.isShared;
    if (input.layoutConfig !== undefined) updateData.layout_config = input.layoutConfig;

    const { error: updateError } = await supabase
      .from("dashboard_configs")
      .update(updateData)
      .eq("id", input.dashboardId);

    if (updateError) {
      console.error("[updateDashboard] 대시보드 업데이트 실패:", updateError);
      console.groupEnd();
      return { success: false, error: "대시보드 업데이트에 실패했습니다." };
    }

    console.log("[updateDashboard] 대시보드 업데이트 완료");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("[updateDashboard] 대시보드 업데이트 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "대시보드 업데이트 중 오류가 발생했습니다.",
    };
  }
}

