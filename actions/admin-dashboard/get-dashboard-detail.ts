/**
 * @file get-dashboard-detail.ts
 * @description 대시보드 상세 조회 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface DashboardWidget {
  id: string;
  widgetType: string;
  widgetConfig: Record<string, any>;
  position: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardDetail {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isShared: boolean;
  shareToken: string;
  layoutConfig: Record<string, any>;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

export interface GetDashboardDetailResult {
  success: boolean;
  dashboard?: DashboardDetail;
  error?: string;
}

export async function getDashboardDetail(
  dashboardId: string
): Promise<GetDashboardDetailResult> {
  console.group("[getDashboardDetail] 대시보드 상세 조회 시작");
  console.log("대시보드 ID:", dashboardId);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getDashboardDetail] 인증되지 않은 사용자");
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
      console.error("[getDashboardDetail] 사용자 조회 실패:", userError);
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 대시보드 조회
    const { data: dashboard, error: dashboardError } = await supabase
      .from("dashboard_configs")
      .select("*")
      .eq("id", dashboardId)
      .single();

    if (dashboardError || !dashboard) {
      console.error("[getDashboardDetail] 대시보드 조회 실패:", dashboardError);
      console.groupEnd();
      return { success: false, error: "대시보드를 찾을 수 없습니다." };
    }

    // 권한 확인 (소유자 또는 공유된 사용자)
    const isOwner = dashboard.user_id === userData.id;
    const { data: share } = await supabase
      .from("dashboard_shares")
      .select("*")
      .eq("dashboard_id", dashboardId)
      .eq("shared_with_user_id", userData.id)
      .single();

    if (!isOwner && !share) {
      console.warn("[getDashboardDetail] 권한 없음");
      console.groupEnd();
      return { success: false, error: "대시보드에 접근할 권한이 없습니다." };
    }

    // 위젯 조회
    const { data: widgets, error: widgetsError } = await supabase
      .from("dashboard_widgets")
      .select("*")
      .eq("dashboard_id", dashboardId)
      .order("position", { ascending: true });

    if (widgetsError) {
      console.error("[getDashboardDetail] 위젯 조회 실패:", widgetsError);
      console.groupEnd();
      return { success: false, error: "위젯을 불러오는데 실패했습니다." };
    }

    const result: DashboardDetail = {
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description,
      isDefault: dashboard.is_default,
      isShared: dashboard.is_shared,
      shareToken: dashboard.share_token,
      layoutConfig: dashboard.layout_config || {},
      widgets: (widgets || []).map((widget) => ({
        id: widget.id,
        widgetType: widget.widget_type,
        widgetConfig: widget.widget_config || {},
        position: widget.position,
        isVisible: widget.is_visible,
        createdAt: widget.created_at,
        updatedAt: widget.updated_at,
      })),
      createdAt: dashboard.created_at,
      updatedAt: dashboard.updated_at,
    };

    console.log("[getDashboardDetail] 대시보드 상세 조회 완료");
    console.groupEnd();

    return {
      success: true,
      dashboard: result,
    };
  } catch (error) {
    console.error("[getDashboardDetail] 대시보드 상세 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "대시보드 상세를 불러오는데 실패했습니다.",
    };
  }
}

