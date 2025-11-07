/**
 * @file bookmark-import-dialog.tsx
 * @description 북마크 가져오기 다이얼로그 컴포넌트
 */

"use client";

import { useRef, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { importBookmarks } from "@/actions/bookmarks/import-bookmarks";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface BookmarkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (result: { imported: number; skipped: number }) => void;
}

export function BookmarkImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: BookmarkImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [isPending, startTransition] = useTransition();
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFileName(file ? file.name : "");
  };

  const handleImport = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("가져올 파일을 선택해주세요.");
      return;
    }

    startTransition(async () => {
      console.group("[BookmarkImportDialog] 북마크 가져오기 요청");
      const formData = new FormData();
      formData.set("file", file);
      formData.set("format", format);

      const result = await importBookmarks(formData);

      if (!result.success) {
        console.error("[BookmarkImportDialog] 가져오기 실패", result.error);
        toast.error(result.error || "북마크 가져오기에 실패했습니다.");
        console.groupEnd();
        return;
      }

      toast.success(
        `북마크 ${result.importedCount ?? 0}개를 가져왔습니다. (건너뛴 항목 ${
          result.skippedCount ?? 0
        }개)`
      );

      onSuccess?.({
        imported: result.importedCount ?? 0,
        skipped: result.skippedCount ?? 0,
      });

      if (result.errors && result.errors.length > 0) {
        console.warn("[BookmarkImportDialog] 일부 항목 건너뜀", result.errors);
      }

      setSelectedFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      console.groupEnd();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>북마크 가져오기</DialogTitle>
          <DialogDescription>
            내보낸 북마크 파일(JSON 또는 CSV)을 업로드하여 다시 가져옵니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>파일 형식</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as "json" | "csv") }>
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <RadioGroupItem value="json" id="import-json" />
                <Label htmlFor="import-json" className="flex-1">
                  JSON
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    내보내기 기능으로 생성한 JSON 파일을 선택하세요.
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <RadioGroupItem value="csv" id="import-csv" />
                <Label htmlFor="import-csv" className="flex-1">
                  CSV
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    스프레드시트에서 편집한 CSV 파일을 선택하세요.
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookmark-import-file">가져올 파일</Label>
            <Input
              ref={fileInputRef}
              id="bookmark-import-file"
              type="file"
              accept={format === "json" ? "application/json" : ".csv,text/csv"}
              onChange={handleFileChange}
              disabled={isPending}
            />
            {selectedFileName && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                선택한 파일: {selectedFileName}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleImport} disabled={isPending}>
            <Upload className="w-4 h-4 mr-2" />
            {isPending ? "가져오는 중..." : "가져오기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

