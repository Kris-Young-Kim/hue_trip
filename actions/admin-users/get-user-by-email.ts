"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 이메일로 Clerk 사용자 찾기
 */
export async function getUserByEmail(email: string) {
  try {
    const client = await clerkClient();
    
    // Clerk에서 이메일로 사용자 검색
    const users = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });

    if (users.data.length === 0) {
      return { success: false, error: "사용자를 찾을 수 없습니다." };
    }

    const clerkUser = users.data[0];
    
    return {
      success: true,
      user: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: clerkUser.fullName || clerkUser.username || email,
      },
    };
  } catch (error) {
    console.error("[getUserByEmail] 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "사용자 조회 실패",
    };
  }
}

/**
 * 사용자에게 역할 부여
 */
export async function setUserRole(clerkId: string, role: "admin" | "editor" | "user") {
  try {
    const supabase = getServiceRoleClient();

    // 먼저 사용자가 Supabase에 존재하는지 확인
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id, clerk_id, name, role")
      .eq("clerk_id", clerkId)
      .single();

    if (findError && findError.code !== "PGRST116") {
      console.error("[setUserRole] 사용자 조회 실패:", findError);
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다. 먼저 로그인하여 계정을 생성해주세요.",
      };
    }

    // 사용자가 없으면 Clerk에서 정보를 가져와서 생성
    if (!existingUser) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkId);

      if (!clerkUser) {
        return {
          success: false,
          error: "Clerk에서 사용자를 찾을 수 없습니다.",
        };
      }

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          clerk_id: clerkId,
          name:
            clerkUser.fullName ||
            clerkUser.username ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "Unknown",
          role: role,
        })
        .select()
        .single();

      if (createError) {
        console.error("[setUserRole] 사용자 생성 실패:", createError);
        return {
          success: false,
          error: "사용자 생성 실패",
        };
      }

      return {
        success: true,
        user: newUser,
        message: "사용자를 생성하고 역할을 부여했습니다.",
      };
    }

    // 사용자가 있으면 역할만 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ role })
      .eq("clerk_id", clerkId)
      .select()
      .single();

    if (updateError) {
      console.error("[setUserRole] 역할 업데이트 실패:", updateError);
      return {
        success: false,
        error: "역할 업데이트 실패",
      };
    }

    return {
      success: true,
      user: updatedUser,
      message: "역할이 업데이트되었습니다.",
    };
  } catch (error) {
    console.error("[setUserRole] 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "역할 설정 실패",
    };
  }
}

