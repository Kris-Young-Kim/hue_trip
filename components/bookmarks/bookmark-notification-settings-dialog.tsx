/**
 * @file bookmark-notification-settings-dialog.tsx
 * @description 북마크 알림 설정 다이얼로그
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getBookmarkNotificationPreferences } from "@/actions/notifications/get-bookmark-notification-preferences";
import { updateBookmarkNotificationPreferences } from "@/actions/notifications/update-bookmark-notification-preferences";
import { toast } from "sonner";

interface BookmarkNotificationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookmarkNotificationSettingsDialog({
  open,
  onOpenChange,
}: BookmarkNotificationSettingsDialogProps) {
  const [notifyTravelUpdate, setNotifyTravelUpdate] = useState(true);
  const [notifyEvent, setNotifyEvent] = useState(true);
  const [notifyWeather, setNotifyWeather] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    const loadPreferences = async () => {
      console.group("[BookmarkNotificationSettingsDialog] 알림 설정 로드 시작");
      setIsLoading(true);
      const result = await getBookmarkNotificationPreferences();
      if (result.success && result.preferences) {
        setNotifyTravelUpdate(result.preferences.notifyTravelUpdate);
        setNotifyEvent(result.preferences.notifyEvent);
        setNotifyWeather(result.preferences.notifyWeather);
      } else if (result.error) {
        console.error("[BookmarkNotificationSettingsDialog] 설정 로드 실패", result.error);
        toast.error(result.error);
      }
      setIsLoading(false);
      console.groupEnd();
    };

    loadPreferences();
  }, [open]);

  const handleSave = () => {
    startTransition(async () => {
      console.group("[BookmarkNotificationSettingsDialog] 알림 설정 저장 시작");
      const result = await updateBookmarkNotificationPreferences({
        notifyTravelUpdate,
        notifyEvent,
        notifyWeather,
      });

      if (!result.success) {
        console.error("[BookmarkNotificationSettingsDialog] 알림 설정 저장 실패", result.error);
        toast.error(result.error || "알림 설정 저장에 실패했습니다.");
        console.groupEnd();
        return;
      }

      toast.success("알림 설정이 저장되었습니다.");
      console.groupEnd();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>알림 설정</DialogTitle>
          <DialogDescription>
            어떤 유형의 알림을 받을지 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="notify-travel-update">여행지 정보 업데이트</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                북마크한 여행지의 새 소식이나 변경 사항을 알려드립니다.
              </p>
            </div>
            <Switch
              id="notify-travel-update"
              checked={notifyTravelUpdate}
              onCheckedChange={setNotifyTravelUpdate}
              disabled={isLoading || isPending}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="notify-event">이벤트 & 프로모션</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                여행지에서 진행 중인 이벤트, 할인 정보를 알려드립니다.
              </p>
            </div>
            <Switch
              id="notify-event"
              checked={notifyEvent}
              onCheckedChange={setNotifyEvent}
              disabled={isLoading || isPending}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="notify-weather">주변 날씨 알림</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                북마크한 여행지 주변의 날씨 변화를 알려드립니다.
              </p>
            </div>
            <Switch
              id="notify-weather"
              checked={notifyWeather}
              onCheckedChange={setNotifyWeather}
              disabled={isLoading || isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isPending}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

