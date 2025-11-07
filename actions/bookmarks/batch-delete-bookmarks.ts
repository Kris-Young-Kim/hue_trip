/**
 * @file batch-delete-bookmarks.ts
 * @description 북마크 일괄 삭제 Server Action
 *
 * 여러 북마크를 한 번에 삭제하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 북마크 일괄 삭제
 * 2. 북마크 소유권 확인
 * 3. 일괄 삭제 처리
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface BatchDeleteBookmarksInput {
  bookmarkIds: string[];
}

export interface BatchDeleteBookmarksResult {
  success: boolean;
  deletedCount?: number;
  error?: string;
}

/**
 * 북마크 일괄 삭제
 * @param input 북마크 ID 목록
 * @returns 삭제 결과
 */
export async function batchDeleteBookmarks(
  input: BatchDeleteBookmarksInput
): Promise<BatchDeleteBookmarksResult> {
  console.group("[batchDeleteBookmarks] 북마크 일괄 삭제 시작");
  logInfo("[batchDeleteBookmarks] 북마크 일괄 삭제", {
    count: input.bookmarkIds.length,
  });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[batchDeleteBookmarks]", error);
      logInfo("[batchDeleteBookmarks] 인증되지 않은 사용자");
      return { success: false, error };
    }

    if (!input.bookmarkIds || input.bookmarkIds.length === 0) {
      return { success: false, error: "삭제할 북마크를 선택해주세요." };
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
      console.error("[batchDeleteBookmarks] 사용자 조회 실패:", userError);
      logError(
        "[batchDeleteBookmarks] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 북마크 소유권 확인 및 삭제
    const { data: deletedBookmarks, error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .in("id", input.bookmarkIds)
      .eq("user_id", userData.id)
      .select("id");

    if (deleteError) {
      console.error("[batchDeleteBookmarks] 북마크 일괄 삭제 실패:", deleteError);
      logError(
        "[batchDeleteBookmarks] 북마크 일괄 삭제 실패",
        deleteError instanceof Error
          ? deleteError
          : new Error(String(deleteError))
      );
      return {
        success: false,
        error: "북마크 일괄 삭제 중 오류가 발생했습니다.",
      };
    }

    const deletedCount = deletedBookmarks?.length || 0;

    console.log(
      "[batchDeleteBookmarks] 북마크 일괄 삭제 완료:",
      deletedCount,
      "개"
    );
    logInfo("[batchDeleteBookmarks] 북마크 일괄 삭제 완료", {
      requestedCount: input.bookmarkIds.length,
      deletedCount,
    });
    console.groupEnd();

    return { success: true, deletedCount };
  } catch (error) {
    console.error("[batchDeleteBookmarks] 북마크 일괄 삭제 오류:", error);
    logError(
      "[batchDeleteBookmarks] 북마크 일괄 삭제 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "북마크 일괄 삭제 중 예기치 않은 오류가 발생했습니다.",
    };
  }
}

