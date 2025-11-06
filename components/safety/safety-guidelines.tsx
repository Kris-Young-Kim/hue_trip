/**
 * @file safety-guidelines.tsx
 * @description 여행 안전 정보 목록 컴포넌트
 *
 * 여행 안전 정보 목록을 표시하고 필터링하는 컴포넌트
 *
 * 주요 기능:
 * 1. 여행 안전 정보 목록 표시
 * 2. 여행 유형/주제별 필터링
 * 3. 검색 기능
 *
 * @dependencies
 * - components/safety/safety-card.tsx: SafetyCard 컴포넌트
 * - components/ui/tabs.tsx: Tabs 컴포넌트
 * - lib/api/safety-guidelines.ts: getTravelSafetyGuidelines 함수
 */

"use client";

import { useState, useEffect } from "react";
import { SafetyCard } from "./safety-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { TravelSafetyGuideline } from "@/lib/api/safety-guidelines";

interface SafetyGuidelinesProps {
  initialGuidelines?: TravelSafetyGuideline[];
  defaultTravelType?: "domestic" | "overseas" | "free" | "package" | "all";
  defaultTopic?: string;
}

/**
 * 클라이언트 사이드에서 여행 안전 정보 조회
 */
async function fetchTravelSafetyGuidelines(filter: any): Promise<TravelSafetyGuideline[]> {
  const params = new URLSearchParams();
  if (filter.travel_type && filter.travel_type !== "all") {
    params.append("travel_type", filter.travel_type);
  }
  if (filter.topic && filter.topic !== "all") {
    params.append("topic", filter.topic);
  }
  if (filter.region) {
    params.append("region", filter.region);
  }
  if (filter.country_code) {
    params.append("country_code", filter.country_code);
  }
  if (filter.search) {
    params.append("search", filter.search);
  }
  if (filter.limit) {
    params.append("limit", filter.limit.toString());
  }
  if (filter.offset) {
    params.append("offset", filter.offset.toString());
  }

  const response = await fetch(`/api/safety-guidelines?${params.toString()}`);
  if (!response.ok) {
    throw new Error("여행 안전 정보 조회 실패");
  }
  return response.json();
}

export function SafetyGuidelines({
  initialGuidelines = [],
  defaultTravelType,
  defaultTopic,
}: SafetyGuidelinesProps) {
  const [guidelines, setGuidelines] = useState<TravelSafetyGuideline[]>(initialGuidelines);
  const [selectedTravelType, setSelectedTravelType] = useState<
    "domestic" | "overseas" | "free" | "package" | "all"
  >(defaultTravelType || "all");
  const [selectedTopic] = useState<string>(defaultTopic || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGuidelines = async () => {
      setIsLoading(true);
      try {
        const filter: any = {};
        if (selectedTravelType !== "all") {
          filter.travel_type = selectedTravelType;
        }
        if (selectedTopic !== "all") {
          filter.topic = selectedTopic;
        }
        if (searchQuery.trim()) {
          filter.search = searchQuery.trim();
        }

        const data = await fetchTravelSafetyGuidelines(filter);
        setGuidelines(data);
      } catch (error) {
        console.error("[SafetyGuidelines] 여행 안전 정보 조회 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuidelines();
  }, [selectedTravelType, selectedTopic, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <Input
          type="search"
          placeholder="여행 안전 정보 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="여행 안전 정보 검색"
        />
      </div>

      {/* 여행 유형별 탭 */}
      <Tabs value={selectedTravelType} onValueChange={(value) => setSelectedTravelType(value as any)}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="domestic">국내여행</TabsTrigger>
          <TabsTrigger value="overseas">해외여행</TabsTrigger>
          <TabsTrigger value="free">자유여행</TabsTrigger>
          <TabsTrigger value="package">패키지여행</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 여행 안전 정보 목록 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : guidelines.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? "검색 결과가 없습니다." : "여행 안전 정보가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidelines.map((guideline) => (
            <SafetyCard key={guideline.id} guideline={guideline} />
          ))}
        </div>
      )}
    </div>
  );
}

