-- =====================================================
-- 마이그레이션: 북마크 알림 및 알림 설정 테이블 추가
-- 작성일: 2025-01-08
-- 설명: 북마크 관련 알림 관리 기능 구현을 위한 테이블 생성
-- =====================================================

-- 북마크 알림 테이블
CREATE TABLE public.bookmark_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bookmark_id UUID REFERENCES public.bookmarks(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'travel_update',
        'event',
        'weather'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.bookmark_notifications IS '북마크와 관련된 알림 정보를 저장하는 테이블';
COMMENT ON COLUMN public.bookmark_notifications.notification_type IS '알림 유형 (여행지 정보 업데이트, 이벤트/프로모션, 주변 날씨)';
COMMENT ON COLUMN public.bookmark_notifications.metadata IS '추가 데이터(여행지 ID, 이벤트 정보 등)를 JSON으로 저장';

CREATE INDEX idx_bookmark_notifications_user_created
    ON public.bookmark_notifications (user_id, created_at DESC);

CREATE INDEX idx_bookmark_notifications_unread
    ON public.bookmark_notifications (user_id)
    WHERE is_read = FALSE;

-- 북마크 알림 설정 테이블
CREATE TABLE public.bookmark_notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    notify_travel_update BOOLEAN DEFAULT TRUE NOT NULL,
    notify_event BOOLEAN DEFAULT TRUE NOT NULL,
    notify_weather BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.bookmark_notification_preferences IS '사용자별 북마크 알림 수신 설정';

CREATE TRIGGER set_bookmark_notification_preferences_updated_at
BEFORE UPDATE ON public.bookmark_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 기본 설정 자동 삽입을 위한 함수 및 트리거
CREATE OR REPLACE FUNCTION public.ensure_bookmark_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.bookmark_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_bookmark_notification_preferences ON public.users;

CREATE TRIGGER trigger_ensure_bookmark_notification_preferences
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_bookmark_notification_preferences();

DO $$
BEGIN
    RAISE NOTICE '✅ bookmark_notifications 및 bookmark_notification_preferences 테이블 생성 완료';
END $$;

