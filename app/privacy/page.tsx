import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Pitch Camping",
  description: "Pitch Camping 개인정보처리방침입니다.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            개인정보처리방침
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                1. 개인정보의 처리 목적
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Pitch Camping은 다음의 목적을 위하여 개인정보를 처리합니다:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                <li>서비스 제공 및 계약의 이행</li>
                <li>회원 관리 및 본인 확인</li>
                <li>서비스 개선 및 신규 서비스 개발</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                2. 개인정보의 처리 및 보유기간
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                회원 탈퇴 시까지 개인정보를 보유하며, 탈퇴 후 즉시 파기합니다.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                3. 개인정보의 제3자 제공
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Pitch Camping은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                4. 개인정보처리 위탁
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Pitch Camping은 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
                <li>인증 서비스: Clerk (개인정보 처리 위탁)</li>
                <li>데이터베이스: Supabase (개인정보 처리 위탁)</li>
              </ul>
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

