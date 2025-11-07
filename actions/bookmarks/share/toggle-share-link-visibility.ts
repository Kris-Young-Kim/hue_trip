/**
 * @file toggle-share-link-visibility.ts
 * @description 북마크 공유 링크 공개/비공개 전환 Server Action
 *
 * 북마크 공유 링크의 공개 여부를 전환하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 공유 링크 공개/비공개 전환
 * 2. 공유 링크 소유권 확인
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface ToggleShareLinkVisibilityInput {
  shareLinkId: string;
  isPublic: boolean;
}

export interface ToggleShareLinkVisibilityResult {
  success: boolean;
  error?: string;
}

/**
 * 북마크 공유 링크 공개/비공개 전환
 * @param input 공유 링크 ID 및 공개 여부
 * @returns 전환 결과
 */
export async function toggleShareLinkVisibility(
  input: ToggleShareLinkVisibilityInput
): Promise<ToggleShareLinkVisibilityResult> {
  console.group(
    "[toggleShareLinkVisibility] 북마크 공유 링크 공개/비공개 전환 시작"
  );
  logInfo("[toggleShareLinkVisibility] 북마크 공유 링크 공개/비공개 전환", input);

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[toggleShareLinkVisibility]", error);
      logInfo("[toggleShareLinkVisibility] 인증되지 않은 사용자");
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
      console.error(
        "[toggleShareLinkVisibility] 사용자 조회 실패:",
        userError
      );
      logError(
        "[toggleShareLinkVisibility] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 공유 링크 소유권 확인
    const { data: shareLink, error: linkError } = await supabase
      .from("bookmark_share_links")
      .select("id")
      .eq("id", input.shareLinkId)
      .eq("user_id", userData.id)
      .single();

    if (linkError || !shareLink) {
      console.error(
        "[toggleShareLinkVisibility] 공유 링크 조회 실패:",
        linkError
      );
      logError(
        "[toggleShareLinkVisibility] 공유 링크 조회 실패",
        linkError instanceof Error ? linkError : new Error(String(linkError))
      );
      return {
        success: false,
        error: "공유 링크를 찾을 수 없거나 권한이 없습니다.",
      };
    }

    // 공개 여부 업데이트
    const { error: updateError } = await supabase
      .from("bookmark_share_links")
      .update({ is_public: input.isPublic })
      .eq("id", input.shareLinkId)
      .eq("user_id", userData.id);

    if (updateError) {
      console.error(
        "[toggleShareLinkVisibility] 공유 링크 업데이트 실패:",
        updateError
      );
      logError(
        "[toggleShareLinkVisibility] 공유 링크 업데이트 실패",
        updateError instanceof Error
          ? updateError
          : new Error(String(updateError))
      );
      return {
        success: false,
        error: "공유 링크 업데이트 중 오류가 발생했습니다.",
      };
    }

    console.log(
      "[toggleShareLinkVisibility] 공유 링크 공개/비공개 전환 완료"
    );
    logInfo("[toggleShareLinkVisibility] 공유 링크 공개/비공개 전환 완료", {
      shareLinkId: input.shareLinkId,
      isPublic: input.isPublic,
    });
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error(
      "[toggleShareLinkVisibility] 북마크 공유 링크 공개/비공개 전환 오류:",
      error
    );
    logError(
      "[toggleShareLinkVisibility] 북마크 공유 링크 공개/비공개 전환 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "공유 링크 공개/비공개 전환 중 예기치 않은 오류가 발생했습니다.",
    };
  }
}

