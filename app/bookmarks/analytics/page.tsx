/**
 * @file app/bookmarks/analytics/page.tsx
 * @description 북마크 통계/분석 페이지
 */

import { getBookmarkStatistics } from "@/actions/bookmarks/get-bookmark-statistics";
import { BookmarkAnalyticsContent } from "@/components/bookmarks/bookmark-analytics-content";

export const metadata = {
  title: "북마크 통계",
  description: "북마크한 여행지 데이터를 분석합니다.",
};

export default async function BookmarkAnalyticsPage() {
  const data = await getBookmarkStatistics();

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">북마크 통계 대시보드</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          내가 저장한 여행지의 패턴을 분석해 여행 취향을 파악해보세요.
        </p>
      </div>
      <BookmarkAnalyticsContent data={data} />
    </div>
  );
}

