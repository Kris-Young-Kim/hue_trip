/**
 * @file [id]/page.tsx
 * @description 여행 안전 정보 상세 페이지
 *
 * 개별 여행 안전 정보의 상세 내용을 표시하는 페이지
 *
 * 주요 기능:
 * 1. 여행 안전 정보 상세 내용 표시
 * 2. 이미지 및 동영상 표시
 * 3. 관련 여행 안전 정보 추천
 * 4. 조회수 추적
 *
 * @dependencies
 * - lib/api/safety-guidelines.ts: getTravelSafetyGuidelineById, incrementTravelSafetyGuidelineView 함수
 * - components/safety/safety-video.tsx: SafetyVideo 컴포넌트
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Plane, Tag, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTravelSafetyGuidelineById,
  incrementTravelSafetyGuidelineView,
  getRecommendedTravelSafetyGuidelines,
} from "@/lib/api/safety-guidelines";
import { SafetyVideo } from "@/components/safety/safety-video";
import { SafetyCard } from "@/components/safety/safety-card";

interface SafetyDetailPageProps {
  params: Promise<{ id: string }>;
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

export default async function SafetyDetailPage({ params }: SafetyDetailPageProps) {
  const { id } = await params;

  console.group(`[SafetyDetailPage] 페이지 로드: ${id}`);

  const guideline = await getTravelSafetyGuidelineById(id);

  if (!guideline) {
    console.warn("[SafetyDetailPage] 여행 안전 정보 없음");
    notFound();
  }

  // 조회수 증가 (비동기, 에러 발생해도 페이지 렌더링 계속)
  incrementTravelSafetyGuidelineView(id).catch((err) => {
    console.error("[SafetyDetailPage] 조회수 추적 오류:", err);
  });

  // 관련 여행 안전 정보 추천
  const recommendedGuidelines = await getRecommendedTravelSafetyGuidelines(3, guideline.region || undefined);

  console.groupEnd();

  const travelTypeLabel = guideline.travel_type ? TRAVEL_TYPE_LABELS[guideline.travel_type] : null;
  const topicLabel = TOPIC_LABELS[guideline.topic] || guideline.topic;

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4" id="main-content">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link href="/safety">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            여행 안전 정보 목록으로
          </Button>
        </Link>

        {/* 상세 내용 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl">{guideline.title}</CardTitle>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                {travelTypeLabel && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Plane className="w-3 h-3" aria-hidden="true" />
                    {travelTypeLabel}
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" aria-hidden="true" />
                  {topicLabel}
                </Badge>
                {guideline.region && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {guideline.region}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 대표 이미지 */}
            {guideline.image_url && (
              <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={guideline.image_url}
                  alt={guideline.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            {/* 본문 내용 */}
            <div className="prose dark:prose-invert max-w-none">
              <div
                className="whitespace-pre-line text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: guideline.content.replace(/\n/g, "<br />") }}
              />
            </div>

            {/* 동영상 */}
            {guideline.video_url && (
              <SafetyVideo
                videoUrl={guideline.video_url}
                videoType={guideline.video_type}
                title={guideline.title}
                thumbnailUrl={guideline.image_url || undefined}
              />
            )}

            {/* 출처 */}
            {guideline.source_url && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  출처:
                  <a
                    href={guideline.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {guideline.source_name || "출처 링크"}
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 관련 여행 안전 정보 추천 */}
        {recommendedGuidelines.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" aria-hidden="true" />
              관련 여행 안전 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedGuidelines
                .filter((g) => g.id !== guideline.id)
                .slice(0, 3)
                .map((g) => (
                  <SafetyCard key={g.id} guideline={g} />
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

