-- =====================================================
-- 마이그레이션: 북마크 공유 링크(bookmark_share_links) 테이블 추가
-- 작성일: 2025-01-08
-- 설명: 북마크 목록 및 폴더를 공유하기 위한 공유 링크 관리 테이블
-- =====================================================

-- =====================================================
-- bookmark_share_links 테이블: 북마크 공유 링크 정보 저장
-- =====================================================

CREATE TABLE public.bookmark_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.bookmark_folders(id) ON DELETE CASCADE, -- NULL이면 전체 북마크 공유
    scope TEXT NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'folder')), -- 'all': 전체 북마크, 'folder': 폴더별 공유
    share_token TEXT NOT NULL UNIQUE, -- 공유 링크를 위한 고유 토큰
    is_public BOOLEAN DEFAULT TRUE NOT NULL, -- 공개 여부 (true: 공개, false: 비공개)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    -- 사용자당 전체 북마크 공유 링크는 하나만 허용
    UNIQUE(user_id, scope, folder_id) WHERE scope = 'all' AND folder_id IS NULL,
    -- 사용자당 폴더별 공유 링크는 폴더당 하나만 허용
    UNIQUE(user_id, folder_id) WHERE scope = 'folder' AND folder_id IS NOT NULL
);

COMMENT ON TABLE public.bookmark_share_links IS '북마크 공유 링크 정보를 저장하는 테이블';
COMMENT ON COLUMN public.bookmark_share_links.id IS '공유 링크의 고유 ID';
COMMENT ON COLUMN public.bookmark_share_links.user_id IS '공유 링크를 생성한 사용자 ID (users 테이블 참조)';
COMMENT ON COLUMN public.bookmark_share_links.folder_id IS '공유할 폴더 ID (NULL이면 전체 북마크 공유)';
COMMENT ON COLUMN public.bookmark_share_links.scope IS '공유 범위 (all: 전체 북마크, folder: 폴더별 공유)';
COMMENT ON COLUMN public.bookmark_share_links.share_token IS '공유 링크를 위한 고유 토큰 (URL에 사용)';
COMMENT ON COLUMN public.bookmark_share_links.is_public IS '공개 여부 (true: 공개, false: 비공개)';
COMMENT ON COLUMN public.bookmark_share_links.created_at IS '공유 링크 생성일시';
COMMENT ON COLUMN public.bookmark_share_links.updated_at IS '공유 링크 마지막 업데이트 일시';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER set_bookmark_share_links_updated_at
BEFORE UPDATE ON public.bookmark_share_links
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- share_token 자동 생성 트리거 함수
CREATE OR REPLACE FUNCTION generate_bookmark_share_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.share_token IS NULL OR NEW.share_token = '' THEN
        NEW.share_token = encode(gen_random_bytes(16), 'hex'); -- 32자 길이의 16진수 문자열
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- share_token 트리거
CREATE TRIGGER trigger_generate_bookmark_share_token
BEFORE INSERT ON public.bookmark_share_links
FOR EACH ROW
EXECUTE FUNCTION generate_bookmark_share_token();

-- 인덱스 생성
CREATE INDEX idx_bookmark_share_links_user_id ON public.bookmark_share_links(user_id);
CREATE INDEX idx_bookmark_share_links_folder_id ON public.bookmark_share_links(folder_id);
CREATE INDEX idx_bookmark_share_links_share_token ON public.bookmark_share_links(share_token);
CREATE INDEX idx_bookmark_share_links_is_public ON public.bookmark_share_links(is_public);

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ bookmark_share_links 테이블 추가 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 변경 사항:';
    RAISE NOTICE '   1. bookmark_share_links 테이블 생성';
    RAISE NOTICE '   2. share_token 자동 생성 트리거 추가';
    RAISE NOTICE '   3. updated_at 자동 업데이트 트리거 추가';
    RAISE NOTICE '   4. 인덱스 생성 (user_id, folder_id, share_token, is_public)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 전체 북마크 공유 링크 생성';
    RAISE NOTICE '   INSERT INTO bookmark_share_links (user_id, scope) VALUES (''<user_uuid>'', ''all'');';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 폴더별 공유 링크 생성';
    RAISE NOTICE '   INSERT INTO bookmark_share_links (user_id, folder_id, scope) VALUES (''<user_uuid>'', ''<folder_uuid>'', ''folder'');';
END $$;

