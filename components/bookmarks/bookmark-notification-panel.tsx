/**
 * @file bookmark-notification-panel.tsx
 * @description 북마크 알림 패널 컴포넌트
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Calendar, CloudRain, RefreshCw } from "lucide-react";
import { getBookmarkNotifications, type BookmarkNotification } from "@/actions/notifications/get-bookmark-notifications";
import { markBookmarkNotificationRead } from "@/actions/notifications/mark-bookmark-notification-read";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

interface BookmarkNotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationsLoaded?: (notifications: BookmarkNotification[]) => void;
  onNotificationRead?: (notificationId: string) => void;
}

function getNotificationBadge(type: BookmarkNotification["notificationType"]) {
  switch (type) {
    case "travel_update":
      return <Badge className="bg-blue-600">여행지 업데이트</Badge>;
    case "event":
      return <Badge className="bg-purple-600">이벤트</Badge>;
    case "weather":
      return <Badge className="bg-emerald-600">날씨</Badge>;
    default:
      return <Badge>알림</Badge>;
  }
}

function getNotificationIcon(type: BookmarkNotification["notificationType"]) {
  switch (type) {
    case "travel_update":
      return <RefreshCw className="w-4 h-4 text-blue-500" />;
    case "event":
      return <Calendar className="w-4 h-4 text-purple-500" />;
    case "weather":
      return <CloudRain className="w-4 h-4 text-emerald-500" />;
    default:
      return <Bookmark className="w-4 h-4 text-gray-500" />;
  }
}

export function BookmarkNotificationPanel({
  open,
  onOpenChange,
  onNotificationsLoaded,
  onNotificationRead,
}: BookmarkNotificationPanelProps) {
  const [notifications, setNotifications] = useState<BookmarkNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    const loadNotifications = async () => {
      console.group("[BookmarkNotificationPanel] 알림 로드 시작");
      setIsLoading(true);
      const result = await getBookmarkNotifications();
      if (result.success && result.notifications) {
        console.log("[BookmarkNotificationPanel] 알림 개수:", result.notifications.length);
        setNotifications(result.notifications);
        onNotificationsLoaded?.(result.notifications);
      } else {
        console.error("[BookmarkNotificationPanel] 알림 로드 실패", result.error);
        toast.error(result.error || "알림을 불러오는데 실패했습니다.");
      }
      setIsLoading(false);
      console.groupEnd();
    };

    loadNotifications();
  }, [open]);

  const handleMarkAsRead = (notificationId: string) => {
    startTransition(async () => {
      console.group("[BookmarkNotificationPanel] 알림 읽음 처리 요청");
      const result = await markBookmarkNotificationRead(notificationId);
      if (!result.success) {
        console.error("[BookmarkNotificationPanel] 알림 읽음 처리 실패", result.error);
        toast.error(result.error || "알림 읽음 처리에 실패했습니다.");
        console.groupEnd();
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      onNotificationRead?.(notificationId);
      console.groupEnd();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>알림 센터</DialogTitle>
          <DialogDescription>
            북마크한 여행지와 관련된 최신 소식을 확인하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
          {isLoading ? (
            <p className="text-sm text-gray-500">알림을 불러오는 중입니다...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              아직 받은 알림이 없습니다.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition ${
                  notification.isRead ? "bg-gray-50 dark:bg-gray-900/30" : "bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getNotificationIcon(notification.notificationType)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getNotificationBadge(notification.notificationType)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(notification.createdAt), "PPP HH:mm", { locale: ko })}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={isPending}
                        className="px-2 text-blue-600 hover:text-blue-700"
                      >
                        읽음으로 표시
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

