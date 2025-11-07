-- =====================================================
-- 마이그레이션: 반려동물 동반 여행 기능 추가
-- 작성일: 2025-01-08
-- 설명: travels 테이블에 반려동물 동반 여행 관련 필드 추가
--       반려동물 동반 가능 여행지 정보를 저장할 수 있도록 확장
-- =====================================================

-- =====================================================
-- travels 테이블에 반려동물 관련 필드 추가
-- =====================================================

-- 반려동물 동반 가능 여부 (기본값: false)
ALTER TABLE public.travels 
ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false NOT NULL;

-- 반려동물 동반 가능 여부 업데이트 날짜
ALTER TABLE public.travels 
ADD COLUMN IF NOT EXISTS pet_friendly_updated_at TIMESTAMPTZ;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_travels_pet_friendly ON public.travels(pet_friendly) WHERE pet_friendly = true;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.travels.pet_friendly IS '반려동물 동반 가능 여부 (true: 가능, false: 불가능 또는 미확인)';
COMMENT ON COLUMN public.travels.pet_friendly_updated_at IS '반려동물 동반 가능 여부 마지막 업데이트 날짜';

-- =====================================================
-- pet_friendly_info 테이블 생성 (상세 정보)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pet_friendly_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    travel_contentid TEXT NOT NULL REFERENCES public.travels(contentid) ON DELETE CASCADE,
    
    -- 반려동물 규정 및 정보
    pet_types_allowed TEXT[], -- 허용되는 반려동물 종류 (예: ['dog', 'cat'])
    pet_size_limit TEXT, -- 반려동물 크기 제한 (예: 'small', 'medium', 'large', 'all')
    pet_count_limit INTEGER, -- 반려동물 마리 수 제한
    requires_leash BOOLEAN, -- 목줄 필수 여부
    requires_muzzle BOOLEAN, -- 입마개 필수 여부
    
    -- 시설 정보
    has_pet_area BOOLEAN, -- 반려동물 전용 공간 여부
    has_pet_restroom BOOLEAN, -- 반려동물 화장실 여부
    has_pet_shower BOOLEAN, -- 반려동물 샤워 시설 여부
    has_pet_cafe BOOLEAN, -- 반려동물 카페 여부
    has_pet_hotel BOOLEAN, -- 반려동물 호텔/펜션 여부
    
    -- 추가 정보
    pet_fee DECIMAL(10, 2), -- 반려동물 추가 요금
    pet_fee_description TEXT, -- 반려동물 요금 설명
    restrictions TEXT, -- 제한사항 및 주의사항
    notes TEXT, -- 기타 참고사항
    
    -- 메타데이터
    verified BOOLEAN DEFAULT false, -- 검증 여부 (관리자 또는 사용자 검증)
    verified_at TIMESTAMPTZ, -- 검증 날짜
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 검증한 사용자
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- 하나의 여행지당 하나의 정보만 허용
    UNIQUE(travel_contentid)
);

-- 테이블 소유자 설정
ALTER TABLE public.pet_friendly_info OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_pet_friendly_info_travel_contentid ON public.pet_friendly_info(travel_contentid);
CREATE INDEX IF NOT EXISTS idx_pet_friendly_info_verified ON public.pet_friendly_info(verified) WHERE verified = true;

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.pet_friendly_info DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.pet_friendly_info TO anon;
GRANT ALL ON TABLE public.pet_friendly_info TO authenticated;
GRANT ALL ON TABLE public.pet_friendly_info TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.pet_friendly_info IS '반려동물 동반 여행지 상세 정보';
COMMENT ON COLUMN public.pet_friendly_info.travel_contentid IS 'travels 테이블의 contentid (Foreign Key)';
COMMENT ON COLUMN public.pet_friendly_info.pet_types_allowed IS '허용되는 반려동물 종류 배열 (예: [''dog'', ''cat''])';
COMMENT ON COLUMN public.pet_friendly_info.pet_size_limit IS '반려동물 크기 제한 (small, medium, large, all)';
COMMENT ON COLUMN public.pet_friendly_info.verified IS '정보 검증 여부 (관리자 또는 사용자 검증)';

-- =====================================================
-- updated_at 자동 업데이트 트리거 함수
-- =====================================================

CREATE OR REPLACE FUNCTION update_pet_friendly_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_pet_friendly_info_updated_at ON public.pet_friendly_info;
CREATE TRIGGER trigger_update_pet_friendly_info_updated_at
    BEFORE UPDATE ON public.pet_friendly_info
    FOR EACH ROW
    EXECUTE FUNCTION update_pet_friendly_info_updated_at();

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 반려동물 동반 여행 기능 추가 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 변경 사항:';
    RAISE NOTICE '   1. travels 테이블에 pet_friendly, pet_friendly_updated_at 컬럼 추가';
    RAISE NOTICE '   2. pet_friendly_info 테이블 생성 (상세 정보)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 인덱스: travels(pet_friendly), pet_friendly_info(travel_contentid, verified)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 사용 예시:';
    RAISE NOTICE '   -- 반려동물 동반 가능 여행지로 표시';
    RAISE NOTICE '   UPDATE travels SET pet_friendly = true, pet_friendly_updated_at = now()';
    RAISE NOTICE '   WHERE contentid = ''125266'';';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 반려동물 동반 여행지 상세 정보 추가';
    RAISE NOTICE '   INSERT INTO pet_friendly_info (travel_contentid, pet_types_allowed, requires_leash)';
    RAISE NOTICE '   VALUES (''125266'', ARRAY[''dog'', ''cat''], true);';
    RAISE NOTICE '';
    RAISE NOTICE '   -- 반려동물 동반 가능 여행지 조회';
    RAISE NOTICE '   SELECT * FROM travels WHERE pet_friendly = true;';
END $$;

