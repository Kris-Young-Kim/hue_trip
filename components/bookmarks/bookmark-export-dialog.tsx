/**
 * @file bookmark-export-dialog.tsx
 * @description 북마크 내보내기 다이얼로그 컴포넌트
 */

"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { exportBookmarks, type BookmarkExportFormat } from "@/actions/bookmarks/export-bookmarks";
import { toast } from "sonner";
import { Download } from "lucide-react";

interface BookmarkExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string | null;
}

export function BookmarkExportDialog({
  open,
  onOpenChange,
  folderId,
}: BookmarkExportDialogProps) {
  const [format, setFormat] = useState<BookmarkExportFormat>("json");
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      console.group("[BookmarkExportDialog] 북마크 내보내기 요청");
      const result = await exportBookmarks({ format, folderId });

      if (!result.success || !result.content || !result.filename) {
        console.error("[BookmarkExportDialog] 내보내기 실패", result.error);
        toast.error(result.error || "북마크 내보내기에 실패했습니다.");
        console.groupEnd();
        return;
      }

      try {
        const blob = new Blob([result.content], {
          type: format === "json" ? "application/json" : "text/csv",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("북마크를 내보냈습니다.");
      } catch (error) {
        console.error("[BookmarkExportDialog] 파일 다운로드 오류", error);
        toast.error("파일 다운로드 중 오류가 발생했습니다.");
      } finally {
        console.groupEnd();
      }

      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>북마크 내보내기</DialogTitle>
          <DialogDescription>
            선택한 형식으로 북마크를 다운로드합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>파일 형식</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as BookmarkExportFormat)}>
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <RadioGroupItem value="json" id="export-json" />
                <Label htmlFor="export-json" className="flex-1">
                  JSON (권장)
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    구조화된 데이터를 그대로 저장합니다.
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <RadioGroupItem value="csv" id="export-csv" />
                <Label htmlFor="export-csv" className="flex-1">
                  CSV (엑셀 호환)
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    스프레드시트에서 열 수 있게 쉼표로 구분합니다.
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleExport} disabled={isPending}>
            <Download className="w-4 h-4 mr-2" />
            {isPending ? "내보내는 중..." : "내보내기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

