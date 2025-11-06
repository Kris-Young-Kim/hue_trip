/**
 * @file page.tsx
 * @description 피드백 페이지
 *
 * 사용자 피드백을 제출할 수 있는 페이지
 *
 * 주요 기능:
 * 1. 피드백 폼 표시
 * 2. 피드백 제출 처리
 * 3. 피드백 제출 안내
 *
 * @dependencies
 * - components/feedback-form.tsx: FeedbackForm 컴포넌트
 */

import { FeedbackForm } from "@/components/feedback-form";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Mail, Clock } from "lucide-react";

export default function FeedbackPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4" id="main-content">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            피드백 제출
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            버그 리포트, 기능 제안, 개선사항 등을 알려주세요
          </p>
        </div>

        {/* 피드백 폼 */}
        <FeedbackForm />

        {/* 안내 정보 */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    피드백 유형 안내
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li><strong>버그 리포트</strong>: 오류나 문제가 발생한 경우</li>
                    <li><strong>기능 제안</strong>: 새로운 기능을 제안하는 경우</li>
                    <li><strong>개선사항</strong>: 기존 기능을 개선하고 싶은 경우</li>
                    <li><strong>기타</strong>: 위 카테고리에 해당하지 않는 경우</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    처리 시간
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    피드백은 접수 후 1-2일 내에 검토하며, 우선순위에 따라 반영됩니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    연락처 정보
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    연락처 이메일을 입력하시면 처리 상태를 이메일로 알려드립니다.
                    이메일은 선택 사항이며, 입력하지 않아도 피드백을 제출할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

