/**
 * @file page.tsx
 * @description 사용자 역할 관리 페이지
 *
 * 관리자가 사용자의 역할(관리자, 편집자, 일반 사용자)을 관리할 수 있는 페이지
 */

import { redirect } from "next/navigation";
import { getUsers } from "@/actions/admin-users/get-users";
import { setUserRole, getUserByEmail } from "@/actions/admin-users/get-user-by-email";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { checkUserRole } from "@/actions/admin-stats";

export default async function AdminUsersPage() {
  // 관리자 권한 확인
  const isAdmin = await checkUserRole("admin");
  
  if (!isAdmin) {
    redirect("/");
  }

  // 사용자 목록 조회
  const usersResult = await getUsers();

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            사용자 역할 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            사용자의 역할을 관리하고 권한을 부여하세요
          </p>
        </div>

        <UserRoleManager
          initialUsers={usersResult.success ? usersResult.users || [] : []}
          onSetUserRole={setUserRole}
          onGetUserByEmail={getUserByEmail}
        />
      </div>
    </main>
  );
}

