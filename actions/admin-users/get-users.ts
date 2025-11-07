"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { clerkClient } from "@clerk/nextjs/server";

export interface UserWithRole {
  id: string;
  clerkId: string;
  name: string;
  email: string | null;
  role: "admin" | "editor" | "user";
  createdAt: string;
}

/**
 * 모든 사용자 목록 조회 (역할 포함)
 */
export async function getUsers(): Promise<{
  success: boolean;
  users?: UserWithRole[];
  error?: string;
}> {
  try {
    const supabase = getServiceRoleClient();

    // Supabase에서 사용자 목록 조회
    const { data: users, error } = await supabase
      .from("users")
      .select("id, clerk_id, name, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getUsers] 사용자 조회 실패:", error);
      return {
        success: false,
        error: "사용자 목록을 불러올 수 없습니다.",
      };
    }

    // Clerk에서 이메일 정보 가져오기
    const client = await clerkClient();
    const usersWithEmail: UserWithRole[] = await Promise.all(
      (users || []).map(async (user) => {
        try {
          const clerkUser = await client.users.getUser(user.clerk_id);
          return {
            id: user.id,
            clerkId: user.clerk_id,
            name: user.name,
            email: clerkUser.emailAddresses[0]?.emailAddress || null,
            role: (user.role as "admin" | "editor" | "user") || "user",
            createdAt: user.created_at,
          };
        } catch {
          return {
            id: user.id,
            clerkId: user.clerk_id,
            name: user.name,
            email: null,
            role: (user.role as "admin" | "editor" | "user") || "user",
            createdAt: user.created_at,
          };
        }
      })
    );

    return {
      success: true,
      users: usersWithEmail,
    };
  } catch (error) {
    console.error("[getUsers] 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "사용자 목록 조회 실패",
    };
  }
}

