/**
 * @file safety-card.tsx
 * @description 여행 안전 정보 카드 컴포넌트
 *
 * 여행 안전 정보 목록에서 개별 안전 정보를 표시하는 카드 컴포넌트
 *
 * 주요 기능:
 * 1. 여행 안전 정보 제목, 썸네일 이미지 표시
 * 2. 여행 유형/주제 태그 표시
 * 3. 클릭 시 상세 페이지로 이동
 *
 * @dependencies
 * - components/ui/card.tsx: Card 컴포넌트
 * - lucide-react: 아이콘
 * - types: TravelSafetyGuideline 타입
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Plane, Tag, MapPin } from "lucide-react";
import type { TravelSafetyGuideline } from "@/lib/api/safety-guidelines";

interface SafetyCardProps {
  guideline: TravelSafetyGuideline;
  showTravelType?: boolean;
  showTopic?: boolean;
}

const TRAVEL_TYPE_LABELS: Record<string, string> = {
  domestic: "국내여행",
  overseas: "해외여행",
  free: "자유여행",
  package: "패키지여행",
  all: "전체",
};

const TOPIC_LABELS: Record<string, string> = {
  transportation: "교통안전",
  health: "건강",
  natural_disaster: "자연재해",
  crime_prevention: "범죄예방",
  travel_insurance: "여행보험",
  emergency_contact: "비상연락처",
  food_safety: "식품안전",
  accommodation: "숙박안전",
  money: "금융/환전",
  communication: "통신",
  culture: "문화/예의",
  general: "일반",
};

export function SafetyCard({ guideline, showTravelType = true, showTopic = true }: SafetyCardProps) {
  const travelTypeLabel = guideline.travel_type ? TRAVEL_TYPE_LABELS[guideline.travel_type] : null;
  const topicLabel = TOPIC_LABELS[guideline.topic] || guideline.topic;

  return (
    <Link href={`/safety/${guideline.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
        {/* 썸네일 이미지 */}
        {guideline.image_url && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={guideline.image_url}
              alt={guideline.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <CardHeader>
          <CardTitle className="line-clamp-2 min-h-[3rem]">{guideline.title}</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {showTravelType && travelTypeLabel && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Plane className="w-3 h-3" aria-hidden="true" />
                {travelTypeLabel}
              </Badge>
            )}
            {showTopic && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="w-3 h-3" aria-hidden="true" />
                {topicLabel}
              </Badge>
            )}
            {guideline.region && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {guideline.region}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {guideline.content.replace(/[#*]/g, "").substring(0, 100)}...
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" aria-hidden="true" />
            여행 안전 정보
          </div>
          {guideline.view_count > 0 && (
            <span>조회 {guideline.view_count.toLocaleString()}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

