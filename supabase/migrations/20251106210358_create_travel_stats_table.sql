-- =====================================================
-- 마이그레이션: 여행지 통계 테이블 생성
-- 작성일: 2025-11-06
-- 설명: 여행지 통계 및 사용자 활동 추적을 위한 테이블 생성
--       - travel_stats: 여행지별 통계 (조회수, 북마크 수, 공유 수)
--       - user_activity: 사용자 활동 기록 (조회, 북마크, 공유) - 이미 존재하는 경우 업데이트
-- =====================================================

-- =====================================================
-- travel_stats 테이블 (여행지 통계)
-- =====================================================
-- 여행지별 통계 정보를 저장하는 테이블
-- 조회수, 북마크 수 등을 집계하여 관리

CREATE TABLE IF NOT EXISTS public.travel_stats (
    content_id TEXT PRIMARY KEY,  -- TourAPI의 contentid
    view_count INTEGER DEFAULT 0 NOT NULL,
    bookmark_count INTEGER DEFAULT 0 NOT NULL,
    share_count INTEGER DEFAULT 0 NOT NULL,
    last_viewed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.travel_stats OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_travel_stats_view_count ON public.travel_stats(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_travel_stats_bookmark_count ON public.travel_stats(bookmark_count DESC);
CREATE INDEX IF NOT EXISTS idx_travel_stats_updated_at ON public.travel_stats(updated_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.travel_stats DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.travel_stats TO anon;
GRANT ALL ON TABLE public.travel_stats TO authenticated;
GRANT ALL ON TABLE public.travel_stats TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.travel_stats IS '여행지별 통계 정보 (조회수, 북마크 수, 공유 수)';
COMMENT ON COLUMN public.travel_stats.content_id IS 'TourAPI의 contentid';
COMMENT ON COLUMN public.travel_stats.view_count IS '총 조회 수';
COMMENT ON COLUMN public.travel_stats.bookmark_count IS '총 북마크 수';
COMMENT ON COLUMN public.travel_stats.share_count IS '총 공유 수';

-- =====================================================
-- user_activity 테이블 주석 업데이트 (이미 존재하는 경우)
-- =====================================================
-- user_activity 테이블의 주석을 여행지 기준으로 업데이트

COMMENT ON COLUMN public.user_activity.content_id IS 'TourAPI의 contentid';

-- =====================================================
-- 통계 업데이트 함수 (트리거용)
-- =====================================================
-- 북마크 추가/삭제 시 travel_stats.bookmark_count 자동 업데이트

CREATE OR REPLACE FUNCTION update_travel_stats_bookmark()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 북마크 추가 시 bookmark_count 증가
        INSERT INTO public.travel_stats (content_id, bookmark_count, updated_at)
        VALUES (NEW.content_id, 1, now())
        ON CONFLICT (content_id) 
        DO UPDATE SET 
            bookmark_count = travel_stats.bookmark_count + 1,
            updated_at = now();
    ELSIF TG_OP = 'DELETE' THEN
        -- 북마크 삭제 시 bookmark_count 감소
        UPDATE public.travel_stats
        SET bookmark_count = GREATEST(bookmark_count - 1, 0),
            updated_at = now()
        WHERE content_id = OLD.content_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (기존 트리거가 있으면 교체)
DROP TRIGGER IF EXISTS trigger_update_travel_bookmark_stats ON public.bookmarks;
CREATE TRIGGER trigger_update_travel_bookmark_stats
    AFTER INSERT OR DELETE ON public.bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_travel_stats_bookmark();

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 여행지 통계 테이블 마이그레이션 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. travel_stats (여행지 통계)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 인덱스 생성 완료';
    RAISE NOTICE '⚙️ 트리거 생성: bookmark_count 자동 업데이트';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 조회수 증가';
    RAISE NOTICE '   INSERT INTO travel_stats (content_id, view_count)';
    RAISE NOTICE '   VALUES (''125266'', 1)';
    RAISE NOTICE '   ON CONFLICT (content_id) DO UPDATE SET view_count = travel_stats.view_count + 1;';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 사용자 활동 기록';
    RAISE NOTICE '   INSERT INTO user_activity (user_id, content_id, activity_type)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''125266'', ''view'');';
END $$;

