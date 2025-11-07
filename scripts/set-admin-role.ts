/**
 * @file set-admin-role.ts
 * @description 특정 이메일 주소의 사용자를 관리자로 설정하는 스크립트
 *
 * 사용법:
 *   pnpm tsx scripts/set-admin-role.ts youngkiss3181@gmail.com
 */

import { clerkClient } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

async function setAdminRole(email: string) {
  try {
    console.log(`[setAdminRole] 이메일로 사용자 검색: ${email}`);

    // Clerk에서 이메일로 사용자 찾기
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });

    if (users.data.length === 0) {
      console.error(`[setAdminRole] 사용자를 찾을 수 없습니다: ${email}`);
      console.log("\n💡 해결 방법:");
      console.log("   1. 해당 이메일로 Clerk에 가입되어 있는지 확인");
      console.log("   2. 이메일 주소가 정확한지 확인");
      process.exit(1);
    }

    const clerkUser = users.data[0];
    console.log(`[setAdminRole] 사용자 찾음: ${clerkUser.id} (${clerkUser.fullName || email})`);

    // Supabase에 사용자 정보 동기화 및 역할 설정
    const supabase = getServiceRoleClient();

    // 먼저 사용자가 존재하는지 확인
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, clerk_id, name, role")
      .eq("clerk_id", clerkUser.id)
      .single();

    if (existingUser) {
      // 사용자가 있으면 역할만 업데이트
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({ role: "admin" })
        .eq("clerk_id", clerkUser.id)
        .select()
        .single();

      if (error) {
        console.error(`[setAdminRole] 역할 업데이트 실패:`, error);
        process.exit(1);
      }

      console.log(`✅ 역할이 'admin'으로 업데이트되었습니다.`);
      console.log(`   사용자 ID: ${updatedUser.id}`);
      console.log(`   Clerk ID: ${updatedUser.clerk_id}`);
      console.log(`   이름: ${updatedUser.name}`);
      console.log(`   역할: ${updatedUser.role}`);
    } else {
      // 사용자가 없으면 생성
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          clerk_id: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.username ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "Unknown",
          role: "admin",
        })
        .select()
        .single();

      if (error) {
        console.error(`[setAdminRole] 사용자 생성 실패:`, error);
        process.exit(1);
      }

      console.log(`✅ 사용자를 생성하고 'admin' 역할을 부여했습니다.`);
      console.log(`   사용자 ID: ${newUser.id}`);
      console.log(`   Clerk ID: ${newUser.clerk_id}`);
      console.log(`   이름: ${newUser.name}`);
      console.log(`   역할: ${newUser.role}`);
    }

    console.log("\n🎉 완료!");
  } catch (error) {
    console.error(`[setAdminRole] 오류:`, error);
    process.exit(1);
  }
}

// 여러 이메일을 한 번에 처리
async function setMultipleAdminRoles(emails: string[]) {
  console.log(`\n📋 총 ${emails.length}개의 계정에 관리자 권한을 부여합니다.\n`);
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`\n[${i + 1}/${emails.length}] 처리 중: ${email}`);
    console.log("─".repeat(50));
    await setAdminRole(email);
  }
  
  console.log("\n\n✅ 모든 계정에 관리자 권한 부여 완료!");
}

// 스크립트 실행
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("❌ 이메일 주소를 입력해주세요.");
  console.log("\n사용법:");
  console.log("  pnpm tsx scripts/set-admin-role.ts <email1> [email2] ...");
  console.log("\n예시:");
  console.log("  pnpm tsx scripts/set-admin-role.ts youngkiss3181@gmail.com");
  console.log("  pnpm tsx scripts/set-admin-role.ts user1@example.com user2@example.com");
  process.exit(1);
}

if (args.length === 1) {
  setAdminRole(args[0]);
} else {
  setMultipleAdminRoles(args);
}

