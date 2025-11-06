import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "이용약관 | Pitch Travel",
  description: "Pitch Travel 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            이용약관
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                제1조 (목적)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                이 약관은 Pitch Travel(이하 "회사")이 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                제2조 (정의)
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>"서비스"란 회사가 제공하는 여행지 정보 조회 서비스를 의미합니다.</li>
                <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.</li>
                <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                제3조 (약관의 게시와 개정)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                제4조 (서비스의 제공)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                <li>여행지 정보 조회 서비스</li>
                <li>여행지 검색 및 필터링 서비스</li>
                <li>지도 기반 여행지 위치 확인 서비스</li>
                <li>북마크 및 리뷰 서비스 (회원 전용)</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                제5조 (서비스의 중단)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
            </section>
          </div>
          <div className="mt-8">
            <Link href="/">
              <Button variant="outline">홈으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

