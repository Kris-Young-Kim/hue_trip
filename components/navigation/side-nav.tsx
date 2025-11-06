/**
 * @file side-nav.tsx
 * @description SNB (Side Navigation Bar) 컴포넌트
 *
 * 사이드 네비게이션 바 - 사이드바 형태의 네비게이션 메뉴
 *
 * 주요 기능:
 * 1. 빠른 링크 메뉴
 * 2. 카테고리 네비게이션
 * 3. 관련 페이지 링크
 * 4. 접근성 향상
 *
 * 접근성:
 * - ARIA 라벨 및 역할 정의
 * - 키보드 네비게이션 지원
 * - 스크린 리더 지원
 *
 * @dependencies
 * - next/link: 라우팅
 * - lucide-react: 아이콘
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SideNavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
  children?: SideNavItem[];
}

interface SideNavProps {
  title?: string;
  items: SideNavItem[];
  className?: string;
}

export function SideNav({ title, items, className }: SideNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "w-full lg:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6",
        className
      )}
      role="complementary"
      aria-label={title || "사이드 네비게이션"}
    >
      {title && (
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      )}
      <nav role="navigation" aria-label={title || "사이드 메뉴"}>
        <ul className="space-y-1" role="list">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} role="listitem">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                    active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <span className="w-4 h-4" aria-hidden="true">{item.icon}</span>}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {!item.badge && (
                    <ChevronRight className="w-4 h-4 opacity-50" aria-hidden="true" />
                  )}
                </Link>
                {item.children && item.children.length > 0 && (
                  <ul className="ml-6 mt-1 space-y-1" role="list">
                    {item.children.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <li key={child.href} role="listitem">
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                              childActive
                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            )}
                            aria-current={childActive ? "page" : undefined}
                          >
                            {child.icon && <span className="w-3.5 h-3.5" aria-hidden="true">{child.icon}</span>}
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

