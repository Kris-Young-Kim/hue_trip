/**
 * @file page.tsx
 * @description Pitch Camping 홈페이지
 *
 * 캠핑장 목록, 필터, 검색, 지도 기능을 통합한 메인 페이지
 *
 * 주요 기능:
 * 1. 필터 컴포넌트 (지역, 타입, 시설, 정렬)
 * 2. 캠핑장 목록 표시
 * 3. 네이버 지도 연동
 * 4. 리스트-지도 상호연동
 * 5. URL 쿼리 파라미터 기반 필터 상태 관리
 *
 * @dependencies
 * - components/camping-filters.tsx: CampingFilters 컴포넌트
 * - components/camping-list.tsx: CampingList 컴포넌트
 * - components/camping-search.tsx: CampingSearch 컴포넌트
 * - components/naver-map.tsx: NaverMap 컴포넌트
 * - types/camping.ts: CampingFilter, CampingSite 타입
 */

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { CampingFilters } from "@/components/camping-filters";
import { CampingList } from "@/components/camping-list";
import { CampingSearch } from "@/components/camping-search";
import { MapSkeleton } from "@/components/loading/map-skeleton";
import { LocalNav, LocalNavTabs } from "@/components/navigation/local-nav";
import { Map, List } from "lucide-react";
import type { CampingFilter, CampingSite } from "@/types/camping";
import { REGIONS, CAMPING_TYPES } from "@/constants/camping";

// NaverMap 동적 import (SSR 비활성화, 번들 분리)
const NaverMap = dynamic(
  () =>
    import("@/components/naver-map").then((mod) => ({ default: mod.NaverMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

function HomeContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<CampingFilter>({});
  const [campings, setCampings] = useState<CampingSite[]>([]);
  const [selectedCampingId, setSelectedCampingId] = useState<
    string | undefined
  >();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // URL 쿼리 파라미터로부터 필터 초기화
  useEffect(() => {
    console.group("[Home] 필터 초기화");
    const region = searchParams.get("region");
    const type = searchParams.get("type");
    const facilities = searchParams.get("facilities");
    const keyword = searchParams.get("keyword");
    const sort = searchParams.get("sort");
    const view = searchParams.get("view") as "list" | "map" | null;

    const initialFilter: CampingFilter = {};

    if (region && region !== REGIONS.ALL) {
      initialFilter.doNm = region;
    }

    if (type && type !== CAMPING_TYPES.ALL) {
      initialFilter.induty = type;
    }

    if (facilities) {
      initialFilter.sbrsCl = facilities;
    }

    if (keyword) {
      initialFilter.keyword = keyword;
    }

    if (sort) {
      initialFilter.sortOrder = sort as CampingFilter["sortOrder"];
    }

    if (view === "map") {
      setViewMode("map");
    }

    console.log("초기 필터:", initialFilter);
    setFilter(initialFilter);
    console.groupEnd();
  }, [searchParams]);

  const handleFilterChange = useCallback((newFilter: CampingFilter) => {
    console.log("[Home] 필터 변경 콜백:", newFilter);
    setFilter(newFilter);
    setSelectedCampingId(undefined); // 필터 변경 시 선택 해제
  }, []);

  const handleCampingClick = (camping: CampingSite) => {
    console.log("[Home] 캠핑장 클릭:", camping.facltNm);
    setSelectedCampingId(camping.contentId);
  };

  const handleCampingListUpdate = (campings: CampingSite[]) => {
    console.log("[Home] 캠핑장 목록 업데이트:", campings.length);
    setCampings(campings);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
              한국의 아름다운
              <br />
              <span className="text-green-600 dark:text-green-400">
                캠핑장을 탐험하세요
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              전국 캠핑장 정보를 한눈에 확인하고, 나만의 캠핑 여행을
              계획해보세요
            </p>

            {/* 검색창 - Hero 스타일 */}
            <div className="max-w-3xl mx-auto mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 border border-gray-200 dark:border-gray-700">
                <CampingSearch
                  onSearch={(keyword) => {
                    console.log("[Home] 검색 실행:", keyword);
                    setFilter((prev) => ({
                      ...prev,
                      keyword: keyword || undefined,
                      pageNo: 1,
                    }));
                  }}
                  placeholder="지역, 캠핑장명으로 검색해보세요..."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* LNB: 모바일 뷰 모드 전환 */}
        <div className="lg:hidden mb-6">
          <LocalNav>
            <LocalNavTabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "list" | "map")}
              items={[
                {
                  value: "list",
                  label: "목록",
                  icon: <List className="w-4 h-4" />,
                },
                {
                  value: "map",
                  label: "지도",
                  icon: <Map className="w-4 h-4" />,
                },
              ]}
            />
          </LocalNav>
        </div>

        {/* 필터 및 콘텐츠 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* 필터 사이드바 - Sticky */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <CampingFilters onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* 목록 및 지도 영역 */}
          <div className="lg:col-span-9">
            {/* 데스크톱: 리스트와 지도 분할 */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6">
              {/* 리스트 영역 */}
              <div className="space-y-4">
                <CampingList
                  filter={filter}
                  onCampingClick={handleCampingClick}
                  onCampingsChange={handleCampingListUpdate}
                />
              </div>

              {/* 지도 영역 */}
              <div className="sticky top-24 h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                <NaverMap
                  campings={campings}
                  onMarkerClick={handleCampingClick}
                  selectedCampingId={selectedCampingId}
                  className="h-full"
                />
              </div>
            </div>

            {/* 모바일: 탭 콘텐츠 */}
            <div className="lg:hidden">
              {viewMode === "list" ? (
                <CampingList
                  filter={filter}
                  onCampingClick={handleCampingClick}
                  onCampingsChange={handleCampingListUpdate}
                />
              ) : (
                <div className="h-[600px]">
                  <NaverMap
                    campings={campings}
                    onMarkerClick={handleCampingClick}
                    selectedCampingId={selectedCampingId}
                    className="h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
