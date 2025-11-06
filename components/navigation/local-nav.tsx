/**
 * @file local-nav.tsx
 * @description LNB (Local Navigation Bar) 컴포넌트
 *
 * 로컬 네비게이션 바 - 현재 페이지/섹션 내에서 사용되는 네비게이션
 *
 * 주요 기능:
 * 1. 페이지별 탭 네비게이션
 * 2. 필터/정렬 옵션
 * 3. 뷰 모드 전환 (목록/지도)
 * 4. 브레드크럼 네비게이션
 *
 * 접근성:
 * - ARIA 라벨 및 역할 정의
 * - 키보드 네비게이션 지원
 * - 현재 위치 표시
 *
 * @dependencies
 * - components/ui/tabs.tsx: 탭 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface LocalNavProps {
  children?: ReactNode;
  className?: string;
}

interface LocalNavTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: Array<{
    value: string;
    label: string;
    icon?: ReactNode;
  }>;
  className?: string;
}

export function LocalNav({ children, className }: LocalNavProps) {
  return (
    <nav
      className={cn("border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900", className)}
      role="navigation"
      aria-label="로컬 네비게이션"
    >
      {children}
    </nav>
  );
}

export function LocalNavTabs({ value, onValueChange, items, className }: LocalNavTabsProps) {
  return (
    <div className={cn("px-4 md:px-6", className)}>
      <Tabs value={value} onValueChange={onValueChange}>
        <TabsList className="w-full md:w-auto" role="tablist">
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              role="tab"
              aria-selected={value === item.value}
            >
              {item.icon}
              <span>{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

