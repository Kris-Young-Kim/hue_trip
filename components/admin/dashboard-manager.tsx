/**
 * @file dashboard-manager.tsx
 * @description 대시보드 관리 UI 컴포넌트
 */

"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Settings, Share2, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { getDashboards, type DashboardConfig } from "@/actions/admin-dashboard/get-dashboards";
import { createDashboard } from "@/actions/admin-dashboard/create-dashboard";
import { updateDashboard } from "@/actions/admin-dashboard/update-dashboard";
import { shareDashboard } from "@/actions/admin-dashboard/share-dashboard";
import { WIDGET_TYPES } from "@/lib/utils/dashboard";

export function DashboardManager() {
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardConfig | null>(null);
  const [isPending, startTransition] = useTransition();

  // 폼 상태
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [sharedUserIds, setSharedUserIds] = useState<string[]>([]);

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    console.group("[DashboardManager] 대시보드 목록 로드");
    const result = await getDashboards();
    if (result.success && result.dashboards) {
      setDashboards(result.dashboards);
    } else {
      toast.error(result.error || "대시보드 목록을 불러오는데 실패했습니다.");
    }
    console.groupEnd();
  };

  const handleCreate = () => {
    startTransition(async () => {
      console.group("[DashboardManager] 대시보드 생성");
      const result = await createDashboard({
        name,
        description: description || undefined,
        isDefault,
      });

      if (result.success) {
        toast.success("대시보드가 생성되었습니다.");
        setIsCreateDialogOpen(false);
        setName("");
        setDescription("");
        setIsDefault(false);
        loadDashboards();
      } else {
        toast.error(result.error || "대시보드 생성에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const handleEdit = (dashboard: DashboardConfig) => {
    setSelectedDashboard(dashboard);
    setName(dashboard.name);
    setDescription(dashboard.description || "");
    setIsDefault(dashboard.isDefault);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedDashboard) return;

    startTransition(async () => {
      console.group("[DashboardManager] 대시보드 업데이트");
      const result = await updateDashboard({
        dashboardId: selectedDashboard.id,
        name,
        description: description || undefined,
        isDefault,
      });

      if (result.success) {
        toast.success("대시보드가 업데이트되었습니다.");
        setIsEditDialogOpen(false);
        setSelectedDashboard(null);
        setName("");
        setDescription("");
        setIsDefault(false);
        loadDashboards();
      } else {
        toast.error(result.error || "대시보드 업데이트에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  const handleShare = (dashboard: DashboardConfig) => {
    setSelectedDashboard(dashboard);
    setSharedUserIds([]);
    setIsShareDialogOpen(true);
  };

  const handleShareSubmit = () => {
    if (!selectedDashboard) return;

    startTransition(async () => {
      console.group("[DashboardManager] 대시보드 공유");
      const result = await shareDashboard({
        dashboardId: selectedDashboard.id,
        sharedWithUserIds: sharedUserIds,
        permission: "view",
      });

      if (result.success) {
        toast.success("대시보드가 공유되었습니다.");
        setIsShareDialogOpen(false);
        setSelectedDashboard(null);
        setSharedUserIds([]);
        loadDashboards();
      } else {
        toast.error(result.error || "대시보드 공유에 실패했습니다.");
      }
      console.groupEnd();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>대시보드 관리</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  새 대시보드
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 대시보드 생성</DialogTitle>
                  <DialogDescription>
                    새로운 대시보드를 생성합니다. 나중에 위젯을 추가할 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 일일 모니터링"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="대시보드에 대한 설명을 입력하세요"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-default"
                      checked={isDefault}
                      onCheckedChange={setIsDefault}
                    />
                    <Label htmlFor="is-default">기본 대시보드로 설정</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
                    생성
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                대시보드가 없습니다. 새 대시보드를 생성하세요.
              </div>
            ) : (
              dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{dashboard.name}</h3>
                      {dashboard.isDefault && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          기본
                        </span>
                      )}
                      {dashboard.isShared && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          공유됨
                        </span>
                      )}
                    </div>
                    {dashboard.description && (
                      <p className="text-sm text-gray-500 mt-1">{dashboard.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      위젯 {dashboard.widgetCount}개
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(dashboard)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(dashboard)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대시보드 편집</DialogTitle>
            <DialogDescription>대시보드 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">이름</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 일일 모니터링"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="대시보드에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="edit-is-default">기본 대시보드로 설정</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={isPending || !name.trim()}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 공유 다이얼로그 */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대시보드 공유</DialogTitle>
            <DialogDescription>
              대시보드를 다른 사용자와 공유합니다. (추후 구현: 사용자 검색 기능)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>공유 링크</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={
                    selectedDashboard
                      ? `${window.location.origin}/admin/dashboard/shared/${selectedDashboard.shareToken}`
                      : ""
                  }
                  readOnly
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedDashboard) {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/admin/dashboard/shared/${selectedDashboard.shareToken}`
                      );
                      toast.success("링크가 복사되었습니다.");
                    }
                  }}
                >
                  복사
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              공유 링크를 통해 대시보드를 볼 수 있습니다.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

