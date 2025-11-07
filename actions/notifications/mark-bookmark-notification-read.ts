/**
 * @file mark-bookmark-notification-read.ts
 * @description 북마크 알림 읽음 처리 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface MarkNotificationReadResult {
  success: boolean;
  error?: string;
}

export async function markBookmarkNotificationRead(notificationId: string): Promise<MarkNotificationReadResult> {
  console.group("[markBookmarkNotificationRead] 알림 읽음 처리 시작");
  console.log("알림 ID:", notificationId);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[markBookmarkNotificationRead] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = createClerkSupabaseClient();

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[markBookmarkNotificationRead] 사용자 조회 실패:", userError);
      logError(
        "[markBookmarkNotificationRead] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const { error } = await supabase
      .from("bookmark_notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userData.id);

    if (error) {
      console.error("[markBookmarkNotificationRead] 알림 업데이트 실패:", error);
      logError(
        "[markBookmarkNotificationRead] 알림 업데이트 실패",
        error instanceof Error ? error : new Error(String(error))
      );
      console.groupEnd();
      return { success: false, error: "알림 읽음 처리에 실패했습니다." };
    }

    logInfo("[markBookmarkNotificationRead] 알림 읽음 처리 완료", {
      notificationId,
    });
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error("[markBookmarkNotificationRead] 알림 읽음 처리 오류:", error);
    logError(
      "[markBookmarkNotificationRead] 알림 읽음 처리 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "알림 읽음 처리 중 오류가 발생했습니다." };
  }
}

