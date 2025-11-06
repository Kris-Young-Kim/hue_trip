/**
 * @file stats-section.tsx
 * @description 통계 섹션 컴포넌트
 *
 * 데모 페이지에서 서비스 통계를 표시하는 컴포넌트
 * 실제 데이터를 Supabase에서 조회하여 표시
 *
 * @dependencies
 * - actions/admin-stats.ts: getAdminStats Server Action
 * - components/ui/card.tsx: Card 컴포넌트
 * - lucide-react: Users, Eye, Bookmark, MessageSquare 아이콘
 */

import { getAdminStats } from "@/actions/admin-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, Bookmark, MessageSquare, TrendingUp } from "lucide-react";

export async function StatsSection() {
  // 통계 데이터 조회 (공개용이므로 권한 체크 없이 조회)
  // 실제로는 공개 통계 API를 별도로 만들어야 할 수 있음
  const stats = await getAdminStats();

  // 통계가 없으면 기본값 표시
  const displayStats = {
    totalUsers: stats?.totalUsers || 0,
    totalViews: stats?.totalViews || 0,
    totalBookmarks: stats?.totalBookmarks || 0,
    totalReviews: stats?.totalReviews || 0,
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            서비스 성과
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Pitch Travel이 달성한 주요 지표입니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                총 사용자 수
              </CardTitle>
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {displayStats.totalUsers.toLocaleString("ko-KR")}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                가입한 사용자
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-500 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                총 조회 수
              </CardTitle>
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {displayStats.totalViews.toLocaleString("ko-KR")}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                여행지 조회 총합
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-yellow-500 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                총 북마크 수
              </CardTitle>
              <Bookmark className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {displayStats.totalBookmarks.toLocaleString("ko-KR")}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                사용자 북마크 총합
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                총 리뷰 수
              </CardTitle>
              <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {displayStats.totalReviews.toLocaleString("ko-KR")}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                작성된 리뷰
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
              지속적인 성장 중
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

