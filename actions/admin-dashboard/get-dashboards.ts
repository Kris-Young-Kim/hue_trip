/**
 * @file get-dashboards.ts
 * @description 대시보드 목록 조회 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface DashboardConfig {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isShared: boolean;
  shareToken: string;
  layoutConfig: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  widgetCount: number;
}

export interface GetDashboardsResult {
  success: boolean;
  dashboards?: DashboardConfig[];
  error?: string;
}

export async function getDashboards(): Promise<GetDashboardsResult> {
  console.group("[getDashboards] 대시보드 목록 조회 시작");

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getDashboards] 인증되지 않은 사용자");
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
      console.error("[getDashboards] 사용자 조회 실패:", userError);
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 사용자의 대시보드 조회
    const { data: dashboards, error: dashboardsError } = await supabase
      .from("dashboard_configs")
      .select("*")
      .eq("user_id", userData.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (dashboardsError) {
      console.error("[getDashboards] 대시보드 조회 실패:", dashboardsError);
      console.groupEnd();
      return { success: false, error: "대시보드 목록을 불러오는데 실패했습니다." };
    }

    // 공유된 대시보드 조회
    const { data: sharedDashboards, error: sharedError } = await supabase
      .from("dashboard_shares")
      .select(
        `
        dashboard_id,
        dashboard_configs (*)
      `
      )
      .eq("shared_with_user_id", userData.id);

    // 위젯 개수 조회
    const dashboardIds = dashboards?.map((d) => d.id) || [];
    const { data: widgetCounts } = await supabase
      .from("dashboard_widgets")
      .select("dashboard_id")
      .in("dashboard_id", dashboardIds);

    const widgetCountMap = new Map<string, number>();
    widgetCounts?.forEach((w) => {
      widgetCountMap.set(w.dashboard_id, (widgetCountMap.get(w.dashboard_id) || 0) + 1);
    });

    const result: DashboardConfig[] = (dashboards || []).map((dashboard) => ({
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description,
      isDefault: dashboard.is_default,
      isShared: dashboard.is_shared,
      shareToken: dashboard.share_token,
      layoutConfig: dashboard.layout_config || {},
      createdAt: dashboard.created_at,
      updatedAt: dashboard.updated_at,
      widgetCount: widgetCountMap.get(dashboard.id) || 0,
    }));

    // 공유된 대시보드 추가
    if (sharedDashboards) {
      sharedDashboards.forEach((share) => {
        if (share.dashboard_configs) {
          const shared = share.dashboard_configs as any;
          result.push({
            id: shared.id,
            name: `${shared.name} (공유됨)`,
            description: shared.description,
            isDefault: false,
            isShared: true,
            shareToken: shared.share_token,
            layoutConfig: shared.layout_config || {},
            createdAt: shared.created_at,
            updatedAt: shared.updated_at,
            widgetCount: 0, // 나중에 조회
          });
        }
      });
    }

    console.log("[getDashboards] 대시보드 목록 조회 완료:", result.length);
    console.groupEnd();

    return {
      success: true,
      dashboards: result,
    };
  } catch (error) {
    console.error("[getDashboards] 대시보드 목록 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "대시보드 목록을 불러오는데 실패했습니다.",
    };
  }
}

