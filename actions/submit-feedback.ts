/**
 * @file submit-feedback.ts
 * @description 피드백 제출 Server Action
 *
 * 사용자 피드백을 데이터베이스에 저장하는 Server Action
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - lib/utils/logger.ts: 로깅 시스템
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { logError, logInfo } from "@/lib/utils/logger";

export interface FeedbackInput {
  type: "bug" | "feature" | "improvement" | "other";
  title: string;
  description: string;
  contactEmail?: string;
  pageUrl?: string;
  userAgent?: string;
}

/**
 * 피드백 제출
 * @param input 피드백 입력 데이터
 * @returns 성공 여부 및 피드백 ID
 */
export async function submitFeedback(input: FeedbackInput) {
  logInfo("[Feedback] 피드백 제출 시작", { type: input.type, title: input.title });

  try {
    const supabase = createClerkSupabaseClient();
    const { userId } = await auth();

    // 사용자 ID 조회 (인증된 사용자인 경우)
    let dbUserId: string | null = null;
    if (userId) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (!userError && userData) {
        dbUserId = userData.id;
      }
    }

    // 피드백 저장
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        user_id: dbUserId,
        type: input.type,
        title: input.title,
        description: input.description,
        contact_email: input.contactEmail,
        page_url: input.pageUrl,
        user_agent: input.userAgent,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      logError("[Feedback] 피드백 저장 실패", error, { input });
      throw error;
    }

    logInfo("[Feedback] 피드백 저장 완료", { feedbackId: data.id });
    return { success: true, feedbackId: data.id };
  } catch (error) {
    logError("[Feedback] 피드백 제출 실패", error, { input });
    return { success: false, error: error instanceof Error ? error.message : "알 수 없는 오류" };
  }
}

