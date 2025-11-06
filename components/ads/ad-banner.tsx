/**
 * @file ad-banner.tsx
 * @description 광고 배너 컴포넌트
 *
 * Google AdSense 또는 기타 광고 네트워크의 배너 광고를 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. Google AdSense 광고 표시
 * 2. 광고 로딩 상태 처리
 * 3. 광고 클릭 추적 (선택 사항)
 * 4. 반응형 크기 조정
 *
 * @dependencies
 * - next/script: Script 컴포넌트 (AdSense 스크립트 로드)
 */

"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface AdBannerProps {
  /**
   * 광고 슬롯 ID (Google AdSense)
   * 예: "1234567890"
   */
  adSlot?: string;
  /**
   * 광고 클라이언트 ID (Google AdSense)
   * 예: "ca-pub-1234567890123456"
   */
  adClient?: string;
  /**
   * 광고 형식
   * - "banner": 배너 광고 (728x90, 320x50 등)
   * - "rectangle": 직사각형 광고 (300x250)
   * - "auto": 자동 크기
   */
  format?: "banner" | "rectangle" | "auto";
  /**
   * 광고 크기 (픽셀)
   * format이 "auto"가 아닌 경우 사용
   */
  width?: number;
  height?: number;
  /**
   * 플레이스홀더 표시 여부 (AdSense 승인 전)
   */
  showPlaceholder?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
}

export function AdBanner({
  adSlot,
  adClient,
  format = "auto",
  width,
  height,
  showPlaceholder = true,
  className = "",
}: AdBannerProps) {
  const [isAdSenseLoaded, setIsAdSenseLoaded] = useState(false);

  // 환경 변수에서 AdSense 클라이언트 ID 가져오기
  const clientId =
    adClient ||
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ||
    "";

  // AdSense 스크립트 로드 완료 처리
  useEffect(() => {
    if (isAdSenseLoaded && typeof window !== "undefined" && (window as any).adsbygoogle) {
      try {
        // AdSense 초기화
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        console.log("[AdBanner] AdSense 초기화 완료");
      } catch (error) {
        console.error("[AdBanner] AdSense 초기화 오류:", error);
      }
    }
  }, [isAdSenseLoaded]);

  // AdSense가 설정되지 않은 경우 플레이스홀더 표시
  if (!clientId || !adSlot) {
    if (!showPlaceholder) {
      return null;
    }

    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : format === "banner" ? "90px" : "250px",
          minHeight: format === "banner" ? "90px" : "250px",
        }}
      >
        <div className="text-center p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            광고 영역
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {clientId ? "광고 슬롯 ID를 설정해주세요" : "AdSense 클라이언트 ID를 설정해주세요"}
          </div>
        </div>
      </div>
    );
  }

  // 광고 크기 결정
  const adStyle: React.CSSProperties = {
    display: "block",
    width: width ? `${width}px` : "100%",
    height: height ? `${height}px` : format === "banner" ? "90px" : "250px",
    minHeight: format === "banner" ? "90px" : "250px",
  };

  return (
    <>
      {/* Google AdSense 스크립트 로드 */}
      <Script
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        strategy="lazyOnload"
        crossOrigin="anonymous"
        onLoad={() => {
          console.log("[AdBanner] AdSense 스크립트 로드 완료");
          setIsAdSenseLoaded(true);
        }}
        onError={() => {
          console.error("[AdBanner] AdSense 스크립트 로드 실패");
        }}
      />

      {/* 광고 컨테이너 */}
      <div className={`flex items-center justify-center ${className}`}>
        <ins
          className="adsbygoogle"
          style={adStyle}
          data-ad-client={clientId}
          data-ad-slot={adSlot}
          data-ad-format={format === "auto" ? "auto" : undefined}
          data-full-width-responsive={format === "auto" ? "true" : "false"}
        />
      </div>
    </>
  );
}

