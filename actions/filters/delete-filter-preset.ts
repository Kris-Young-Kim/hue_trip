/**
 * @file delete-filter-preset.ts
 * @description 필터 프리셋 삭제 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface DeleteFilterPresetResult {
  success: boolean;
  error?: string;
}

export async function deleteFilterPreset(
  presetId: string
): Promise<DeleteFilterPresetResult> {
  console.group("[deleteFilterPreset] 필터 프리셋 삭제 시작");
  console.log("프리셋 ID:", presetId);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[deleteFilterPreset] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 사용자 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[deleteFilterPreset] 사용자 조회 실패:", userError);
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 필터 프리셋 조회 및 권한 확인
    const { data: preset, error: presetError } = await supabase
      .from("filter_presets")
      .select("*")
      .eq("id", presetId)
      .single();

    if (presetError || !preset) {
      console.error("[deleteFilterPreset] 필터 프리셋 조회 실패:", presetError);
      console.groupEnd();
      return { success: false, error: "필터 프리셋을 찾을 수 없습니다." };
    }

    if (preset.user_id !== userData.id) {
      console.warn("[deleteFilterPreset] 권한 없음");
      console.groupEnd();
      return { success: false, error: "필터 프리셋을 삭제할 권한이 없습니다." };
    }

    // 필터 프리셋 삭제
    const { error: deleteError } = await supabase
      .from("filter_presets")
      .delete()
      .eq("id", presetId);

    if (deleteError) {
      console.error("[deleteFilterPreset] 필터 프리셋 삭제 실패:", deleteError);
      console.groupEnd();
      return { success: false, error: "필터 프리셋 삭제에 실패했습니다." };
    }

    console.log("[deleteFilterPreset] 필터 프리셋 삭제 완료");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("[deleteFilterPreset] 필터 프리셋 삭제 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "필터 프리셋 삭제 중 오류가 발생했습니다.",
    };
  }
}

