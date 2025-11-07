/**
 * @file get-share-link.ts
 * @description 북마크 공유 링크 조회 Server Action
 *
 * 사용자의 북마크 공유 링크 정보를 조회하는 Server Action
 *
 * 주요 기능:
 * 1. 인증된 사용자의 공유 링크 조회
 * 2. 전체 북마크 또는 폴더별 공유 링크 조회
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - @clerk/nextjs/server: auth
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface ShareLink {
  id: string;
  shareToken: string;
  isPublic: boolean;
  scope: "all" | "folder";
  folderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 북마크 공유 링크 조회
 * @param folderId 폴더 ID (전체 북마크 공유는 null)
 * @param scope 공유 범위 ('all' | 'folder')
 * @returns 공유 링크 정보
 */
export async function getShareLink(
  folderId?: string | null,
  scope: "all" | "folder" = "all"
): Promise<ShareLink | null> {
  console.group("[getShareLink] 북마크 공유 링크 조회 시작");
  logInfo("[getShareLink] 북마크 공유 링크 조회", { folderId, scope });

  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getShareLink] 인증되지 않은 사용자");
      logInfo("[getShareLink] 인증되지 않은 사용자");
      return null;
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
      console.error("[getShareLink] 사용자 조회 실패:", userError);
      logError(
        "[getShareLink] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      return null;
    }

    // 공유 링크 조회
    let query = supabase
      .from("bookmark_share_links")
      .select("id, share_token, is_public, scope, folder_id, created_at, updated_at")
      .eq("user_id", userData.id)
      .eq("scope", scope);

    if (scope === "folder" && folderId) {
      query = query.eq("folder_id", folderId);
    } else {
      query = query.is("folder_id", null);
    }

    const { data: shareLink, error: linkError } = await query.single();

    if (linkError) {
      if (linkError.code === "PGRST116") {
        // 기존 링크 없음
        console.log("[getShareLink] 공유 링크 없음");
        logInfo("[getShareLink] 공유 링크 없음");
        return null;
      }
      console.error("[getShareLink] 공유 링크 조회 실패:", linkError);
      logError(
        "[getShareLink] 공유 링크 조회 실패",
        linkError instanceof Error ? linkError : new Error(String(linkError))
      );
      return null;
    }

    console.log("[getShareLink] 공유 링크 조회 완료");
    logInfo("[getShareLink] 공유 링크 조회 완료", { linkId: shareLink.id });
    console.groupEnd();

    return {
      id: shareLink.id,
      shareToken: shareLink.share_token,
      isPublic: shareLink.is_public,
      scope: shareLink.scope as "all" | "folder",
      folderId: shareLink.folder_id || null,
      createdAt: shareLink.created_at,
      updatedAt: shareLink.updated_at,
    };
  } catch (error) {
    console.error("[getShareLink] 북마크 공유 링크 조회 오류:", error);
    logError(
      "[getShareLink] 북마크 공유 링크 조회 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return null;
  }
}

