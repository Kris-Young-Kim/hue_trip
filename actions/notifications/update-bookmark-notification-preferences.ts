/**
 * @file update-bookmark-notification-preferences.ts
 * @description 북마크 알림 설정 업데이트 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface UpdateBookmarkNotificationPreferencesInput {
  notifyTravelUpdate: boolean;
  notifyEvent: boolean;
  notifyWeather: boolean;
}

export interface UpdateBookmarkNotificationPreferencesResult {
  success: boolean;
  error?: string;
}

export async function updateBookmarkNotificationPreferences(
  input: UpdateBookmarkNotificationPreferencesInput
): Promise<UpdateBookmarkNotificationPreferencesResult> {
  console.group("[updateBookmarkNotificationPreferences] 알림 설정 업데이트 시작");
  console.log("요청 데이터:", input);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[updateBookmarkNotificationPreferences] 인증되지 않은 사용자");
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
      console.error("[updateBookmarkNotificationPreferences] 사용자 조회 실패:", userError);
      logError(
        "[updateBookmarkNotificationPreferences] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const { error } = await supabase
      .from("bookmark_notification_preferences")
      .upsert(
        {
          user_id: userData.id,
          notify_travel_update: input.notifyTravelUpdate,
          notify_event: input.notifyEvent,
          notify_weather: input.notifyWeather,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("[updateBookmarkNotificationPreferences] 설정 업데이트 실패:", error);
      logError(
        "[updateBookmarkNotificationPreferences] 설정 업데이트 실패",
        error instanceof Error ? error : new Error(String(error))
      );
      console.groupEnd();
      return { success: false, error: "알림 설정 저장에 실패했습니다." };
    }

    logInfo("[updateBookmarkNotificationPreferences] 설정 업데이트 완료", input);
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error("[updateBookmarkNotificationPreferences] 설정 업데이트 오류:", error);
    logError(
      "[updateBookmarkNotificationPreferences] 설정 업데이트 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return { success: false, error: "알림 설정 저장 중 오류가 발생했습니다." };
  }
}

