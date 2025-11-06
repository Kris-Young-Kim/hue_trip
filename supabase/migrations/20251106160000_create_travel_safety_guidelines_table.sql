-- 여행 안전 정보 테이블 생성
-- 한국관광공사 여행 안전 정보, 외교부 해외여행 안전정보를 저장하는 테이블

CREATE TABLE travel_safety_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- 안전 정보 제목
  content TEXT NOT NULL, -- 안전 정보 내용 (마크다운 형식 지원)
  travel_type TEXT CHECK (travel_type IN ('domestic', 'overseas', 'free', 'package', 'all')), -- 여행 유형 (국내여행, 해외여행, 자유여행, 패키지여행, 전체)
  topic TEXT NOT NULL CHECK (topic IN (
    'transportation', -- 교통안전
    'health', -- 건강
    'natural_disaster', -- 자연재해
    'crime_prevention', -- 범죄예방
    'travel_insurance', -- 여행보험
    'emergency_contact', -- 비상연락처
    'food_safety', -- 식품안전
    'accommodation', -- 숙박안전
    'money', -- 금융/환전
    'communication', -- 통신
    'culture', -- 문화/예의
    'general' -- 일반 안전 수칙
  )),
  region TEXT, -- 지역/국가 (예: 'korea', 'japan', 'china', 'usa' 등)
  country_code TEXT, -- 국가 코드 (ISO 3166-1 alpha-2, 해외여행의 경우)
  image_url TEXT, -- 이미지 URL
  video_url TEXT, -- 동영상 URL
  video_type TEXT CHECK (video_type IN ('youtube', 'external', 'internal')), -- 동영상 타입
  source_url TEXT, -- 출처 URL (한국관광공사, 외교부 등)
  source_name TEXT, -- 출처명 (예: '한국관광공사', '외교부')
  view_count INTEGER DEFAULT 0, -- 조회수
  priority INTEGER DEFAULT 0, -- 우선순위 (높을수록 먼저 표시)
  is_active BOOLEAN DEFAULT true, -- 활성화 여부
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_travel_safety_guidelines_travel_type ON travel_safety_guidelines(travel_type) WHERE is_active = true;
CREATE INDEX idx_travel_safety_guidelines_topic ON travel_safety_guidelines(topic) WHERE is_active = true;
CREATE INDEX idx_travel_safety_guidelines_region ON travel_safety_guidelines(region) WHERE is_active = true;
CREATE INDEX idx_travel_safety_guidelines_country_code ON travel_safety_guidelines(country_code) WHERE is_active = true;
CREATE INDEX idx_travel_safety_guidelines_priority ON travel_safety_guidelines(priority DESC) WHERE is_active = true;
CREATE INDEX idx_travel_safety_guidelines_created_at ON travel_safety_guidelines(created_at DESC);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_travel_safety_guidelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_travel_safety_guidelines_updated_at
  BEFORE UPDATE ON travel_safety_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_safety_guidelines_updated_at();

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_travel_safety_guideline_view_count(guideline_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE travel_safety_guidelines
  SET view_count = view_count + 1
  WHERE id = guideline_id AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 코멘트 추가
COMMENT ON TABLE travel_safety_guidelines IS '여행 안전 정보 저장 테이블 (한국관광공사, 외교부 등 참고)';
COMMENT ON COLUMN travel_safety_guidelines.travel_type IS '여행 유형: domestic(국내여행), overseas(해외여행), free(자유여행), package(패키지여행), all(전체)';
COMMENT ON COLUMN travel_safety_guidelines.topic IS '주제 구분: transportation(교통안전), health(건강), natural_disaster(자연재해), crime_prevention(범죄예방), travel_insurance(여행보험), emergency_contact(비상연락처), food_safety(식품안전), accommodation(숙박안전), money(금융/환전), communication(통신), culture(문화/예의), general(일반)';
COMMENT ON COLUMN travel_safety_guidelines.region IS '지역/국가 (예: korea, japan, china, usa 등)';
COMMENT ON COLUMN travel_safety_guidelines.country_code IS '국가 코드 (ISO 3166-1 alpha-2, 해외여행의 경우)';
COMMENT ON COLUMN travel_safety_guidelines.video_type IS '동영상 타입: youtube(YouTube), external(외부 링크), internal(내부 저장)';
COMMENT ON COLUMN travel_safety_guidelines.source_url IS '출처 URL (한국관광공사, 외교부 등)';
COMMENT ON COLUMN travel_safety_guidelines.source_name IS '출처명 (예: 한국관광공사, 외교부)';

