/**
 * @file get-bookmark-notification-preferences.ts
 * @description 북마크 알림 설정 조회 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface BookmarkNotificationPreferences {
  notifyTravelUpdate: boolean;
  notifyEvent: boolean;
  notifyWeather: boolean;
}

export interface GetBookmarkNotificationPreferencesResult {
  success: boolean;
  preferences?: BookmarkNotificationPreferences;
  error?: string;
}

export async function getBookmarkNotificationPreferences(): Promise<GetBookmarkNotificationPreferencesResult> {
  console.group("[getBookmarkNotificationPreferences] 알림 설정 조회 시작");

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getBookmarkNotificationPreferences] 인증되지 않은 사용자");
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
      console.error("[getBookmarkNotificationPreferences] 사용자 조회 실패:", userError);
      logError(
        "[getBookmarkNotificationPreferences] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const { data, error } = await supabase
      .from("bookmark_notification_preferences")
      .select("notify_travel_update, notify_event, notify_weather")
      .eq("user_id", userData.id)
      .maybeSingle();

    if (error) {
      console.error("[getBookmarkNotificationPreferences] 설정 조회 실패:", error);
      logError(
        "[getBookmarkNotificationPreferences] 설정 조회 실패",
        error instanceof Error ? error : new Error(String(error))
      );
      console.groupEnd();
      return { success: false, error: "알림 설정을 불러오는데 실패했습니다." };
    }

    const preferences: BookmarkNotificationPreferences = {
      notifyTravelUpdate: data?.notify_travel_update ?? true,
      notifyEvent: data?.notify_event ?? true,
      notifyWeather: data?.notify_weather ?? false,
    };

    logInfo("[getBookmarkNotificationPreferences] 설정 조회 완료", preferences);
    console.groupEnd();
    return { success: true, preferences };
  } catch (error) {
    console.error("[getBookmarkNotificationPreferences] 설정 조회 오류:", error);
    logError(
      "[getBookmarkNotificationPreferences] 설정 조회 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "알림 설정을 불러오는데 실패했습니다." };
  }
}

