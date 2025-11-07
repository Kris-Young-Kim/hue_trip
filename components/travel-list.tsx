/**
 * @file travel-list.tsx
 * @description 여행지 목록 컴포넌트
 *
 * TourAPI를 호출하여 여행지 목록을 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 필터 기반 여행지 목록 조회
 * 2. 그리드 레이아웃 (반응형)
 * 3. 로딩 상태 표시 (Skeleton UI)
 * 4. 에러 처리
 * 5. 빈 결과 처리
 * 6. 페이지네이션
 *
 * @dependencies
 * - types/travel.ts: TravelSite, TravelFilter 타입
 * - lib/api/travel-api.ts: travelApi 클라이언트
 * - components/travel-card.tsx: TravelCard 컴포넌트
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { TravelCard } from "@/components/travel-card";
import { CardSkeleton } from "@/components/loading/card-skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { TravelSite, TravelFilter } from "@/types/travel";
import { normalizeTravelItems } from "@/lib/utils/travel";
import { PAGINATION_DEFAULTS } from "@/constants/travel";

interface TravelListProps {
  filter?: TravelFilter;
  onTravelClick?: (travel: TravelSite) => void;
  onTravelsChange?: (travels: TravelSite[]) => void;
}

export function TravelList({ filter, onTravelClick, onTravelsChange }: TravelListProps) {
  const searchParams = useSearchParams();
  const [travels, setTravels] = useState<TravelSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [totalCount, setTotalCount] = useState(0);

  // onTravelsChange를 ref로 저장하여 안정화
  const onTravelsChangeRef = useRef(onTravelsChange);
  useEffect(() => {
    onTravelsChangeRef.current = onTravelsChange;
  }, [onTravelsChange]);

  useEffect(() => {
    const fetchTravels = async () => {
      setLoading(true);
      setError(null);

      try {
        const filterWithPage: TravelFilter = {
          ...filter,
          pageNo: page,
          numOfRows: PAGINATION_DEFAULTS.PAGE_SIZE,
        };

        const params = new URLSearchParams();
        if (filterWithPage.pageNo) params.set("pageNo", String(filterWithPage.pageNo));
        if (filterWithPage.numOfRows) params.set("numOfRows", String(filterWithPage.numOfRows));
        if (filterWithPage.areaCode) params.set("areaCode", filterWithPage.areaCode);
        if (filterWithPage.sigunguCode) params.set("sigunguCode", filterWithPage.sigunguCode);
        if (filterWithPage.contentTypeId) params.set("contentTypeId", filterWithPage.contentTypeId);
        if (filterWithPage.cat1) params.set("cat1", filterWithPage.cat1);
        if (filterWithPage.cat2) params.set("cat2", filterWithPage.cat2);
        if (filterWithPage.cat3) params.set("cat3", filterWithPage.cat3);
        if (filterWithPage.keyword) params.set("keyword", filterWithPage.keyword);
        if (filterWithPage.arrange) params.set("arrange", filterWithPage.arrange);

        const response = await fetch(`/api/travels?${params.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `API 요청 실패: ${response.status}`;
          const errorDetails = errorData.details;
          
          if (errorDetails?.apiKeyConfigured === false) {
            throw new Error("서버 환경 변수 TOUR_API_KEY가 설정되지 않았습니다. 관리자에게 문의하세요.");
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const items = normalizeTravelItems(data.response?.body?.items?.item);

        setTravels(items);
        setTotalCount(data.response?.body?.totalCount || 0);
        onTravelsChangeRef.current?.(items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "여행지 목록을 불러오는데 실패했습니다."
        );
        setTravels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTravels();
  }, [filter, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    setError(null);
    setPage(1);
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalCount / PAGINATION_DEFAULTS.PAGE_SIZE);

  // 로딩 상태
  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="여행지 목록 로딩 중">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <span className="sr-only">여행지 목록을 불러오는 중입니다...</span>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {error}
        </p>
        <Button 
          onClick={handleRetry} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  // 빈 결과 상태
  if (travels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          여행지를 찾을 수 없습니다
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
          검색 조건을 변경하거나 필터를 초기화해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="여행지 목록">
      {/* 결과 개수 표시 */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700" aria-live="polite">
        <div className="text-base font-semibold text-gray-900 dark:text-white">
          총 <span className="text-blue-600 dark:text-blue-400">{totalCount.toLocaleString()}</span>개의 여행지
        </div>
      </div>

      {/* 여행지 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" role="list">
        {travels.map((travel) => (
          <div key={travel.contentid} role="listitem">
            <TravelCard 
              travel={travel}
              onCardClick={onTravelClick}
            />
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav aria-label="페이지 네비게이션" className="flex items-center justify-center gap-2 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label="이전 페이지"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            이전
          </Button>

          <div className="flex items-center gap-1" role="list">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`${pageNum}페이지로 이동`}
                  aria-current={page === pageNum ? "page" : undefined}
                  className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    page === pageNum 
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="다음 페이지"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            다음
          </Button>
        </nav>
      )}
    </div>
  );
}

