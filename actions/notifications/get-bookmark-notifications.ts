/**
 * @file get-bookmark-notifications.ts
 * @description 북마크 알림 목록 조회 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface BookmarkNotification {
  id: string;
  bookmarkId: string | null;
  notificationType: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface GetBookmarkNotificationsResult {
  success: boolean;
  notifications?: BookmarkNotification[];
  error?: string;
}

export async function getBookmarkNotifications(): Promise<GetBookmarkNotificationsResult> {
  console.group("[getBookmarkNotifications] 알림 목록 조회 시작");

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getBookmarkNotifications] 인증되지 않은 사용자");
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
      console.error("[getBookmarkNotifications] 사용자 조회 실패:", userError);
      logError(
        "[getBookmarkNotifications] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const { data, error } = await supabase
      .from("bookmark_notifications")
      .select("id, bookmark_id, notification_type, title, message, metadata, is_read, read_at, created_at")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[getBookmarkNotifications] 알림 조회 실패:", error);
      logError(
        "[getBookmarkNotifications] 알림 조회 실패",
        error instanceof Error ? error : new Error(String(error))
      );
      console.groupEnd();
      return { success: false, error: "알림을 불러오는데 실패했습니다." };
    }

    const notifications: BookmarkNotification[] = (data || []).map((item) => ({
      id: item.id,
      bookmarkId: item.bookmark_id,
      notificationType: item.notification_type,
      title: item.title,
      message: item.message,
      metadata: (item.metadata as Record<string, unknown> | null) ?? {},
      isRead: item.is_read,
      readAt: item.read_at,
      createdAt: item.created_at,
    }));

    logInfo("[getBookmarkNotifications] 알림 조회 완료", {
      count: notifications.length,
    });
    console.groupEnd();

    return { success: true, notifications };
  } catch (error) {
    console.error("[getBookmarkNotifications] 알림 조회 오류:", error);
    logError(
      "[getBookmarkNotifications] 알림 조회 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "알림을 불러오는데 실패했습니다." };
  }
}

