/**
 * @file get-filter-presets.ts
 * @description 필터 프리셋 목록 조회 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export interface FilterPreset {
  id: string;
  name: string;
  description: string | null;
  filterType: "travel" | "statistics" | "dashboard";
  filterConfig: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetFilterPresetsResult {
  success: boolean;
  presets?: FilterPreset[];
  error?: string;
}

export async function getFilterPresets(
  filterType?: "travel" | "statistics" | "dashboard"
): Promise<GetFilterPresetsResult> {
  console.group("[getFilterPresets] 필터 프리셋 목록 조회 시작");
  console.log("필터 타입:", filterType);

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[getFilterPresets] 인증되지 않은 사용자");
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
      console.error("[getFilterPresets] 사용자 조회 실패:", userError);
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    // 필터 프리셋 조회
    let query = supabase
      .from("filter_presets")
      .select("*")
      .eq("user_id", userData.id);

    if (filterType) {
      query = query.eq("filter_type", filterType);
    }

    const { data: presets, error: presetsError } = await query
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (presetsError) {
      console.error("[getFilterPresets] 필터 프리셋 조회 실패:", presetsError);
      console.groupEnd();
      return { success: false, error: "필터 프리셋 목록을 불러오는데 실패했습니다." };
    }

    const result: FilterPreset[] = (presets || []).map((preset) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      filterType: preset.filter_type,
      filterConfig: preset.filter_config || {},
      isDefault: preset.is_default,
      createdAt: preset.created_at,
      updatedAt: preset.updated_at,
    }));

    console.log("[getFilterPresets] 필터 프리셋 목록 조회 완료:", result.length);
    console.groupEnd();

    return {
      success: true,
      presets: result,
    };
  } catch (error) {
    console.error("[getFilterPresets] 필터 프리셋 목록 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "필터 프리셋 목록을 불러오는데 실패했습니다.",
    };
  }
}

