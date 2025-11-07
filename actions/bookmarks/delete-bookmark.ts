/**
 * @file delete-bookmark.ts
 * @description 북마크 삭제 Server Action
 *
 * 북마크를 삭제하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 북마크 삭제
 * 2. 북마크 소유권 확인
 * 3. 북마크 삭제 시 태그 관계도 자동 삭제 (ON DELETE CASCADE)
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface DeleteBookmarkResult {
  success: boolean;
  error?: string;
}

/**
 * 북마크 삭제
 * @param bookmarkId 북마크 ID
 * @returns 삭제 결과
 */
export async function deleteBookmark(
  bookmarkId: string
): Promise<DeleteBookmarkResult> {
  console.group("[deleteBookmark] 북마크 삭제 시작");
  logInfo("[deleteBookmark] 북마크 삭제", { bookmarkId });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[deleteBookmark]", error);
      logInfo("[deleteBookmark] 인증되지 않은 사용자");
      return { success: false, error };
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
      console.error("[deleteBookmark] 사용자 조회 실패:", userError);
      logError(
        "[deleteBookmark] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 북마크 소유권 확인
    const { data: bookmark, error: bookmarkError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("id", bookmarkId)
      .eq("user_id", userData.id)
      .single();

    if (bookmarkError || !bookmark) {
      console.error("[deleteBookmark] 북마크 조회 실패:", bookmarkError);
      logError(
        "[deleteBookmark] 북마크 조회 실패",
        bookmarkError instanceof Error
          ? bookmarkError
          : new Error(String(bookmarkError))
      );
      return {
        success: false,
        error: "북마크를 찾을 수 없거나 권한이 없습니다.",
      };
    }

    // 북마크 삭제 (태그 관계는 자동 삭제됨 - ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId)
      .eq("user_id", userData.id);

    if (deleteError) {
      console.error("[deleteBookmark] 북마크 삭제 실패:", deleteError);
      logError(
        "[deleteBookmark] 북마크 삭제 실패",
        deleteError instanceof Error
          ? deleteError
          : new Error(String(deleteError))
      );
      return { success: false, error: "북마크 삭제 중 오류가 발생했습니다." };
    }

    console.log("[deleteBookmark] 북마크 삭제 완료");
    logInfo("[deleteBookmark] 북마크 삭제 완료", { bookmarkId });
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error("[deleteBookmark] 북마크 삭제 오류:", error);
    logError(
      "[deleteBookmark] 북마크 삭제 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "북마크 삭제 중 예기치 않은 오류가 발생했습니다.",
    };
  }
}

