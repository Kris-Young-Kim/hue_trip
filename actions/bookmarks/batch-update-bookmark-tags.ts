/**
 * @file batch-update-bookmark-tags.ts
 * @description 북마크 일괄 태그 추가/제거 Server Action
 *
 * 여러 북마크에 태그를 일괄로 추가하거나 제거하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 북마크 일괄 태그 관리
 * 2. 북마크 소유권 확인
 * 3. 태그 소유권 확인
 * 4. 태그 추가/제거 처리
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface BatchUpdateBookmarkTagsInput {
  bookmarkIds: string[];
  tagIds: string[]; // 추가할 태그 ID 목록
  mode: "add" | "remove" | "replace"; // add: 추가, remove: 제거, replace: 교체
}

export interface BatchUpdateBookmarkTagsResult {
  success: boolean;
  updatedCount?: number;
  error?: string;
}

/**
 * 북마크 일괄 태그 추가/제거
 * @param input 북마크 ID 목록 및 태그 정보
 * @returns 업데이트 결과
 */
export async function batchUpdateBookmarkTags(
  input: BatchUpdateBookmarkTagsInput
): Promise<BatchUpdateBookmarkTagsResult> {
  console.group("[batchUpdateBookmarkTags] 북마크 일괄 태그 업데이트 시작");
  logInfo("[batchUpdateBookmarkTags] 북마크 일괄 태그 업데이트", {
    count: input.bookmarkIds.length,
    tagIds: input.tagIds,
    mode: input.mode,
  });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[batchUpdateBookmarkTags]", error);
      logInfo("[batchUpdateBookmarkTags] 인증되지 않은 사용자");
      return { success: false, error };
    }

    if (!input.bookmarkIds || input.bookmarkIds.length === 0) {
      return { success: false, error: "업데이트할 북마크를 선택해주세요." };
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
        "[batchUpdateBookmarkTags] 사용자 조회 실패:",
        userError
      );
      logError(
        "[batchUpdateBookmarkTags] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 북마크 소유권 확인
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("id")
      .in("id", input.bookmarkIds)
      .eq("user_id", userData.id);

    if (bookmarksError) {
      console.error(
        "[batchUpdateBookmarkTags] 북마크 조회 실패:",
        bookmarksError
      );
      logError(
        "[batchUpdateBookmarkTags] 북마크 조회 실패",
        bookmarksError instanceof Error
          ? bookmarksError
          : new Error(String(bookmarksError))
      );
      return {
        success: false,
        error: "북마크를 찾을 수 없거나 권한이 없습니다.",
      };
    }

    if (!bookmarks || bookmarks.length === 0) {
      return {
        success: false,
        error: "업데이트할 북마크를 찾을 수 없습니다.",
      };
    }

    const validBookmarkIds = bookmarks.map((b) => b.id);

    // 태그 소유권 확인 (태그 ID가 제공된 경우)
    if (input.tagIds.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from("bookmark_tags")
        .select("id")
        .in("id", input.tagIds)
        .eq("user_id", userData.id);

      if (tagsError) {
        console.error(
          "[batchUpdateBookmarkTags] 태그 조회 실패:",
          tagsError
        );
        logError(
          "[batchUpdateBookmarkTags] 태그 조회 실패",
          tagsError instanceof Error
            ? tagsError
            : new Error(String(tagsError))
        );
        return {
          success: false,
          error: "태그를 찾을 수 없거나 권한이 없습니다.",
        };
      }

      if (!tags || tags.length === 0) {
        return {
          success: false,
          error: "유효한 태그를 찾을 수 없습니다.",
        };
      }
    }

    let updatedCount = 0;

    // 모드에 따라 처리
    if (input.mode === "replace") {
      // 교체: 기존 태그 관계 삭제 후 새 태그 추가
      // 기존 태그 관계 삭제
      const { error: deleteError } = await supabase
        .from("bookmark_tag_relations")
        .delete()
        .in("bookmark_id", validBookmarkIds);

      if (deleteError) {
        console.error(
          "[batchUpdateBookmarkTags] 기존 태그 관계 삭제 실패:",
          deleteError
        );
        logError(
          "[batchUpdateBookmarkTags] 기존 태그 관계 삭제 실패",
          deleteError instanceof Error
            ? deleteError
            : new Error(String(deleteError))
        );
        return {
          success: false,
          error: "기존 태그 관계 삭제 중 오류가 발생했습니다.",
        };
      }

      // 새 태그 관계 추가
      if (input.tagIds.length > 0) {
        const relations = validBookmarkIds.flatMap((bookmarkId) =>
          input.tagIds.map((tagId) => ({
            bookmark_id: bookmarkId,
            tag_id: tagId,
          }))
        );

        const { error: insertError } = await supabase
          .from("bookmark_tag_relations")
          .insert(relations);

        if (insertError) {
          console.error(
            "[batchUpdateBookmarkTags] 새 태그 관계 추가 실패:",
            insertError
          );
          logError(
            "[batchUpdateBookmarkTags] 새 태그 관계 추가 실패",
            insertError instanceof Error
              ? insertError
              : new Error(String(insertError))
          );
          return {
            success: false,
            error: "새 태그 관계 추가 중 오류가 발생했습니다.",
          };
        }
      }

      updatedCount = validBookmarkIds.length;
    } else if (input.mode === "add") {
      // 추가: 기존 태그는 유지하고 새 태그만 추가
      if (input.tagIds.length > 0) {
        // 중복 제거를 위해 기존 관계 확인
        const { data: existingRelations } = await supabase
          .from("bookmark_tag_relations")
          .select("bookmark_id, tag_id")
          .in("bookmark_id", validBookmarkIds)
          .in("tag_id", input.tagIds);

        const existingSet = new Set(
          (existingRelations || []).map(
            (r) => `${r.bookmark_id}-${r.tag_id}`
          )
        );

        const relations = validBookmarkIds
          .flatMap((bookmarkId) =>
            input.tagIds.map((tagId) => ({
              bookmark_id: bookmarkId,
              tag_id: tagId,
            }))
          )
          .filter(
            (r) => !existingSet.has(`${r.bookmark_id}-${r.tag_id}`)
          );

        if (relations.length > 0) {
          const { error: insertError } = await supabase
            .from("bookmark_tag_relations")
            .insert(relations);

          if (insertError) {
            console.error(
              "[batchUpdateBookmarkTags] 태그 관계 추가 실패:",
              insertError
            );
            logError(
              "[batchUpdateBookmarkTags] 태그 관계 추가 실패",
              insertError instanceof Error
                ? insertError
                : new Error(String(insertError))
            );
            return {
              success: false,
              error: "태그 관계 추가 중 오류가 발생했습니다.",
            };
          }
        }

        updatedCount = validBookmarkIds.length;
      }
    } else if (input.mode === "remove") {
      // 제거: 지정된 태그만 제거
      if (input.tagIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("bookmark_tag_relations")
          .delete()
          .in("bookmark_id", validBookmarkIds)
          .in("tag_id", input.tagIds);

        if (deleteError) {
          console.error(
            "[batchUpdateBookmarkTags] 태그 관계 제거 실패:",
            deleteError
          );
          logError(
            "[batchUpdateBookmarkTags] 태그 관계 제거 실패",
            deleteError instanceof Error
              ? deleteError
              : new Error(String(deleteError))
          );
          return {
            success: false,
            error: "태그 관계 제거 중 오류가 발생했습니다.",
          };
        }

        updatedCount = validBookmarkIds.length;
      }
    }

    console.log(
      "[batchUpdateBookmarkTags] 북마크 일괄 태그 업데이트 완료:",
      updatedCount,
      "개"
    );
    logInfo("[batchUpdateBookmarkTags] 북마크 일괄 태그 업데이트 완료", {
      requestedCount: input.bookmarkIds.length,
      updatedCount,
      mode: input.mode,
    });
    console.groupEnd();

    return { success: true, updatedCount };
  } catch (error) {
    console.error(
      "[batchUpdateBookmarkTags] 북마크 일괄 태그 업데이트 오류:",
      error
    );
    logError(
      "[batchUpdateBookmarkTags] 북마크 일괄 태그 업데이트 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "북마크 일괄 태그 업데이트 중 예기치 않은 오류가 발생했습니다.",
    };
  }
}

