import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "회사 소개 | Pitch Travel",
  description: "Pitch Travel에 대해 알아보세요.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            회사 소개
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Pitch Travel은 전국 여행지 정보를 한눈에 확인할 수 있는 서비스입니다.
              여행을 사랑하는 모든 분들에게 최고의 여행 경험을 제공하기 위해 노력하고 있습니다.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              우리의 미션
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              모든 여행자가 쉽고 빠르게 원하는 여행지를 찾을 수 있도록 돕는 것입니다.
            </p>
            <div className="mt-8">
              <Link href="/">
                <Button>홈으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

