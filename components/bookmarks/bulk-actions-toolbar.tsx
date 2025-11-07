/**
 * @file bulk-actions-toolbar.tsx
 * @description 북마크 일괄 관리 툴바 컴포넌트
 *
 * 선택된 북마크에 대한 일괄 작업을 수행하는 툴바
 *
 * 주요 기능:
 * 1. 선택된 북마크 개수 표시
 * 2. 일괄 삭제
 * 3. 일괄 폴더 이동
 * 4. 일괄 태그 추가/제거
 *
 * @dependencies
 * - actions/bookmarks/batch-delete-bookmarks.ts: batchDeleteBookmarks
 * - actions/bookmarks/batch-update-bookmark-folder.ts: batchUpdateBookmarkFolder
 * - actions/bookmarks/batch-update-bookmark-tags.ts: batchUpdateBookmarkTags
 * - components/ui/button.tsx: Button 컴포넌트
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Folder,
  Tag,
  X,
  MoreVertical,
} from "lucide-react";
import { batchDeleteBookmarks } from "@/actions/bookmarks/batch-delete-bookmarks";
import { batchUpdateBookmarkFolder } from "@/actions/bookmarks/batch-update-bookmark-folder";
import { batchUpdateBookmarkTags } from "@/actions/bookmarks/batch-update-bookmark-tags";
import { getBookmarkFolders } from "@/actions/bookmarks/folders/get-folders";
import { getBookmarkTags } from "@/actions/bookmarks/tags/get-tags";
import { toast } from "sonner";
import type { BookmarkFolder } from "@/actions/bookmarks/folders/get-folders";
import type { BookmarkTag } from "@/actions/bookmarks/tags/get-tags";

interface BulkActionsToolbarProps {
  selectedBookmarkIds: string[];
  onClearSelection: () => void;
  onSuccess?: () => void;
}

export function BulkActionsToolbar({
  selectedBookmarkIds,
  onClearSelection,
  onSuccess,
}: BulkActionsToolbarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [tags, setTags] = useState<BookmarkTag[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagMode, setTagMode] = useState<"add" | "remove" | "replace">("add");

  // 폴더 목록 조회
  const loadFolders = async () => {
    try {
      const data = await getBookmarkFolders("name");
      setFolders(data);
    } catch (error) {
      console.error("[BulkActionsToolbar] 폴더 목록 조회 실패:", error);
    }
  };

  // 태그 목록 조회
  const loadTags = async () => {
    try {
      const data = await getBookmarkTags("name");
      setTags(data);
    } catch (error) {
      console.error("[BulkActionsToolbar] 태그 목록 조회 실패:", error);
    }
  };

  // 일괄 삭제
  const handleBatchDelete = async () => {
    console.group("[BulkActionsToolbar] 일괄 삭제 시작");
    setIsProcessing(true);

    try {
      const result = await batchDeleteBookmarks({
        bookmarkIds: selectedBookmarkIds,
      });

      if (result.success) {
        console.log(
          "[BulkActionsToolbar] 일괄 삭제 완료:",
          result.deletedCount,
          "개"
        );
        toast.success(`${result.deletedCount}개의 북마크가 삭제되었습니다.`);
        setDeleteDialogOpen(false);
        onClearSelection();
        onSuccess?.();
      } else {
        console.error("[BulkActionsToolbar] 일괄 삭제 실패:", result.error);
        toast.error(result.error || "북마크 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("[BulkActionsToolbar] 일괄 삭제 오류:", error);
      toast.error("북마크 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
      console.groupEnd();
    }
  };

  // 일괄 폴더 이동
  const handleBatchFolderMove = async () => {
    console.group("[BulkActionsToolbar] 일괄 폴더 이동 시작");
    setIsProcessing(true);

    try {
      const result = await batchUpdateBookmarkFolder({
        bookmarkIds: selectedBookmarkIds,
        folderId: selectedFolderId,
      });

      if (result.success) {
        console.log(
          "[BulkActionsToolbar] 일괄 폴더 이동 완료:",
          result.updatedCount,
          "개"
        );
        toast.success(
          `${result.updatedCount}개의 북마크가 폴더로 이동되었습니다.`
        );
        setFolderDialogOpen(false);
        setSelectedFolderId(null);
        onClearSelection();
        onSuccess?.();
      } else {
        console.error(
          "[BulkActionsToolbar] 일괄 폴더 이동 실패:",
          result.error
        );
        toast.error(result.error || "폴더 이동에 실패했습니다.");
      }
    } catch (error) {
      console.error("[BulkActionsToolbar] 일괄 폴더 이동 오류:", error);
      toast.error("폴더 이동 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
      console.groupEnd();
    }
  };

  // 일괄 태그 업데이트
  const handleBatchTagUpdate = async () => {
    console.group("[BulkActionsToolbar] 일괄 태그 업데이트 시작");
    setIsProcessing(true);

    try {
      const result = await batchUpdateBookmarkTags({
        bookmarkIds: selectedBookmarkIds,
        tagIds: selectedTagIds,
        mode: tagMode,
      });

      if (result.success) {
        console.log(
          "[BulkActionsToolbar] 일괄 태그 업데이트 완료:",
          result.updatedCount,
          "개"
        );
        const modeText =
          tagMode === "add"
            ? "추가"
            : tagMode === "remove"
            ? "제거"
            : "교체";
        toast.success(
          `${result.updatedCount}개의 북마크에 태그가 ${modeText}되었습니다.`
        );
        setTagDialogOpen(false);
        setSelectedTagIds([]);
        setTagMode("add");
        onClearSelection();
        onSuccess?.();
      } else {
        console.error(
          "[BulkActionsToolbar] 일괄 태그 업데이트 실패:",
          result.error
        );
        toast.error(result.error || "태그 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("[BulkActionsToolbar] 일괄 태그 업데이트 오류:", error);
      toast.error("태그 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
      console.groupEnd();
    }
  };

  const selectedCount = selectedBookmarkIds.length;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedCount}개 선택됨
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                선택 해제
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* 일괄 삭제 */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                삭제
              </Button>

              {/* 일괄 폴더 이동 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadFolders();
                  setFolderDialogOpen(true);
                }}
              >
                <Folder className="w-4 h-4 mr-1" />
                폴더 이동
              </Button>

              {/* 일괄 태그 관리 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadTags();
                  setTagDialogOpen(true);
                }}
              >
                <Tag className="w-4 h-4 mr-1" />
                태그 관리
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 일괄 삭제 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 일괄 삭제</DialogTitle>
            <DialogDescription>
              선택한 {selectedCount}개의 북마크를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 일괄 폴더 이동 다이얼로그 */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 일괄 폴더 이동</DialogTitle>
            <DialogDescription>
              선택한 {selectedCount}개의 북마크를 폴더로 이동합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>폴더 선택</Label>
              <Select
                value={selectedFolderId || ""}
                onValueChange={(value) =>
                  setSelectedFolderId(value || null)
                }
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="폴더 선택 (없음: 폴더에서 제거)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">폴더 없음 (제거)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFolderDialogOpen(false);
                setSelectedFolderId(null);
              }}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              onClick={handleBatchFolderMove}
              disabled={isProcessing}
            >
              {isProcessing ? "이동 중..." : "이동"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 일괄 태그 관리 다이얼로그 */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>북마크 일괄 태그 관리</DialogTitle>
            <DialogDescription>
              선택한 {selectedCount}개의 북마크에 태그를 추가하거나 제거합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>작업 모드</Label>
              <Select
                value={tagMode}
                onValueChange={(value) =>
                  setTagMode(value as "add" | "remove" | "replace")
                }
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">태그 추가 (기존 태그 유지)</SelectItem>
                  <SelectItem value="remove">태그 제거</SelectItem>
                  <SelectItem value="replace">태그 교체 (기존 태그 제거 후 새 태그 추가)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>태그 선택</Label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                {tags.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    태그가 없습니다
                  </div>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTagIds.includes(tag.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTagIds((prev) => [...prev, tag.id]);
                          } else {
                            setSelectedTagIds((prev) =>
                              prev.filter((id) => id !== tag.id)
                            );
                          }
                        }}
                        disabled={isProcessing}
                      />
                      <Label
                        htmlFor={`tag-${tag.id}`}
                        className="flex-1 flex items-center gap-2 cursor-pointer"
                      >
                        <Tag
                          className="w-4 h-4"
                          style={tag.color ? { color: tag.color } : undefined}
                        />
                        <span className="text-sm">{tag.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({tag.bookmarkCount})
                        </span>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTagDialogOpen(false);
                setSelectedTagIds([]);
                setTagMode("add");
              }}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              onClick={handleBatchTagUpdate}
              disabled={isProcessing || selectedTagIds.length === 0}
            >
              {isProcessing ? "처리 중..." : "적용"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

