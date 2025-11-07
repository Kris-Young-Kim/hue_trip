/**
 * @file user-behavior-analytics.tsx
 * @description 사용자 행동 분석 UI 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getUserBehaviorAnalytics } from "@/actions/admin-stats/get-user-behavior-analytics";
import { toast } from "sonner";
import type {
  SessionAnalytics,
  UserJourney,
  UserSegment,
  RetentionAnalytics,
  ConversionAnalytics,
} from "@/actions/admin-stats/get-user-behavior-analytics";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function UserBehaviorAnalytics() {
  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics | null>(null);
  const [userJourney, setUserJourney] = useState<UserJourney[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [retentionAnalytics, setRetentionAnalytics] = useState<RetentionAnalytics[]>([]);
  const [conversionAnalytics, setConversionAnalytics] = useState<ConversionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    console.group("[UserBehaviorAnalytics] 데이터 로드 시작");
    setLoading(true);

    try {
      const result = await getUserBehaviorAnalytics();

      if (result.success) {
        if (result.sessionAnalytics) setSessionAnalytics(result.sessionAnalytics);
        if (result.userJourney) setUserJourney(result.userJourney);
        if (result.userSegments) setUserSegments(result.userSegments);
        if (result.retentionAnalytics) setRetentionAnalytics(result.retentionAnalytics);
        if (result.conversionAnalytics) setConversionAnalytics(result.conversionAnalytics);
      } else {
        toast.error(result.error || "사용자 행동 분석 데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("[UserBehaviorAnalytics] 데이터 로드 오류:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 세션 분석 카드 */}
      {sessionAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">평균 세션 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(sessionAnalytics.averageSessionDuration)}초
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">평균 페이지 뷰</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionAnalytics.averagePageViews.toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">이탈률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionAnalytics.bounceRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">총 세션 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionAnalytics.totalSessions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 탭으로 구분된 분석 */}
      <Tabs defaultValue="journey">
        <TabsList>
          <TabsTrigger value="journey">사용자 여정</TabsTrigger>
          <TabsTrigger value="segments">사용자 세그먼트</TabsTrigger>
          <TabsTrigger value="retention">리텐션</TabsTrigger>
          <TabsTrigger value="conversion">전환율</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 여정 분석 (페이지 이동 경로)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userJourney.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="path" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="방문 횟수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 세그먼트 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percentage }) =>
                        `${segment}: ${percentage.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {userSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {userSegments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium">{segment.segment}</span>
                      <div className="text-right">
                        <div className="font-bold">{segment.count}명</div>
                        <div className="text-sm text-gray-500">{segment.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 리텐션 분석 (최근 7일)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={retentionAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="retentionRate"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="리텐션율 (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="신규 사용자"
                  />
                  <Line
                    type="monotone"
                    dataKey="returningUsers"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="재방문 사용자"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>사용자 전환율 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionAnalytics.map((conversion, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{conversion.conversionType}</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {conversion.conversionRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      방문자: {conversion.visitors}명 → 전환: {conversion.conversions}명
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(conversion.conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

