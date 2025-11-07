/**
 * @file batch-update-bookmark-folder.ts
 * @description 북마크 일괄 폴더 이동 Server Action
 *
 * 여러 북마크를 한 번에 폴더로 이동하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 북마크 일괄 폴더 이동
 * 2. 북마크 소유권 확인
 * 3. 폴더 소유권 확인 (폴더 ID가 제공된 경우)
 * 4. 일괄 업데이트 처리
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface BatchUpdateBookmarkFolderInput {
  bookmarkIds: string[];
  folderId: string | null; // null이면 폴더에서 제거
}

export interface BatchUpdateBookmarkFolderResult {
  success: boolean;
  updatedCount?: number;
  error?: string;
}

/**
 * 북마크 일괄 폴더 이동
 * @param input 북마크 ID 목록 및 폴더 ID
 * @returns 업데이트 결과
 */
export async function batchUpdateBookmarkFolder(
  input: BatchUpdateBookmarkFolderInput
): Promise<BatchUpdateBookmarkFolderResult> {
  console.group("[batchUpdateBookmarkFolder] 북마크 일괄 폴더 이동 시작");
  logInfo("[batchUpdateBookmarkFolder] 북마크 일괄 폴더 이동", {
    count: input.bookmarkIds.length,
    folderId: input.folderId,
  });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[batchUpdateBookmarkFolder]", error);
      logInfo("[batchUpdateBookmarkFolder] 인증되지 않은 사용자");
      return { success: false, error };
    }

    if (!input.bookmarkIds || input.bookmarkIds.length === 0) {
      return { success: false, error: "이동할 북마크를 선택해주세요." };
    }

    // Supabase 클라이언트 생성
    const supabase = createClerkSupabaseClient();

    // 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error(
        "[batchUpdateBookmarkFolder] 사용자 조회 실패:",
        userError
      );
      logError(
        "[batchUpdateBookmarkFolder] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 폴더 소유권 확인 (폴더 ID가 제공된 경우)
    if (input.folderId) {
      const { data: folder, error: folderError } = await supabase
        .from("bookmark_folders")
        .select("id")
        .eq("id", input.folderId)
        .eq("user_id", userData.id)
        .single();

      if (folderError || !folder) {
        console.error(
          "[batchUpdateBookmarkFolder] 폴더 조회 실패:",
          folderError
        );
        logError(
          "[batchUpdateBookmarkFolder] 폴더 조회 실패",
          folderError instanceof Error
            ? folderError
            : new Error(String(folderError))
        );
        return {
          success: false,
          error: "폴더를 찾을 수 없거나 권한이 없습니다.",
        };
      }
    }

    // 북마크 소유권 확인 및 업데이트
    let updateQuery = supabase
      .from("bookmarks")
      .update({ folder_id: input.folderId })
      .in("id", input.bookmarkIds)
      .eq("user_id", userData.id);

    const { data: updatedBookmarks, error: updateError } = await updateQuery
      .select("id");

    if (updateError) {
      console.error(
        "[batchUpdateBookmarkFolder] 북마크 일괄 폴더 이동 실패:",
        updateError
      );
      logError(
        "[batchUpdateBookmarkFolder] 북마크 일괄 폴더 이동 실패",
        updateError instanceof Error
          ? updateError
          : new Error(String(updateError))
      );
      return {
        success: false,
        error: "북마크 일괄 폴더 이동 중 오류가 발생했습니다.",
      };
    }

    const updatedCount = updatedBookmarks?.length || 0;

    console.log(
      "[batchUpdateBookmarkFolder] 북마크 일괄 폴더 이동 완료:",
      updatedCount,
      "개"
    );
    logInfo("[batchUpdateBookmarkFolder] 북마크 일괄 폴더 이동 완료", {
      requestedCount: input.bookmarkIds.length,
      updatedCount,
      folderId: input.folderId,
    });
    console.groupEnd();

    return { success: true, updatedCount };
  } catch (error) {
    console.error(
      "[batchUpdateBookmarkFolder] 북마크 일괄 폴더 이동 오류:",
      error
    );
    logError(
      "[batchUpdateBookmarkFolder] 북마크 일괄 폴더 이동 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "북마크 일괄 폴더 이동 중 예기치 않은 오류가 발생했습니다.",
    };
  }
}

