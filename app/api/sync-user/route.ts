import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Clerk 사용자를 Supabase users 테이블에 동기화하는 API
 *
 * 클라이언트에서 로그인 후 이 API를 호출하여 사용자 정보를 Supabase에 저장합니다.
 * 이미 존재하는 경우 업데이트하고, 없으면 새로 생성합니다.
 */
export async function POST() {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clerk에서 사용자 정보 가져오기
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Supabase에 사용자 정보 동기화
    const supabase = getServiceRoleClient();

    // 기존 사용자 확인 (역할 유지)
    let existingRole: string | null = null;
    let hasRoleColumn = false;
    
    try {
      // role 컬럼 존재 여부 확인
      const { data: testUser, error: testError } = await supabase
        .from("users")
        .select("role")
        .limit(1)
        .maybeSingle();
      
      // role 컬럼이 존재하는 경우
      if (!testError || testUser !== null) {
        hasRoleColumn = true;
        
        // 기존 사용자 역할 확인
        const { data: existingUser } = await supabase
          .from("users")
          .select("role")
          .eq("clerk_id", clerkUser.id)
          .maybeSingle();
        
        existingRole = existingUser?.role || null;
      }
    } catch (error) {
      // role 컬럼이 없는 경우 무시
      console.warn("[sync-user] role 컬럼 확인 실패 (마이그레이션 미적용 가능):", error);
      hasRoleColumn = false;
    }

    // upsert 데이터 준비
    const upsertData: {
      clerk_id: string;
      name: string;
      role?: string;
    } = {
      clerk_id: clerkUser.id,
      name:
        clerkUser.fullName ||
        clerkUser.username ||
        clerkUser.emailAddresses[0]?.emailAddress ||
        "Unknown",
    };

    // role 컬럼이 있는 경우에만 role 추가
    if (hasRoleColumn) {
      upsertData.role = existingRole || "user";
    }

    const { data, error } = await supabase
      .from("users")
      .upsert(upsertData, {
        onConflict: "clerk_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase sync error:", error);
      return NextResponse.json(
        { error: "Failed to sync user", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
