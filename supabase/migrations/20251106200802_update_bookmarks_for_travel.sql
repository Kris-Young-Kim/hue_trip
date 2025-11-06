-- =====================================================
-- 마이그레이션: bookmarks 테이블 스키마 업데이트 (여행지 기준)
-- 작성일: 2025-11-06
-- 설명: bookmarks 테이블의 주석 및 설명을 여행지 기준으로 업데이트
--       - content_id 컬럼 설명 변경 (캠핑장 → 여행지)
--       - 테이블 설명 업데이트
-- =====================================================

-- =====================================================
-- bookmarks 테이블 주석 업데이트
-- =====================================================

-- 테이블 설명 업데이트
COMMENT ON TABLE public.bookmarks IS '사용자 북마크 정보 - 여행지 즐겨찾기';

-- 컬럼 설명 업데이트
COMMENT ON COLUMN public.bookmarks.user_id IS 'users 테이블의 사용자 ID';
COMMENT ON COLUMN public.bookmarks.content_id IS '한국관광공사 TourAPI contentid (예: 125266)';

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ bookmarks 테이블 스키마 업데이트 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 변경 사항:';
    RAISE NOTICE '   - 테이블 설명: 캠핑장 → 여행지';
    RAISE NOTICE '   - content_id 설명: 고캠핑 API contentId → 한국관광공사 TourAPI contentid';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 여행지 북마크 추가';
    RAISE NOTICE '   INSERT INTO bookmarks (user_id, content_id)';
    RAISE NOTICE '   VALUES (''user-uuid'', ''125266'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 사용자의 북마크한 여행지 목록 조회';
    RAISE NOTICE '   SELECT * FROM bookmarks WHERE user_id = ''user-uuid'';';
END $$;

