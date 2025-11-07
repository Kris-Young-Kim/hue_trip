-- =====================================================
-- 마이그레이션: 여행지 테이블 생성
-- 작성일: 2025-01-07
-- 설명: 여행지 정보를 저장하는 테이블 생성
--       TourAPI 데이터 구조를 기반으로 설계
-- =====================================================

CREATE TABLE IF NOT EXISTS public.travels (
    contentid TEXT PRIMARY KEY,  -- TourAPI의 contentid
    contenttypeid TEXT NOT NULL,  -- 콘텐츠 타입ID (12:관광지, 14:문화시설, 15:축제, 32:숙박, 38:쇼핑, 39:음식점)
    title TEXT NOT NULL,  -- 여행지명
    addr1 TEXT,  -- 주소
    addr2 TEXT,  -- 상세주소
    mapx TEXT,  -- 경도 (WGS84 좌표계)
    mapy TEXT,  -- 위도 (WGS84 좌표계)
    firstimage TEXT,  -- 대표이미지 URL
    firstimage2 TEXT,  -- 대표이미지 썸네일 URL
    tel TEXT,  -- 전화번호
    homepage TEXT,  -- 홈페이지 URL
    cat1 TEXT,  -- 대분류
    cat2 TEXT,  -- 중분류
    cat3 TEXT,  -- 소분류
    areacode TEXT,  -- 지역코드
    sigungucode TEXT,  -- 시군구코드
    zipcode TEXT,  -- 우편번호
    overview TEXT,  -- 개요
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.travels OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_travels_contenttypeid ON public.travels(contenttypeid);
CREATE INDEX IF NOT EXISTS idx_travels_areacode ON public.travels(areacode);
CREATE INDEX IF NOT EXISTS idx_travels_title ON public.travels(title);
CREATE INDEX IF NOT EXISTS idx_travels_created_at ON public.travels(created_at DESC);

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.travels DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.travels TO anon;
GRANT ALL ON TABLE public.travels TO authenticated;
GRANT ALL ON TABLE public.travels TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.travels IS '여행지 정보 (TourAPI 데이터 구조 기반)';
COMMENT ON COLUMN public.travels.contentid IS 'TourAPI의 contentid (Primary Key)';
COMMENT ON COLUMN public.travels.contenttypeid IS '콘텐츠 타입ID (12:관광지, 14:문화시설, 15:축제, 32:숙박, 38:쇼핑, 39:음식점)';
COMMENT ON COLUMN public.travels.mapx IS '경도 (WGS84 좌표계)';
COMMENT ON COLUMN public.travels.mapy IS '위도 (WGS84 좌표계)';

