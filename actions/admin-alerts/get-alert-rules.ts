/**
 * @file get-alert-rules.ts
 * @description 알림 규칙 조회 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  metricType: string;
  thresholdValue: number;
  thresholdOperator: string;
  checkIntervalMinutes: number;
  enabled: boolean;
  channels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetAlertRulesResult {
  success: boolean;
  rules?: AlertRule[];
  error?: string;
}

async function checkAdminPermission(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const adminUserIds = process.env.ADMIN_USER_IDS?.split(",") || [];
    if (adminUserIds.includes(userId)) return true;

    return false;
  } catch {
    return false;
  }
}

export async function getAlertRules(): Promise<GetAlertRulesResult> {
  console.group("[getAlertRules] 알림 규칙 조회 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getAlertRules] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    const { data: rules, error } = await supabase
      .from("alert_rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAlertRules] 규칙 조회 실패:", error);
      console.groupEnd();
      return { success: false, error: "알림 규칙을 불러오는데 실패했습니다." };
    }

    const formattedRules: AlertRule[] = (rules || []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      metricType: r.metric_type,
      thresholdValue: r.threshold_value,
      thresholdOperator: r.threshold_operator,
      checkIntervalMinutes: r.check_interval_minutes,
      enabled: r.enabled,
      channels: r.channels || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    console.log("[getAlertRules] 규칙 조회 완료:", formattedRules.length, "개");
    console.groupEnd();

    return {
      success: true,
      rules: formattedRules,
    };
  } catch (error) {
    console.error("[getAlertRules] 규칙 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "알림 규칙을 불러오는데 실패했습니다.",
    };
  }
}

