/**
 * @file dashboard.ts
 * @description 대시보드 유틸리티 함수
 */

import { randomBytes } from "crypto";

/**
 * 대시보드 공유 토큰 생성
 * 서버 사이드와 클라이언트 사이드 모두에서 사용 가능
 */
export function generateDashboardShareToken(): string {
  // 32자리 16진수 문자열 생성
  if (typeof window === "undefined") {
    // 서버 사이드: Node.js crypto 모듈 사용
    return randomBytes(16).toString("hex");
  } else {
    // 클라이언트 사이드: Web Crypto API 사용
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

/**
 * 위젯 타입 목록
 */
export const WIDGET_TYPES = [
  { id: "time_series", name: "시간대별 통계", icon: "📈" },
  { id: "region_type", name: "지역별/타입별 통계", icon: "🗺️" },
  { id: "performance", name: "성능 모니터링", icon: "⚡" },
  { id: "cost", name: "비용 분석", icon: "💰" },
  { id: "user_behavior", name: "사용자 행동 분석", icon: "👥" },
  { id: "predictions", name: "예측 분석", icon: "🔮" },
  { id: "report", name: "리포트 생성", icon: "📊" },
  { id: "alert", name: "알림 시스템", icon: "🔔" },
  { id: "data_export", name: "데이터 내보내기", icon: "💾" },
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number]["id"];

