/**
 * @file page.tsx
 * @description Pitch Camping 홈페이지
 *
 * 캠핑장 정보 서비스의 메인 랜딩 페이지
 * Phase 2에서 캠핑장 목록 기능으로 대체될 예정
 */

import { Button } from "@/components/ui/button";
import { MapPin, Search, Star, Tent } from "lucide-react";

export default function Home() {
  console.log("[Home] 홈페이지 렌더링");

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 lg:py-24 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
        <div className="w-full max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Tent className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
            Pitch Camping
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            전국의 아름다운 캠핑장을 탐험하세요
            <br />
            검색하고, 지도에서 확인하고, 상세 정보를 조회하세요
          </p>

          {/* 기능 소개 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Search className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">캠핑장 검색</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                지역, 타입, 시설로 원하는 캠핑장을 찾아보세요
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">지도로 확인</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                네이버 지도에서 캠핑장 위치를 한눈에 확인하세요
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">상세 정보</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                운영시간, 시설, 이미지 등 종합 정보를 확인하세요
              </p>
            </div>
          </div>

          {/* 개발 중 안내 */}
          <div className="mt-16 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              🚧 현재 개발 중입니다. 곧 캠핑장 목록 기능이 추가될 예정입니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
