/**
 * @file create-filter-preset.ts
 * @description 필터 프리셋 생성 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface CreateFilterPresetInput {
  name: string;
  description?: string;
  filterType: "travel" | "statistics" | "dashboard";
  filterConfig: Record<string, any>;
  isDefault?: boolean;
}

export interface CreateFilterPresetResult {
  success: boolean;
  presetId?: string;
  error?: string;
}

export async function createFilterPreset(
  input: CreateFilterPresetInput
): Promise<CreateFilterPresetResult> {
  console.group("[createFilterPreset] 필터 프리셋 생성 시작");
  console.log("입력:", input);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[createFilterPreset] 인증되지 않은 사용자");
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
      console.error("[createFilterPreset] 사용자 조회 실패:", userError);
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 기본 프리셋으로 설정하는 경우, 기존 기본 프리셋 해제
    if (input.isDefault) {
      await supabase
        .from("filter_presets")
        .update({ is_default: false })
        .eq("user_id", userData.id)
        .eq("filter_type", input.filterType)
        .eq("is_default", true);
    }

    // 필터 프리셋 생성
    const { data: preset, error: presetError } = await supabase
      .from("filter_presets")
      .insert({
        user_id: userData.id,
        name: input.name,
        description: input.description,
        filter_type: input.filterType,
        filter_config: input.filterConfig,
        is_default: input.isDefault || false,
      })
      .select()
      .single();

    if (presetError || !preset) {
      console.error("[createFilterPreset] 필터 프리셋 생성 실패:", presetError);
      console.groupEnd();
      return { success: false, error: "필터 프리셋 생성에 실패했습니다." };
    }

    console.log("[createFilterPreset] 필터 프리셋 생성 완료:", preset.id);
    console.groupEnd();

    return {
      success: true,
      presetId: preset.id,
    };
  } catch (error) {
    console.error("[createFilterPreset] 필터 프리셋 생성 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "필터 프리셋 생성 중 오류가 발생했습니다.",
    };
  }
}

