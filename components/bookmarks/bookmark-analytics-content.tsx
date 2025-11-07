/**
 * @file bookmark-analytics-content.tsx
 * @description 북마크 통계/분석 UI 컴포넌트
 */

"use client";

import { BookmarkStatisticsResult } from "@/actions/bookmarks/get-bookmark-statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookmarkAnalyticsContentProps {
  data: BookmarkStatisticsResult;
}

export function BookmarkAnalyticsContent({ data }: BookmarkAnalyticsContentProps) {
  if (!data.success) {
    return (
      <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <p className="text-red-600 dark:text-red-300 text-sm">{data.error ?? "통계를 불러오는데 실패했습니다."}</p>
      </div>
    );
  }

  const areaStats = data.areaStats ?? [];
  const typeStats = data.typeStats ?? [];
  const monthlyTrend = data.monthlyTrend ?? [];

  const maxAreaCount = Math.max(...areaStats.map((item) => item.count), 1);
  const maxTypeCount = Math.max(...typeStats.map((item) => item.count), 1);
  const maxMonthlyCount = Math.max(...monthlyTrend.map((item) => item.count), 1);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>총 북마크 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalBookmarks ?? 0}개</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              지금까지 저장한 여행지 수입니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>선호 지역</CardTitle>
          </CardHeader>
          <CardContent>
            {areaStats.length > 0 ? (
              <div className="space-y-2">
                {areaStats.slice(0, 3).map((item, index) => (
                  <div key={item.areaCode} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}</Badge>
                      {item.label}
                    </span>
                    <span className="font-medium">{item.count}개</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">데이터가 부족합니다.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>선호 여행 타입</CardTitle>
          </CardHeader>
          <CardContent>
            {typeStats.length > 0 ? (
              <div className="space-y-2">
                {typeStats.slice(0, 3).map((item, index) => (
                  <div key={item.contentTypeId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}</Badge>
                      {item.label}
                    </span>
                    <span className="font-medium">{item.count}개</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">데이터가 부족합니다.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {data.favoriteSummary && (
        <Card>
          <CardHeader>
            <CardTitle>여행 취향 인사이트</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
              {data.favoriteSummary}
            </p>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>지역별 북마크 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {areaStats.length === 0 ? (
              <p className="text-sm text-gray-500">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {areaStats.map((item) => (
                  <div key={item.areaCode} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span>{item.count}개</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500"
                        style={{ width: `${(item.count / maxAreaCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>여행 유형 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {typeStats.length === 0 ? (
              <p className="text-sm text-gray-500">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {typeStats.map((item) => (
                  <div key={item.contentTypeId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span>{item.count}개</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 dark:bg-purple-500"
                        style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>월별 북마크 추이</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrend.length === 0 ? (
              <p className="text-sm text-gray-500">데이터가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {monthlyTrend.map((item) => (
                  <div key={item.month} className="space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-500">{item.month}</p>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${(item.count / maxMonthlyCount) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm font-semibold">{item.count}개</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

