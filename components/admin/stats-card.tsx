/**
 * @file stats-card.tsx
 * @description 통계 카드 컴포넌트
 *
 * KPI 대시보드에서 사용할 재사용 가능한 통계 카드 컴포넌트
 *
 * @dependencies
 * - components/ui/card.tsx: Card 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Eye, 
  Bookmark, 
  MessageSquare,
  type LucideIcon 
} from "lucide-react";

// 아이콘 매핑
const iconMap: Record<string, LucideIcon> = {
  Users,
  Eye,
  Bookmark,
  MessageSquare,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
}: StatsCardProps) {
  // 아이콘이 문자열이면 매핑에서 찾고, 아니면 직접 사용
  const Icon = typeof icon === "string" ? iconMap[icon] : icon;
  const formattedValue =
    typeof value === "number" ? value.toLocaleString("ko-KR") : value;

  if (!Icon) {
    console.warn(`[StatsCard] 아이콘을 찾을 수 없습니다: ${typeof icon === "string" ? icon : "unknown"}`);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">전월 대비</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

