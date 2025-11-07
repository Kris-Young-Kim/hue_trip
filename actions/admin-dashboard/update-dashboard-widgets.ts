/**
 * @file update-dashboard-widgets.ts
 * @description 대시보드 위젯 업데이트 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface UpdateWidgetInput {
  widgetId: string;
  widgetConfig?: Record<string, any>;
  position?: number;
  isVisible?: boolean;
}

export interface UpdateWidgetsInput {
  dashboardId: string;
  widgets: Array<{
    id?: string;
    widgetType: string;
    widgetConfig?: Record<string, any>;
    position: number;
    isVisible?: boolean;
  }>;
}

export interface UpdateDashboardWidgetsResult {
  success: boolean;
  error?: string;
}

export async function updateDashboardWidgets(
  input: UpdateWidgetsInput
): Promise<UpdateDashboardWidgetsResult> {
  console.group("[updateDashboardWidgets] 대시보드 위젯 업데이트 시작");
  console.log("대시보드 ID:", input.dashboardId);
  console.log("위젯 개수:", input.widgets.length);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[updateDashboardWidgets] 인증되지 않은 사용자");
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
      console.error("[updateDashboardWidgets] 사용자 조회 실패:", userError);
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
      console.error("[updateDashboardWidgets] 대시보드 조회 실패:", dashboardError);
      console.groupEnd();
      return { success: false, error: "대시보드를 찾을 수 없습니다." };
    }

    if (dashboard.user_id !== userData.id) {
      console.warn("[updateDashboardWidgets] 권한 없음");
      console.groupEnd();
      return { success: false, error: "대시보드를 수정할 권한이 없습니다." };
    }

    // 기존 위젯 삭제
    const { error: deleteError } = await supabase
      .from("dashboard_widgets")
      .delete()
      .eq("dashboard_id", input.dashboardId);

    if (deleteError) {
      console.error("[updateDashboardWidgets] 기존 위젯 삭제 실패:", deleteError);
      // 계속 진행
    }

    // 새 위젯 추가
    if (input.widgets.length > 0) {
      const widgets = input.widgets.map((widget) => ({
        dashboard_id: input.dashboardId,
        widget_type: widget.widgetType,
        widget_config: widget.widgetConfig || {},
        position: widget.position,
        is_visible: widget.isVisible ?? true,
      }));

      const { error: insertError } = await supabase
        .from("dashboard_widgets")
        .insert(widgets);

      if (insertError) {
        console.error("[updateDashboardWidgets] 위젯 추가 실패:", insertError);
        console.groupEnd();
        return { success: false, error: "위젯 업데이트에 실패했습니다." };
      }
    }

    console.log("[updateDashboardWidgets] 대시보드 위젯 업데이트 완료");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("[updateDashboardWidgets] 대시보드 위젯 업데이트 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "위젯 업데이트 중 오류가 발생했습니다.",
    };
  }
}

