/**
 * @file get-alert-history.ts
 * @description 알림 이력 조회 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface AlertHistory {
  id: string;
  ruleId: string | null;
  metricType: string;
  metricValue: number;
  thresholdValue: number;
  message: string;
  channel: string;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface GetAlertHistoryResult {
  success: boolean;
  history?: AlertHistory[];
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

export async function getAlertHistory(limit: number = 50): Promise<GetAlertHistoryResult> {
  console.group("[getAlertHistory] 알림 이력 조회 시작");

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[getAlertHistory] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const supabase = getServiceRoleClient();

    const { data: history, error } = await supabase
      .from("alert_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getAlertHistory] 이력 조회 실패:", error);
      console.groupEnd();
      return { success: false, error: "알림 이력을 불러오는데 실패했습니다." };
    }

    const formattedHistory: AlertHistory[] = (history || []).map((h) => ({
      id: h.id,
      ruleId: h.rule_id,
      metricType: h.metric_type,
      metricValue: h.metric_value,
      thresholdValue: h.threshold_value,
      message: h.message,
      channel: h.channel,
      status: h.status,
      sentAt: h.sent_at,
      errorMessage: h.error_message,
      createdAt: h.created_at,
    }));

    console.log("[getAlertHistory] 이력 조회 완료:", formattedHistory.length, "개");
    console.groupEnd();

    return {
      success: true,
      history: formattedHistory,
    };
  } catch (error) {
    console.error("[getAlertHistory] 이력 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "알림 이력을 불러오는데 실패했습니다.",
    };
  }
}

