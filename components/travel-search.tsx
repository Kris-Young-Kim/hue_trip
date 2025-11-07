/**
 * @file travel-search.tsx
 * @description 여행지 검색 컴포넌트
 *
 * 키워드 검색을 위한 검색창 컴포넌트
 *
 * 주요 기능:
 * 1. 검색 키워드 입력
 * 2. 엔터 키 또는 검색 버튼으로 검색 실행
 * 3. 검색 중 로딩 상태 표시
 * 4. 검색어 초기화
 *
 * @dependencies
 * - components/ui/input.tsx: Input 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: Search, X 아이콘
 */

"use client";

import { useState, useEffect, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface TravelSearchProps {
  onSearch?: (keyword: string) => void;
  placeholder?: string;
}

export function TravelSearch({
  onSearch,
  placeholder = "여행지 검색...",
}: TravelSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputId = useId();
  const searchLoadingId = useId();
  const [keyword, setKeyword] = useState(
    searchParams.get("keyword") || ""
  );
  const [isSearching, setIsSearching] = useState(false);

  // URL 쿼리 파라미터와 동기화
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    setKeyword(urlKeyword);
  }, [searchParams]);

  const handleSearch = (searchKeyword?: string) => {
    const finalKeyword = searchKeyword !== undefined ? searchKeyword : keyword.trim();
    
    console.group("[TravelSearch] 검색 실행");
    console.log("검색 키워드:", finalKeyword);

    setIsSearching(true);

    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString());
    
    if (finalKeyword) {
      params.set("keyword", finalKeyword);
    } else {
      params.delete("keyword");
    }

    // 검색 시 첫 페이지로 리셋
    params.delete("page");

    router.push(`/?${params.toString()}`, { scroll: false });

    // 콜백 호출
    onSearch?.(finalKeyword);

    // 로딩 상태 해제 (짧은 딜레이)
    setTimeout(() => {
      setIsSearching(false);
      console.groupEnd();
    }, 300);
  };

  const handleClear = () => {
    console.log("[TravelSearch] 검색어 초기화");
    setKeyword("");
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete("keyword");
    params.delete("page");

    router.push(`/?${params.toString()}`, { scroll: false });
    onSearch?.("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative w-full">
      <label htmlFor={searchInputId} className="sr-only">
        여행지 검색
      </label>
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none z-10" aria-hidden="true" />
        <Input
          id={searchInputId}
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-12 pr-12 h-14 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          disabled={isSearching}
          aria-label="여행지 검색"
          aria-describedby={isSearching ? searchLoadingId : undefined}
          aria-busy={isSearching}
        />
        {keyword && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSearching}
            aria-label="검색어 지우기"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">검색어 지우기</span>
          </Button>
        )}
        {isSearching && !keyword && (
          <div id={searchLoadingId} className="absolute right-4 top-1/2 -translate-y-1/2" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" aria-hidden="true"></div>
            <span className="sr-only">검색 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}

