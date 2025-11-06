/**
 * @file contact-button.tsx
 * @description 문의/예약 버튼 컴포넌트
 *
 * 여행지 상세페이지에서 문의 및 예약을 위한 버튼 컴포넌트
 *
 * 주요 기능:
 * 1. 홈페이지 링크를 통한 문의 기능
 * 2. 전화번호를 통한 문의 기능
 * 3. 예약 가능 여부 표시 (숙박 시설의 경우)
 * 4. 외부 예약 플랫폼 링크 (향후 확장 가능)
 *
 * @dependencies
 * - components/ui/button.tsx: Button 컴포넌트
 * - components/ui/dropdown-menu.tsx: DropdownMenu 컴포넌트
 * - lucide-react: Phone, Globe, Calendar, ExternalLink 아이콘
 * - types/travel.ts: TravelSiteDetail 타입
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Phone, Globe, Calendar, ExternalLink, MessageCircle } from "lucide-react";
import type { TravelSiteDetail } from "@/types/travel";

interface ContactButtonProps {
  travel: TravelSiteDetail;
  className?: string;
}

// 숙박 시설 타입 ID (TourAPI 기준)
const ACCOMMODATION_TYPE_ID = "32";

export function ContactButton({ travel, className }: ContactButtonProps) {
  const isAccommodation = travel.contenttypeid === ACCOMMODATION_TYPE_ID;
  const hasPhone = !!travel.tel;
  const hasHomepage = !!travel.homepage;

  // 예약 가능 여부 확인 (숙박 시설의 경우)
  const isReservationAvailable = isAccommodation && hasHomepage;

  // 전화번호 클릭 핸들러
  const handlePhoneClick = () => {
    if (travel.tel) {
      console.log("[ContactButton] 전화번호 클릭:", travel.tel);
      window.location.href = `tel:${travel.tel}`;
    }
  };

  // 홈페이지 열기 핸들러
  const handleHomepageClick = () => {
    if (travel.homepage) {
      console.log("[ContactButton] 홈페이지 열기:", travel.homepage);
      window.open(travel.homepage, "_blank", "noopener,noreferrer");
    }
  };

  // 예약 플랫폼 링크 (향후 확장 가능)
  const reservationPlatforms = [
    {
      name: "여기어때",
      url: `https://www.goodchoice.kr/product/detail?pid=${travel.contentid}`,
      available: false, // API 연동 전까지 비활성화
    },
    {
      name: "야놀자",
      url: `https://www.yanolja.com/search?keyword=${encodeURIComponent(travel.title)}`,
      available: false, // API 연동 전까지 비활성화
    },
  ];

  // 전화번호와 홈페이지가 모두 없는 경우
  if (!hasPhone && !hasHomepage) {
    return null;
  }

  // 전화번호만 있는 경우
  if (hasPhone && !hasHomepage) {
    return (
      <Button
        onClick={handlePhoneClick}
        className={className}
        size="lg"
        variant="default"
      >
        <Phone className="w-4 h-4 mr-2" />
        전화 문의
      </Button>
    );
  }

  // 홈페이지만 있는 경우
  if (!hasPhone && hasHomepage) {
    return (
      <Button
        onClick={handleHomepageClick}
        className={className}
        size="lg"
        variant="default"
      >
        <Globe className="w-4 h-4 mr-2" />
        {isAccommodation ? "예약하기" : "홈페이지"}
      </Button>
    );
  }

  // 전화번호와 홈페이지가 모두 있는 경우 - 드롭다운 메뉴
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className} size="lg" variant="default">
          <MessageCircle className="w-4 h-4 mr-2" />
          {isReservationAvailable ? "예약/문의" : "문의하기"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {isReservationAvailable ? "예약 및 문의" : "문의 방법"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasHomepage && (
          <DropdownMenuItem onClick={handleHomepageClick}>
            <Globe className="w-4 h-4 mr-2" />
            <span>{isAccommodation ? "홈페이지 예약" : "홈페이지 방문"}</span>
            <ExternalLink className="w-3 h-3 ml-auto" />
          </DropdownMenuItem>
        )}
        {hasPhone && (
          <DropdownMenuItem onClick={handlePhoneClick}>
            <Phone className="w-4 h-4 mr-2" />
            <span>전화 문의</span>
            <span className="ml-auto text-xs text-gray-500">{travel.tel}</span>
          </DropdownMenuItem>
        )}
        {isReservationAvailable && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-gray-500">
              예약 플랫폼 (준비 중)
            </DropdownMenuLabel>
            {reservationPlatforms.map((platform) => (
              <DropdownMenuItem
                key={platform.name}
                disabled={!platform.available}
                className="opacity-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span>{platform.name}</span>
                {platform.available && (
                  <ExternalLink className="w-3 h-3 ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

