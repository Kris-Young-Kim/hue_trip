/**
 * @file popular-travels.tsx
 * @description 인기 여행지 목록 컴포넌트
 *
 * 관리자 대시보드에서 인기 여행지 TOP 10을 표시하는 컴포넌트
 *
 * @dependencies
 * - components/ui/card.tsx: Card 컴포넌트
 * - components/ui/table.tsx: Table 컴포넌트
 * - lib/utils/popularity.ts: calculatePopularityScore
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculatePopularityScore } from "@/lib/utils/popularity";
import Link from "next/link";

interface PopularTravel {
  contentId: string;
  viewCount: number;
  bookmarkCount: number;
  shareCount: number;
}

interface PopularTravelsProps {
  travels: PopularTravel[];
}

export function PopularTravels({ travels }: PopularTravelsProps) {
  if (travels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>인기 여행지</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            데이터가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 인기도 점수 기준으로 정렬
  const sortedTravels = [...travels].sort((a, b) => {
    const scoreA = calculatePopularityScore(
      a.viewCount,
      a.bookmarkCount,
      a.shareCount
    );
    const scoreB = calculatePopularityScore(
      b.viewCount,
      b.bookmarkCount,
      b.shareCount
    );
    return scoreB - scoreA;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>인기 여행지 TOP 10</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">순위</TableHead>
              <TableHead>여행지 ID</TableHead>
              <TableHead className="text-right">조회수</TableHead>
              <TableHead className="text-right">북마크</TableHead>
              <TableHead className="text-right">공유</TableHead>
              <TableHead className="text-right">인기도</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTravels.map((travel, index) => {
              const popularityScore = calculatePopularityScore(
                travel.viewCount,
                travel.bookmarkCount,
                travel.shareCount
              );

              return (
                <TableRow key={travel.contentId}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/travels/${travel.contentId}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {travel.contentId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {travel.viewCount.toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {travel.bookmarkCount.toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {travel.shareCount.toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {popularityScore}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

