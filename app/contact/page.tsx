import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "문의하기 | Pitch Camping",
  description: "Pitch Camping에 문의하세요.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            문의하기
          </h1>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  이메일 문의
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  문의사항이 있으시면 아래 이메일로 연락주세요.
                </p>
                <a
                  href="mailto:contact@pitchcamping.com"
                  className="text-green-600 dark:text-green-400 hover:underline font-medium"
                >
                  contact@pitchcamping.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  피드백
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  서비스 개선을 위한 피드백을 남겨주세요.
                </p>
                <Link href="/feedback">
                  <Button>피드백 남기기</Button>
                </Link>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/">
                <Button variant="outline">홈으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

