/**
 * @file transport-info.tsx
 * @description 교통 정보 컴포넌트
 *
 * 여행지 상세페이지에서 교통 정보를 제공하는 컴포넌트
 *
 * 주요 기능:
 * 1. 네이버 지도 경로 안내 링크 제공
 * 2. 자동차/대중교통 경로 선택
 * 3. 사용자 위치 기반 경로 안내 (선택 사항)
 * 4. 주소 복사 기능
 *
 * @dependencies
 * - components/ui/card.tsx: Card 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: 아이콘
 * - types/travel.ts: TravelSiteDetail 타입
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  Car,
  Train,
  MapPin,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import type { TravelSiteDetail } from "@/types/travel";

interface TransportInfoProps {
  travel: TravelSiteDetail;
  className?: string;
}

/**
 * 네이버 지도 경로 안내 URL 생성
 */
function getNaverMapRouteUrl(
  destination: { lat: number; lng: number; address?: string },
  mode: "car" | "transit" = "car"
): string {
  const baseUrl = "https://map.naver.com/v5/directions";
  const params = new URLSearchParams({
    destination: destination.address || `${destination.lat},${destination.lng}`,
  });

  if (mode === "transit") {
    params.append("mode", "public");
  } else {
    params.append("mode", "car");
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * 카카오맵 경로 안내 URL 생성
 */
function getKakaoMapRouteUrl(
  destination: { lat: number; lng: number; address?: string },
  mode: "car" | "transit" = "car"
): string {
  const baseUrl = "https://map.kakao.com/link/to";
  const name = encodeURIComponent(destination.address || "목적지");
  const lat = destination.lat;
  const lng = destination.lng;

  if (mode === "transit") {
    return `${baseUrl}/public/${name},${lat},${lng}`;
  } else {
    return `${baseUrl}/${name},${lat},${lng}`;
  }
}

export function TransportInfo({ travel, className }: TransportInfoProps) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 좌표 파싱
  const lat = travel.mapy ? parseFloat(travel.mapy) : null;
  const lng = travel.mapx ? parseFloat(travel.mapx) : null;

  // 좌표가 없는 경우 컴포넌트를 렌더링하지 않음
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const destination = {
    lat,
    lng,
    address: travel.addr1 || undefined,
  };

  // 사용자 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("위치 서비스를 지원하지 않는 브라우저입니다.");
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        console.log("[TransportInfo] 사용자 위치:", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("[TransportInfo] 위치 가져오기 실패:", error);
        setLocationError("위치를 가져올 수 없습니다.");
      }
    );
  };

  // 주소 복사
  const copyAddress = async () => {
    if (!travel.addr1) return;

    try {
      await navigator.clipboard.writeText(travel.addr1);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      console.log("[TransportInfo] 주소 복사 완료:", travel.addr1);
    } catch (error) {
      console.error("[TransportInfo] 주소 복사 실패:", error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          교통 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 주소 정보 */}
        {travel.addr1 && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  주소
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {travel.addr1} {travel.addr2 || ""}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0"
                title="주소 복사"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 경로 안내 버튼 */}
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            경로 안내
          </div>

          {/* 네이버 지도 경로 안내 */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(
                  getNaverMapRouteUrl(destination, "car"),
                  "_blank",
                  "noopener,noreferrer"
                );
                console.log("[TransportInfo] 네이버 지도 자동차 경로 열기");
              }}
              className="flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span className="flex-1 text-left">네이버 지도</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(
                  getNaverMapRouteUrl(destination, "transit"),
                  "_blank",
                  "noopener,noreferrer"
                );
                console.log("[TransportInfo] 네이버 지도 대중교통 경로 열기");
              }}
              className="flex items-center gap-2"
            >
              <Train className="w-4 h-4" />
              <span className="flex-1 text-left">대중교통</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>

          {/* 카카오맵 경로 안내 */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(
                  getKakaoMapRouteUrl(destination, "car"),
                  "_blank",
                  "noopener,noreferrer"
                );
                console.log("[TransportInfo] 카카오맵 자동차 경로 열기");
              }}
              className="flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span className="flex-1 text-left">카카오맵</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open(
                  getKakaoMapRouteUrl(destination, "transit"),
                  "_blank",
                  "noopener,noreferrer"
                );
                console.log("[TransportInfo] 카카오맵 대중교통 경로 열기");
              }}
              className="flex items-center gap-2"
            >
              <Train className="w-4 h-4" />
              <span className="flex-1 text-left">대중교통</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* 사용자 위치 기반 경로 안내 (선택 사항) */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={getCurrentLocation}
            className="w-full text-sm"
            disabled={!!userLocation}
          >
            {userLocation ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                위치 확인 완료
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                현재 위치로 경로 안내
              </>
            )}
          </Button>
          {locationError && (
            <div className="mt-2 text-xs text-red-500">{locationError}</div>
          )}
          {userLocation && (
            <div className="mt-2 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://map.naver.com/v5/directions/${userLocation.lng},${userLocation.lat},,/${destination.lng},${destination.lat},,ADDRESS_POI/${destination.address || ""}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                  console.log("[TransportInfo] 현재 위치에서 경로 안내");
                }}
                className="w-full text-sm"
              >
                네이버 지도에서 경로 보기
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

