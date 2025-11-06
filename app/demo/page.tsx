/**
 * @file page.tsx
 * @description 투자/사업자 대상 데모 랜딩페이지
 *
 * 서비스 소개 및 주요 기능을 데모하는 랜딩페이지
 * 투자자, 파트너, 사업자에게 서비스를 소개하기 위한 페이지
 *
 * 주요 섹션:
 * 1. 히어로 섹션 (서비스 소개, 메인 CTA)
 * 2. 주요 기능 소개 (MVP 4개 기능)
 * 3. 사용 통계 (실제 데이터 연동)
 * 4. 연락처/문의 섹션
 * 5. 투자자/파트너 대상 정보
 *
 * @dependencies
 * - components/demo/showcase.tsx: Showcase 컴포넌트
 * - components/demo/stats-section.tsx: StatsSection 컴포넌트
 * - components/ui/button.tsx: Button 컴포넌트
 * - lucide-react: 아이콘
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Showcase } from "@/components/demo/showcase";
import { StatsSection } from "@/components/demo/stats-section";
import { ArrowRight, Mail, Phone, MapPin, Globe, TrendingUp } from "lucide-react";

export const metadata = {
  title: "데모 - Pitch Travel",
  description: "Pitch Travel 서비스 소개 및 주요 기능 데모",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* 히어로 섹션 */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Pitch Travel
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              전국의 여행지 정보를 쉽게 검색하고, 지도에서 확인하며,
              <br />
              상세 정보를 조회할 수 있는 웹 서비스
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/">
                  서비스 체험하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/feedback">
                  문의하기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 소개 */}
      <Showcase />

      {/* 사용 통계 */}
      <StatsSection />

      {/* 서비스 가치 제안 */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                왜 Pitch Travel인가?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
                  <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  포괄적인 데이터
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  한국관광공사 TourAPI를 활용한 전국 여행지 정보 제공
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  지속적인 성장
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  사용자 피드백 기반 기능 개선 및 서비스 확장
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 mb-4">
                  <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  접근성 우선
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  WCAG 2.1 AA 준수, 화면 확대/축소, 음성 출력 기능 제공
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 연락처/문의 섹션 */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              투자 및 파트너십 문의
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Pitch Travel에 관심이 있으신가요? 투자, 파트너십, 협력 제안을 환영합니다.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <a
                    href="mailto:contact@pitch-travel.com"
                    className="text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    contact@pitch-travel.com
                  </a>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-lg text-gray-900 dark:text-white">
                    02-1234-5678
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/feedback">
                  피드백 제출
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">
                  서비스 둘러보기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            함께 성장하는 여행 정보 플랫폼
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Pitch Travel과 함께 여행 정보 서비스의 새로운 가능성을 만들어가세요.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            <Link href="/">
              지금 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

