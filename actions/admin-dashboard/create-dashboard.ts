/**
 * @file create-dashboard.ts
 * @description 대시보드 생성 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { generateDashboardShareToken } from "@/lib/utils/dashboard";

export interface CreateDashboardInput {
  name: string;
  description?: string;
  isDefault?: boolean;
  widgets?: Array<{
    widgetType: string;
    widgetConfig?: Record<string, any>;
    position?: number;
    isVisible?: boolean;
  }>;
}

export interface CreateDashboardResult {
  success: boolean;
  dashboardId?: string;
  error?: string;
}

export async function createDashboard(
  input: CreateDashboardInput
): Promise<CreateDashboardResult> {
  console.group("[createDashboard] 대시보드 생성 시작");
  console.log("입력:", input);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[createDashboard] 인증되지 않은 사용자");
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
      console.error("[createDashboard] 사용자 조회 실패:", userError);
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 기본 대시보드로 설정하는 경우, 기존 기본 대시보드 해제
    if (input.isDefault) {
      await supabase
        .from("dashboard_configs")
        .update({ is_default: false })
        .eq("user_id", userData.id)
        .eq("is_default", true);
    }

    // 대시보드 생성
    const { data: dashboard, error: dashboardError } = await supabase
      .from("dashboard_configs")
      .insert({
        user_id: userData.id,
        name: input.name,
        description: input.description,
        is_default: input.isDefault || false,
        is_shared: false,
        share_token: generateDashboardShareToken(),
        layout_config: {},
      })
      .select()
      .single();

    if (dashboardError || !dashboard) {
      console.error("[createDashboard] 대시보드 생성 실패:", dashboardError);
      console.groupEnd();
      return { success: false, error: "대시보드 생성에 실패했습니다." };
    }

    // 위젯 추가
    if (input.widgets && input.widgets.length > 0) {
      const widgets = input.widgets.map((widget, index) => ({
        dashboard_id: dashboard.id,
        widget_type: widget.widgetType,
        widget_config: widget.widgetConfig || {},
        position: widget.position ?? index,
        is_visible: widget.isVisible ?? true,
      }));

      const { error: widgetsError } = await supabase
        .from("dashboard_widgets")
        .insert(widgets);

      if (widgetsError) {
        console.error("[createDashboard] 위젯 추가 실패:", widgetsError);
        // 대시보드는 생성되었으므로 계속 진행
      }
    }

    console.log("[createDashboard] 대시보드 생성 완료:", dashboard.id);
    console.groupEnd();

    return {
      success: true,
      dashboardId: dashboard.id,
    };
  } catch (error) {
    console.error("[createDashboard] 대시보드 생성 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "대시보드 생성 중 오류가 발생했습니다.",
    };
  }
}

