/**
 * @file check-alerts.ts
 * @description 알림 체크 및 발송 Server Action
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getPerformanceMetrics } from "@/actions/admin-stats/get-performance-metrics";
import { getCostAnalysis } from "@/actions/admin-stats/get-cost-analysis";
import { getTimeSeriesStats } from "@/actions/admin-stats/get-time-series-stats";

export interface CheckAlertsResult {
  success: boolean;
  alertsTriggered?: number;
  error?: string;
}

function checkThreshold(
  metricValue: number,
  thresholdValue: number,
  operator: string
): boolean {
  switch (operator) {
    case ">":
      return metricValue > thresholdValue;
    case ">=":
      return metricValue >= thresholdValue;
    case "<":
      return metricValue < thresholdValue;
    case "<=":
      return metricValue <= thresholdValue;
    case "==":
      return Math.abs(metricValue - thresholdValue) < 0.01; // 부동소수점 오차 고려
    default:
      return false;
  }
}

async function sendAlert(
  ruleId: string,
  metricType: string,
  metricValue: number,
  thresholdValue: number,
  channel: string,
  message: string
): Promise<void> {
  const supabase = getServiceRoleClient();

  // 알림 이력 기록
  const { error } = await supabase.from("alert_history").insert({
    rule_id: ruleId,
    metric_type: metricType,
    metric_value: metricValue,
    threshold_value: thresholdValue,
    message,
    channel,
    status: "pending",
  });

  if (error) {
    console.error("[sendAlert] 알림 이력 기록 실패:", error);
    return;
  }

  // 실제 알림 발송 (웹훅의 경우)
  if (channel === "webhook" || channel === "slack" || channel === "discord") {
    try {
      // 웹훅 URL은 환경변수나 채널 설정에서 가져와야 함
      const webhookUrl = process.env[`${channel.toUpperCase()}_WEBHOOK_URL`];
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: message,
            metricType,
            metricValue,
            thresholdValue,
          }),
        });

        // 발송 성공으로 업데이트
        await supabase
          .from("alert_history")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("rule_id", ruleId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1);
      }
    } catch (error) {
      console.error(`[sendAlert] ${channel} 알림 발송 실패:`, error);
      // 발송 실패로 업데이트
      await supabase
        .from("alert_history")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq("rule_id", ruleId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);
    }
  } else if (channel === "email") {
    // 이메일 알림은 추후 구현
    console.log("[sendAlert] 이메일 알림 (추후 구현):", message);
  }
}

export async function checkAlerts(): Promise<CheckAlertsResult> {
  console.group("[checkAlerts] 알림 체크 시작");

  try {
    const supabase = getServiceRoleClient();

    // 활성화된 알림 규칙 조회
    const { data: rules, error: rulesError } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("enabled", true);

    if (rulesError || !rules || rules.length === 0) {
      console.log("[checkAlerts] 활성화된 규칙 없음");
      console.groupEnd();
      return { success: true, alertsTriggered: 0 };
    }

    let alertsTriggered = 0;

    // 각 규칙에 대해 체크
    for (const rule of rules) {
      let metricValue: number | null = null;
      let message = "";

      // 지표 값 조회
      switch (rule.metric_type) {
        case "error_rate": {
          const perfResult = await getPerformanceMetrics("24hours");
          if (perfResult.success && perfResult.errorRates) {
            const totalErrors = perfResult.errorRates.reduce(
              (sum, er) => sum + er.errorCount,
              0
            );
            const totalRequests = perfResult.errorRates.reduce(
              (sum, er) => sum + er.totalRequests,
              0
            );
            metricValue = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
            message = `에러율이 ${metricValue.toFixed(2)}%로 임계값(${rule.threshold_value}%)을 초과했습니다.`;
          }
          break;
        }
        case "api_response_time": {
          const perfResult = await getPerformanceMetrics("24hours");
          if (perfResult.success && perfResult.apiResponseStats) {
            metricValue = perfResult.apiResponseStats.average;
            message = `API 평균 응답 시간이 ${metricValue.toFixed(2)}ms로 임계값(${rule.threshold_value}ms)을 초과했습니다.`;
          }
          break;
        }
        case "page_load_time": {
          const perfResult = await getPerformanceMetrics("24hours");
          if (perfResult.success && perfResult.pageLoadStats) {
            metricValue = perfResult.pageLoadStats.average;
            message = `페이지 평균 로드 시간이 ${metricValue.toFixed(2)}ms로 임계값(${rule.threshold_value}ms)을 초과했습니다.`;
          }
          break;
        }
        case "cost": {
          const costResult = await getCostAnalysis("1month");
          if (costResult.success && costResult.totalCost !== undefined) {
            metricValue = costResult.totalCost;
            message = `월간 비용이 ${metricValue.toLocaleString()}원으로 임계값(${rule.threshold_value.toLocaleString()}원)을 초과했습니다.`;
          }
          break;
        }
        case "user_count": {
          const statsResult = await getTimeSeriesStats("7days");
          if (statsResult.success && statsResult.data) {
            const totalUsers = statsResult.data.reduce((sum, d) => sum + d.users, 0);
            metricValue = totalUsers;
            message = `7일간 신규 사용자 수가 ${metricValue}명으로 임계값(${rule.threshold_value}명)을 초과했습니다.`;
          }
          break;
        }
      }

      // 임계값 체크
      if (metricValue !== null) {
        const shouldAlert = checkThreshold(
          metricValue,
          rule.threshold_value,
          rule.threshold_operator
        );

        if (shouldAlert) {
          // 각 채널로 알림 발송
          const channels = (rule.channels as string[]) || [];
          for (const channel of channels) {
            await sendAlert(
              rule.id,
              rule.metric_type,
              metricValue,
              rule.threshold_value,
              channel,
              message
            );
          }
          alertsTriggered++;
        }
      }
    }

    console.log("[checkAlerts] 알림 체크 완료:", alertsTriggered, "개 알림 발송");
    console.groupEnd();

    return {
      success: true,
      alertsTriggered,
    };
  } catch (error) {
    console.error("[checkAlerts] 알림 체크 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "알림 체크 중 오류가 발생했습니다.",
    };
  }
}

