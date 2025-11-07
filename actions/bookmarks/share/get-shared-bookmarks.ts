/**
 * @file get-shared-bookmarks.ts
 * @description 공유된 북마크 조회 Server Action (공개 접근용)
 *
 * 공유 토큰을 통해 공유된 북마크 목록을 조회하는 Server Action
 * 인증이 필요하지 않으며, 공개된 공유 링크만 접근 가능
 *
 * 주요 기능:
 * 1. 공유 토큰으로 공유 링크 조회
 * 2. 공개 여부 확인
 * 3. 전체 북마크 또는 폴더별 북마크 조회
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";
import type { BookmarkWithTravel } from "@/actions/bookmarks/get-bookmarks";

export interface GetSharedBookmarksResult {
  success: boolean;
  bookmarks?: BookmarkWithTravel[];
  shareInfo?: {
    scope: "all" | "folder";
    folderName?: string;
  };
  error?: string;
}

/**
 * 공유된 북마크 조회 (공개 접근용)
 * @param shareToken 공유 토큰
 * @returns 공유된 북마크 목록
 */
export async function getSharedBookmarks(
  shareToken: string
): Promise<GetSharedBookmarksResult> {
  console.group("[getSharedBookmarks] 공유된 북마크 조회 시작");
  logInfo("[getSharedBookmarks] 공유된 북마크 조회", { shareToken });

  try {
    // Supabase 클라이언트 생성 (anon key 사용)
    const supabase = createClerkSupabaseClient();

    // 공유 링크 조회
    const { data: shareLink, error: linkError } = await supabase
      .from("bookmark_share_links")
      .select("id, user_id, folder_id, scope, is_public, bookmark_folders(name)")
      .eq("share_token", shareToken)
      .single();

    if (linkError || !shareLink) {
      console.error("[getSharedBookmarks] 공유 링크 조회 실패:", linkError);
      logError(
        "[getSharedBookmarks] 공유 링크 조회 실패",
        linkError instanceof Error ? linkError : new Error(String(linkError))
      );
      return {
        success: false,
        error: "공유 링크를 찾을 수 없습니다.",
      };
    }

    // 공개 여부 확인
    if (!shareLink.is_public) {
      console.warn("[getSharedBookmarks] 비공개 공유 링크 접근 시도");
      logInfo("[getSharedBookmarks] 비공개 공유 링크 접근 시도");
      return {
        success: false,
        error: "이 공유 링크는 비공개입니다.",
      };
    }

    // 북마크 조회
    let bookmarksQuery = supabase
      .from("bookmarks")
      .select(
        `
        id,
        user_id,
        travel_content_id,
        folder_id,
        note,
        note_updated_at,
        created_at,
        travels (
          content_id,
          title,
          address,
          area_code,
          sigungu_code,
          content_type_id,
          first_image,
          map_x,
          map_y,
          tel,
          overview
        )
      `
      )
      .eq("user_id", shareLink.user_id)
      .order("created_at", { ascending: false });

    // 폴더별 공유인 경우 폴더 필터링
    if (shareLink.scope === "folder" && shareLink.folder_id) {
      bookmarksQuery = bookmarksQuery.eq("folder_id", shareLink.folder_id);
    }

    const { data: bookmarks, error: bookmarksError } = await bookmarksQuery;

    if (bookmarksError) {
      console.error("[getSharedBookmarks] 북마크 조회 실패:", bookmarksError);
      logError(
        "[getSharedBookmarks] 북마크 조회 실패",
        bookmarksError instanceof Error
          ? bookmarksError
          : new Error(String(bookmarksError))
      );
      return {
        success: false,
        error: "북마크 조회 중 오류가 발생했습니다.",
      };
    }

    // 데이터 정규화
    const normalizedBookmarks: BookmarkWithTravel[] =
      (bookmarks || [])
        .filter((b) => b.travels)
        .map((b) => ({
          bookmarkId: b.id,
          contentId: b.travels.content_id,
          title: b.travels.title || "",
          address: b.travels.address || "",
          areaCode: b.travels.area_code || "",
          sigunguCode: b.travels.sigungu_code || "",
          contentTypeId: b.travels.content_type_id || "",
          firstImage: b.travels.first_image || "",
          mapX: b.travels.map_x || "",
          mapY: b.travels.map_y || "",
          tel: b.travels.tel || "",
          overview: b.travels.overview || "",
          createdAt: b.created_at,
          note: b.note || null,
          noteUpdatedAt: b.note_updated_at || null,
          folderId: b.folder_id || null,
        })) || [];

    console.log(
      "[getSharedBookmarks] 공유된 북마크 조회 완료:",
      normalizedBookmarks.length,
      "개"
    );
    logInfo("[getSharedBookmarks] 공유된 북마크 조회 완료", {
      count: normalizedBookmarks.length,
      scope: shareLink.scope,
    });
    console.groupEnd();

    return {
      success: true,
      bookmarks: normalizedBookmarks,
      shareInfo: {
        scope: shareLink.scope as "all" | "folder",
        folderName:
          shareLink.scope === "folder" && shareLink.folder_id && shareLink.bookmark_folders
            ? (shareLink.bookmark_folders as { name: string }).name
            : undefined,
      },
    };
  } catch (error) {
    console.error("[getSharedBookmarks] 공유된 북마크 조회 오류:", error);
    logError(
      "[getSharedBookmarks] 공유된 북마크 조회 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "공유된 북마크 조회 중 예기치 않은 오류가 발생했습니다.",
    };
  }
}

