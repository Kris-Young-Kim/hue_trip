/**
 * @file bookmark-share-dialog.tsx
 * @description 북마크 공유 다이얼로그 컴포넌트
 *
 * 북마크 목록 또는 폴더를 공유하기 위한 다이얼로그
 *
 * 주요 기능:
 * 1. 공유 링크 생성/업데이트
 * 2. 공유 링크 복사
 * 3. 공개/비공개 전환
 * 4. 공유 링크 재생성
 *
 * @dependencies
 * - actions/bookmarks/share/create-share-link.ts: createOrUpdateShareLink
 * - actions/bookmarks/share/get-share-link.ts: getShareLink
 * - actions/bookmarks/share/toggle-share-link-visibility.ts: toggleShareLinkVisibility
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Share2,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Lock,
} from "lucide-react";
import { createOrUpdateShareLink } from "@/actions/bookmarks/share/create-share-link";
import { getShareLink } from "@/actions/bookmarks/share/get-share-link";
import { toggleShareLinkVisibility } from "@/actions/bookmarks/share/toggle-share-link-visibility";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookmarkShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string | null;
  scope?: "all" | "folder";
  folderName?: string;
}

export function BookmarkShareDialog({
  open,
  onOpenChange,
  folderId = null,
  scope = "all",
  folderName,
}: BookmarkShareDialogProps) {
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<{
    id: string;
    shareToken: string;
    isPublic: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // 공유 링크 조회
  useEffect(() => {
    if (open) {
      loadShareLink();
    } else {
      setShareLink(null);
      setCopied(false);
    }
  }, [open, folderId, scope]);

  const loadShareLink = async () => {
    setLoading(true);
    try {
      const link = await getShareLink(folderId, scope);
      if (link) {
        setShareLink({
          id: link.id,
          shareToken: link.shareToken,
          isPublic: link.isPublic,
        });
        updateShareUrl(link.shareToken);
      }
    } catch (error) {
      console.error("[BookmarkShareDialog] 공유 링크 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateShareUrl = (token: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    setShareUrl(`${baseUrl}/bookmarks/share/${token}`);
  };

  // 공유 링크 생성/업데이트
  const handleCreateOrUpdateLink = async () => {
    console.group("[BookmarkShareDialog] 공유 링크 생성/업데이트 시작");
    setLoading(true);

    try {
      const result = await createOrUpdateShareLink({
        folderId,
        scope,
      });

      if (result.success && result.shareLink) {
        console.log("[BookmarkShareDialog] 공유 링크 생성/업데이트 완료");
        setShareLink({
          id: result.shareLink.id,
          shareToken: result.shareLink.shareToken,
          isPublic: result.shareLink.isPublic,
        });
        updateShareUrl(result.shareLink.shareToken);
        toast.success("공유 링크가 생성되었습니다.");
      } else {
        console.error(
          "[BookmarkShareDialog] 공유 링크 생성/업데이트 실패:",
          result.error
        );
        toast.error(result.error || "공유 링크 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("[BookmarkShareDialog] 공유 링크 생성/업데이트 오류:", error);
      toast.error("공유 링크 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  // 공유 링크 복사
  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("공유 링크가 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("[BookmarkShareDialog] 링크 복사 실패:", error);
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  // 공개/비공개 전환
  const handleToggleVisibility = async (isPublic: boolean) => {
    if (!shareLink) return;

    console.group("[BookmarkShareDialog] 공개/비공개 전환 시작");
    setLoading(true);

    try {
      const result = await toggleShareLinkVisibility({
        shareLinkId: shareLink.id,
        isPublic,
      });

      if (result.success) {
        console.log("[BookmarkShareDialog] 공개/비공개 전환 완료");
        setShareLink((prev) => (prev ? { ...prev, isPublic } : null));
        toast.success(
          isPublic ? "공유 링크가 공개되었습니다." : "공유 링크가 비공개되었습니다."
        );
      } else {
        console.error(
          "[BookmarkShareDialog] 공개/비공개 전환 실패:",
          result.error
        );
        toast.error(result.error || "공개/비공개 전환에 실패했습니다.");
      }
    } catch (error) {
      console.error("[BookmarkShareDialog] 공개/비공개 전환 오류:", error);
      toast.error("공개/비공개 전환 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  // 공유 링크 재생성
  const handleRegenerateLink = async () => {
    await handleCreateOrUpdateLink();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {scope === "folder" && folderName
              ? `"${folderName}" 폴더 공유`
              : "북마크 목록 공유"}
          </DialogTitle>
          <DialogDescription>
            {scope === "folder" && folderName
              ? `"${folderName}" 폴더의 북마크를 공유합니다.`
              : "전체 북마크 목록을 공유합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareLink ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                공유 링크를 생성하여 북마크를 공유할 수 있습니다.
              </p>
              <Button
                onClick={handleCreateOrUpdateLink}
                disabled={loading}
                className="w-full"
              >
                {loading ? "생성 중..." : "공유 링크 생성"}
              </Button>
            </div>
          ) : (
            <>
              {/* 공유 링크 URL */}
              <div className="space-y-2">
                <Label>공유 링크</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    disabled={loading}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 공개/비공개 전환 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {shareLink.isPublic ? (
                    <Globe className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Label className="text-sm font-medium">
                      {shareLink.isPublic ? "공개" : "비공개"}
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {shareLink.isPublic
                        ? "누구나 이 링크로 접근할 수 있습니다."
                        : "이 링크는 비공개입니다."}
                    </p>
                  </div>
                </div>
                <Checkbox
                  checked={shareLink.isPublic}
                  onCheckedChange={handleToggleVisibility}
                  disabled={loading}
                />
              </div>

              {/* 공유 링크 재생성 */}
              <Button
                variant="outline"
                onClick={handleRegenerateLink}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4 mr-2",
                    loading && "animate-spin"
                  )}
                />
                링크 재생성
              </Button>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

