/**
 * @file user-role-manager.tsx
 * @description 사용자 역할 관리 컴포넌트
 *
 * 관리자가 사용자의 역할을 조회하고 변경할 수 있는 UI
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, UserPlus, Shield, Edit, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserWithRole {
  id: string;
  clerkId: string;
  name: string;
  email: string | null;
  role: "admin" | "editor" | "user";
  createdAt: string;
}

interface UserRoleManagerProps {
  initialUsers: UserWithRole[];
  onSetUserRole: (clerkId: string, role: "admin" | "editor" | "user") => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
  onGetUserByEmail: (email: string) => Promise<{
    success: boolean;
    user?: { clerkId: string; email?: string; name: string };
    error?: string;
  }>;
}

export function UserRoleManager({
  initialUsers,
  onSetUserRole,
  onGetUserByEmail,
}: UserRoleManagerProps) {
  const [users, setUsers] = useState<UserWithRole[]>(initialUsers);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    setIsSearching(true);
    try {
      const result = await onGetUserByEmail(searchEmail.trim());
      
      if (!result.success || !result.user) {
        toast.error(result.error || "사용자를 찾을 수 없습니다.");
        return;
      }

      // 사용자가 이미 목록에 있는지 확인
      const existingUser = users.find((u) => u.clerkId === result.user!.clerkId);
      
      if (existingUser) {
        toast.info("이미 목록에 있는 사용자입니다.");
        return;
      }

      // 새 사용자를 목록에 추가 (역할은 기본값 'user')
      const newUser: UserWithRole = {
        id: "", // Supabase ID는 아직 없을 수 있음
        clerkId: result.user.clerkId,
        name: result.user.name,
        email: result.user.email || null,
        role: "user",
        createdAt: new Date().toISOString(),
      };

      setUsers([...users, newUser]);
      setSearchEmail("");
      toast.success("사용자를 찾았습니다. 역할을 설정해주세요.");
    } catch (error) {
      console.error("[UserRoleManager] 검색 오류:", error);
      toast.error("사용자 검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRoleChange = async (clerkId: string, newRole: "admin" | "editor" | "user") => {
    setIsUpdating(clerkId);
    try {
      const result = await onSetUserRole(clerkId, newRole);
      
      if (!result.success) {
        toast.error(result.error || "역할 변경에 실패했습니다.");
        return;
      }

      // 목록 업데이트
      setUsers((prev) =>
        prev.map((user) =>
          user.clerkId === clerkId ? { ...user, role: newRole } : user
        )
      );

      toast.success(result.message || "역할이 변경되었습니다.");
    } catch (error) {
      console.error("[UserRoleManager] 역할 변경 오류:", error);
      toast.error("역할 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleBadge = (role: "admin" | "editor" | "user") => {
    const variants = {
      admin: "destructive",
      editor: "default",
      user: "secondary",
    } as const;

    const labels = {
      admin: "관리자",
      editor: "편집자",
      user: "일반 사용자",
    };

    return (
      <Badge variant={variants[role]}>
        {labels[role]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 사용자 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 검색 및 추가</CardTitle>
          <CardDescription>
            이메일로 사용자를 검색하여 역할을 부여할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-email">이메일 주소</Label>
              <Input
                id="search-email"
                type="email"
                placeholder="youngkiss3181@gmail.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchEmail.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                검색
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>
            총 {users.length}명의 사용자
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              사용자가 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>현재 역할</TableHead>
                  <TableHead>역할 변경</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.clerkId}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value: "admin" | "editor" | "user") =>
                          handleRoleChange(user.clerkId, value)
                        }
                        disabled={isUpdating === user.clerkId}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              관리자
                            </div>
                          </SelectItem>
                          <SelectItem value="editor">
                            <div className="flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              편집자
                            </div>
                          </SelectItem>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              일반 사용자
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

