/**
 * @file create-share-link.ts
 * @description 북마크 공유 링크 생성/업데이트 Server Action
 *
 * 북마크 목록 또는 폴더를 공유하기 위한 공유 링크를 생성하거나 업데이트하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 공유 링크 생성/업데이트
 * 2. 전체 북마크 또는 폴더별 공유 링크 생성
 * 3. 공유 토큰 자동 생성
 * 4. 기존 링크가 있으면 업데이트, 없으면 생성
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface CreateShareLinkInput {
  folderId?: string | null; // null이면 전체 북마크 공유
  scope: "all" | "folder"; // 'all': 전체 북마크, 'folder': 폴더별 공유
}

export interface CreateShareLinkResult {
  success: boolean;
  shareLink?: {
    id: string;
    shareToken: string;
    isPublic: boolean;
    scope: "all" | "folder";
    folderId?: string | null;
  };
  error?: string;
}

/**
 * 북마크 공유 링크 생성/업데이트
 * @param input 공유 링크 정보
 * @returns 생성/업데이트 결과
 */
export async function createOrUpdateShareLink(
  input: CreateShareLinkInput
): Promise<CreateShareLinkResult> {
  console.group("[createOrUpdateShareLink] 북마크 공유 링크 생성/업데이트 시작");
  logInfo("[createOrUpdateShareLink] 북마크 공유 링크 생성/업데이트", input);

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      const error = "인증되지 않은 사용자입니다.";
      console.warn("[createOrUpdateShareLink]", error);
      logInfo("[createOrUpdateShareLink] 인증되지 않은 사용자");
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
        "[createOrUpdateShareLink] 사용자 조회 실패:",
        userError
      );
      logError(
        "[createOrUpdateShareLink] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 폴더 소유권 확인 (폴더별 공유인 경우)
    if (input.scope === "folder" && input.folderId) {
      const { data: folder, error: folderError } = await supabase
        .from("bookmark_folders")
        .select("id")
        .eq("id", input.folderId)
        .eq("user_id", userData.id)
        .single();

      if (folderError || !folder) {
        console.error(
          "[createOrUpdateShareLink] 폴더 조회 실패:",
          folderError
        );
        logError(
          "[createOrUpdateShareLink] 폴더 조회 실패",
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

    // 기존 공유 링크 확인
    let query = supabase
      .from("bookmark_share_links")
      .select("id, share_token, is_public")
      .eq("user_id", userData.id)
      .eq("scope", input.scope);

    if (input.scope === "folder" && input.folderId) {
      query = query.eq("folder_id", input.folderId);
    } else {
      query = query.is("folder_id", null);
    }

    const { data: existingLink, error: checkError } = await query.single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 (기존 링크 없음)
      console.error(
        "[createOrUpdateShareLink] 기존 링크 확인 실패:",
        checkError
      );
      logError(
        "[createOrUpdateShareLink] 기존 링크 확인 실패",
        checkError instanceof Error
          ? checkError
          : new Error(String(checkError))
      );
      return {
        success: false,
        error: "공유 링크 확인 중 오류가 발생했습니다.",
      };
    }

    if (existingLink) {
      // 기존 링크 업데이트 (토큰 재생성)
      const randomBytes = new Uint8Array(16);
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(randomBytes);
      } else {
        // Node.js 환경에서의 대체 방법
        for (let i = 0; i < 16; i++) {
          randomBytes[i] = Math.floor(Math.random() * 256);
        }
      }
      const newToken = Buffer.from(randomBytes).toString("hex");

      const { data: updatedLink, error: updateError } = await supabase
        .from("bookmark_share_links")
        .update({
          share_token: newToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLink.id)
        .select("id, share_token, is_public, scope, folder_id")
        .single();

      if (updateError) {
        console.error(
          "[createOrUpdateShareLink] 공유 링크 업데이트 실패:",
          updateError
        );
        logError(
          "[createOrUpdateShareLink] 공유 링크 업데이트 실패",
          updateError instanceof Error
            ? updateError
            : new Error(String(updateError))
        );
        return {
          success: false,
          error: "공유 링크 업데이트 중 오류가 발생했습니다.",
        };
      }

      console.log("[createOrUpdateShareLink] 공유 링크 업데이트 완료");
      logInfo("[createOrUpdateShareLink] 공유 링크 업데이트 완료", {
        linkId: updatedLink.id,
      });
      console.groupEnd();

      return {
        success: true,
        shareLink: {
          id: updatedLink.id,
          shareToken: updatedLink.share_token,
          isPublic: updatedLink.is_public,
          scope: updatedLink.scope as "all" | "folder",
          folderId: updatedLink.folder_id || null,
        },
      };
    } else {
      // 새 링크 생성
      const { data: newLink, error: insertError } = await supabase
        .from("bookmark_share_links")
        .insert({
          user_id: userData.id,
          folder_id: input.folderId || null,
          scope: input.scope,
          is_public: true, // 기본값: 공개
        })
        .select("id, share_token, is_public, scope, folder_id")
        .single();

      if (insertError) {
        console.error(
          "[createOrUpdateShareLink] 공유 링크 생성 실패:",
          insertError
        );
        logError(
          "[createOrUpdateShareLink] 공유 링크 생성 실패",
          insertError instanceof Error
            ? insertError
            : new Error(String(insertError))
        );
        return {
          success: false,
          error: "공유 링크 생성 중 오류가 발생했습니다.",
        };
      }

      console.log("[createOrUpdateShareLink] 공유 링크 생성 완료");
      logInfo("[createOrUpdateShareLink] 공유 링크 생성 완료", {
        linkId: newLink.id,
      });
      console.groupEnd();

      return {
        success: true,
        shareLink: {
          id: newLink.id,
          shareToken: newLink.share_token,
          isPublic: newLink.is_public,
          scope: newLink.scope as "all" | "folder",
          folderId: newLink.folder_id || null,
        },
      };
    }
  } catch (error) {
    console.error(
      "[createOrUpdateShareLink] 북마크 공유 링크 생성/업데이트 오류:",
      error
    );
    logError(
      "[createOrUpdateShareLink] 북마크 공유 링크 생성/업데이트 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "공유 링크 생성/업데이트 중 예기치 않은 오류가 발생했습니다.",
    };
  }
}

