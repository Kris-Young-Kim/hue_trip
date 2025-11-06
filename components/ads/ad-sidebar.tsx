/**
 * @file ad-sidebar.tsx
 * @description 사이드바 광고 컴포넌트
 *
 * 사이드바에 표시되는 광고 컴포넌트
 * 일반적으로 300x250 또는 300x600 크기의 직사각형 광고
 *
 * 주요 기능:
 * 1. 사이드바에 최적화된 광고 크기
 * 2. Sticky 위치 지원
 * 3. 반응형 처리
 *
 * @dependencies
 * - components/ads/ad-banner.tsx: AdBanner 컴포넌트
 */

"use client";

import { AdBanner } from "./ad-banner";

interface AdSidebarProps {
  /**
   * 광고 슬롯 ID (Google AdSense)
   */
  adSlot?: string;
  /**
   * 광고 클라이언트 ID (Google AdSense)
   */
  adClient?: string;
  /**
   * Sticky 위치 여부
   */
  sticky?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
}

export function AdSidebar({
  adSlot,
  adClient,
  sticky = false,
  className = "",
}: AdSidebarProps) {
  return (
    <div
      className={`${sticky ? "sticky top-24" : ""} ${className}`}
    >
      <AdBanner
        adSlot={adSlot}
        adClient={adClient}
        format="rectangle"
        width={300}
        height={250}
        showPlaceholder={true}
        className="w-full max-w-[300px] mx-auto"
      />
    </div>
  );
}

