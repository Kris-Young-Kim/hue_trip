/**
 * @file showcase.tsx
 * @description 주요 기능 데모 컴포넌트
 *
 * 데모 페이지에서 서비스의 주요 기능을 소개하는 컴포넌트
 * MVP 4개 기능을 시각적으로 소개
 *
 * @dependencies
 * - components/ui/card.tsx: Card 컴포넌트
 * - lucide-react: MapPin, Map, Search, FileText, ArrowRight 아이콘
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Map,
  Search,
  FileText,
  ArrowRight,
  Filter,
  Star,
  Share2,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "여행지 목록",
    description: "전국의 여행지를 지역, 타입별로 필터링하여 검색할 수 있습니다.",
    features: ["지역별 필터링", "타입별 필터링 (관광지, 문화시설, 축제 등)", "정렬 옵션", "페이지네이션"],
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    link: "/",
  },
  {
    icon: Map,
    title: "네이버 지도 연동",
    description: "지도에서 여행지 위치를 한눈에 확인하고, 리스트와 지도를 동시에 활용할 수 있습니다.",
    features: ["실시간 지도 표시", "마커 클릭으로 상세 정보", "리스트-지도 상호연동", "지도 내 검색/필터"],
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    link: "/?view=map",
  },
  {
    icon: Search,
    title: "키워드 검색",
    description: "여행지명, 주소 등으로 빠르게 검색하고, 필터와 조합하여 원하는 결과를 찾을 수 있습니다.",
    features: ["키워드 검색", "필터와 검색 조합", "빈 결과 처리", "검색어 초기화"],
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    link: "/",
  },
  {
    icon: FileText,
    title: "상세페이지",
    description: "여행지의 상세 정보, 이미지 갤러리, 리뷰 등을 확인하고 북마크 및 공유할 수 있습니다.",
    features: ["상세 정보 표시", "이미지 갤러리", "북마크 기능", "공유 기능", "리뷰 및 평점"],
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    link: "/travels",
  },
];

export function Showcase() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            주요 기능
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Pitch Travel의 핵심 기능을 소개합니다. 사용자 친화적인 인터페이스로
            여행 정보를 쉽게 찾고 활용할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={feature.link}>
                      체험해보기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

