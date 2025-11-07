/**
 * @file create-alert-rule.ts
 * @description 알림 규칙 생성 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export interface CreateAlertRuleInput {
  name: string;
  description?: string;
  metricType: "user_count" | "error_rate" | "api_response_time" | "page_load_time" | "cost" | "traffic" | "performance";
  thresholdValue: number;
  thresholdOperator: ">" | ">=" | "<" | "<=" | "==";
  checkIntervalMinutes?: number;
  enabled?: boolean;
  channels: string[]; // ['email', 'webhook', 'slack', 'discord']
}

export interface CreateAlertRuleResult {
  success: boolean;
  ruleId?: string;
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

export async function createAlertRule(
  input: CreateAlertRuleInput
): Promise<CreateAlertRuleResult> {
  console.group("[createAlertRule] 알림 규칙 생성 시작");
  console.log("규칙 이름:", input.name);

  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      console.warn("[createAlertRule] 관리자 권한 없음");
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    const { userId } = await auth();
    if (!userId) {
      console.warn("[createAlertRule] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = getServiceRoleClient();

    // 사용자 ID 조회
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!userData) {
      console.warn("[createAlertRule] 사용자 정보 없음");
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const { data: rule, error } = await supabase
      .from("alert_rules")
      .insert({
        name: input.name,
        description: input.description || null,
        metric_type: input.metricType,
        threshold_value: input.thresholdValue,
        threshold_operator: input.thresholdOperator,
        check_interval_minutes: input.checkIntervalMinutes || 5,
        enabled: input.enabled !== false,
        channels: input.channels,
        created_by: userData.id,
      })
      .select()
      .single();

    if (error || !rule) {
      console.error("[createAlertRule] 규칙 생성 실패:", error);
      console.groupEnd();
      return { success: false, error: "알림 규칙 생성에 실패했습니다." };
    }

    console.log("[createAlertRule] 규칙 생성 완료:", rule.id);
    console.groupEnd();

    return {
      success: true,
      ruleId: rule.id,
    };
  } catch (error) {
    console.error("[createAlertRule] 규칙 생성 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "알림 규칙 생성 중 오류가 발생했습니다.",
    };
  }
}

