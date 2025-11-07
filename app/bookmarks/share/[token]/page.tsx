/**
 * @file app/bookmarks/share/[token]/page.tsx
 * @description 북마크 공유 페이지
 *
 * 공유 토큰을 통해 공유된 북마크 목록을 표시하는 페이지
 * 인증이 필요하지 않으며, 공개된 공유 링크만 접근 가능
 *
 * 주요 기능:
 * 1. 공유 토큰으로 공유된 북마크 조회
 * 2. 북마크 목록 표시 (읽기 전용)
 * 3. 비공개/만료 링크 처리
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSharedBookmarks } from "@/actions/bookmarks/share/get-shared-bookmarks";
import { TravelCard } from "@/components/travel-card";
import { Bookmark, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SharedBookmarksPageProps {
  params: Promise<{ token: string }>;
}

async function SharedBookmarksContent({ token }: { token: string }) {
  const result = await getSharedBookmarks(token);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  공유 링크를 찾을 수 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {result.error || "이 링크는 비공개이거나 만료되었습니다."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { bookmarks, shareInfo } = result;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                공유된 북마크
              </h1>
              {shareInfo?.scope === "folder" && shareInfo.folderName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  폴더: {shareInfo.folderName}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                총 {bookmarks?.length || 0}개의 북마크
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bookmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* 북마크 목록 */}
        {!bookmarks || bookmarks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Bookmark className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  공유된 북마크가 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  이 공유 링크에는 북마크가 없습니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarks.map((bookmark) => (
              <TravelCard key={bookmark.bookmarkId} travel={bookmark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function SharedBookmarksPage({
  params,
}: SharedBookmarksPageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <SharedBookmarksContent token={token} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: SharedBookmarksPageProps) {
  const { token } = await params;
  return {
    title: "공유된 북마크",
    description: "공유된 북마크 목록을 확인하세요.",
  };
}

