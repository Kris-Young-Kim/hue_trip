# 여행 안전 정보 제공 기능 구현 계획

## 개요

한국관광공사 여행 안전 정보, 외교부 해외여행 안전정보를 활용하여 사용자에게 안전한 여행 정보를 제공하는 기능입니다.

**참고 자료**:
- [한국관광공사 여행 안전 정보](https://www.visitkorea.or.kr/)
- [외교부 해외여행 안전정보](https://www.0404.go.kr/)

## 목표

- 사용자에게 안전한 여행 정보 제공
- 여행 유형별/주제별 안전 정보 분류 및 검색
- 여행지 상세페이지와 연동하여 관련 안전 정보 추천
- 안전 교육 동영상 통합

## 데이터 구조 설계

### 여행 안전 정보 테이블 스키마

```sql
CREATE TABLE travel_safety_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- 안전 정보 제목
  content TEXT NOT NULL, -- 안전 정보 내용 (마크다운 형식 지원)
  travel_type TEXT CHECK (travel_type IN ('domestic', 'overseas', 'free', 'package', 'all')), -- 여행 유형
  topic TEXT NOT NULL, -- 주제 (transportation, health, natural_disaster, crime_prevention, etc.)
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
```

### 여행 유형별 분류

- `domestic`: 국내여행
- `overseas`: 해외여행
- `free`: 자유여행
- `package`: 패키지여행
- `all`: 전체

### 주제별 분류

- `transportation`: 교통안전
- `health`: 건강
- `natural_disaster`: 자연재해
- `crime_prevention`: 범죄예방
- `travel_insurance`: 여행보험
- `emergency_contact`: 비상연락처
- `food_safety`: 식품안전
- `accommodation`: 숙박안전
- `money`: 금융/환전
- `communication`: 통신
- `culture`: 문화/예의
- `general`: 일반 안전 수칙

## UI/UX 설계

### 1. 여행 안전 정보 메인 페이지 (`/safety`)

**레이아웃**:
- 헤더: "여행 안전 정보" 제목
- 필터 탭:
  - 여행 유형별 탭: 전체, 국내여행, 해외여행, 자유여행, 패키지여행
  - 주제별 탭: 전체, 교통안전, 건강, 자연재해, 범죄예방 등
- 여행 안전 정보 카드 그리드:
  - 제목, 썸네일 이미지, 여행 유형/주제 태그, 지역 태그
  - 클릭 시 상세 페이지로 이동
- 동영상 섹션:
  - 동영상 카드 표시
  - YouTube 임베드 또는 링크

### 2. 여행 안전 정보 상세 페이지 (`/safety/[id]`)

**내용**:
- 제목
- 본문 내용 (마크다운 형식 지원)
- 이미지 갤러리
- 동영상 (있는 경우)
- 관련 여행 안전 정보 추천
- 출처 링크

### 3. 여행지 상세페이지 통합

**위치**: 상세페이지 우측 사이드바

**기능**:
- 여행지 지역 기반 안전 정보 추천
- 여행 유형 기반 안전 정보 추천
- "여행 안전 정보 보기" 링크

## 구현 단계

### 1단계: 데이터베이스 및 API 구축 ✅

1. ✅ 여행 안전 정보 테이블 마이그레이션 파일 생성 (`supabase/migrations/20251106160000_create_travel_safety_guidelines_table.sql`)
2. ✅ 여행 안전 정보 API 함수 생성 (`lib/api/safety-guidelines.ts`)
   - `getTravelSafetyGuidelines()`: 전체 조회
   - `getTravelSafetyGuidelinesByType()`: 여행 유형별 조회
   - `getTravelSafetyGuidelinesByTopic()`: 주제별 조회
   - `getTravelSafetyGuidelinesByRegion()`: 지역/국가별 조회
   - `getTravelSafetyGuidelineById()`: 상세 조회
   - `searchTravelSafetyGuidelines()`: 검색
   - `getRecommendedTravelSafetyGuidelines()`: 추천 조회
3. ✅ API 라우트 생성 (`app/api/safety-guidelines/route.ts`)

### 2단계: UI 컴포넌트 개발 ✅

1. ✅ 여행 안전 정보 카드 컴포넌트 (`components/safety/safety-card.tsx`) - 업데이트 완료
2. ✅ 여행 안전 정보 목록 컴포넌트 (`components/safety/safety-guidelines.tsx`) - 업데이트 완료
3. ✅ 여행 안전 정보 상세 페이지 (`app/safety/[id]/page.tsx`) - 업데이트 완료
4. ✅ 동영상 컴포넌트 (`components/safety/safety-video.tsx`) - 기존 유지
5. ✅ 여행 안전 정보 추천 컴포넌트 (`components/travel-detail/safety-recommendations.tsx`) - 생성 완료

### 3단계: 페이지 개발 ✅

1. ✅ 여행 안전 정보 메인 페이지 (`app/safety/page.tsx`) - 업데이트 완료
2. ✅ 여행 안전 정보 상세 페이지 (`app/safety/[id]/page.tsx`) - 업데이트 완료

### 4단계: 통합 ✅

1. ✅ 여행지 상세페이지에 여행 안전 정보 추천 컴포넌트 추가 (`app/travels/[contentId]/page.tsx`)
2. ✅ 관련 여행 안전 정보 추천 로직 구현
3. ⏳ 네비게이션 메뉴에 여행 안전 정보 링크 추가 (선택 사항)

## 데이터 수집 계획

**한국관광공사, 외교부에서 수집할 정보**:
- 제목
- 본문 내용
- 이미지 URL
- 동영상 URL (있는 경우)
- 여행 유형 정보
- 주제 정보
- 지역/국가 정보
- 출처 URL 및 출처명

**수집 방법**:
1. 수동 데이터 입력 (초기)
2. 크롤링 스크립트 (자동화, 선택 사항)
3. 관리자 대시보드에서 직접 입력 (향후)

## 우선순위

**High**: ✅ 완료
- 여행 안전 정보 테이블 및 API 구축
- 기본 여행 안전 정보 페이지 생성
- 여행지 상세페이지 통합

**Medium**:
- 동영상 통합 (기존 컴포넌트 활용)
- 검색 기능 (기본 구현 완료)
- 네비게이션 메뉴 통합

**Low**:
- 자동 데이터 수집 스크립트
- 관리자 대시보드

## 참고사항

- 한국관광공사, 외교부의 저작권 고려 (출처 명시)
- 사용자에게 실제 현장 상황과 다를 수 있음을 안내
- 정기적으로 정보 업데이트 필요
- 해외여행의 경우 외교부 해외여행 안전정보를 반드시 확인하도록 안내

## 완료된 작업

- ✅ 여행 안전 정보 테이블 마이그레이션 생성
- ✅ 여행 안전 정보 API 함수 생성 및 업데이트
- ✅ API 라우트 생성 및 업데이트
- ✅ 여행 안전 정보 컴포넌트 업데이트 (카드, 목록, 상세)
- ✅ 여행 안전 정보 페이지 업데이트 (메인, 상세)
- ✅ 여행지 상세페이지에 안전 정보 추천 컴포넌트 통합
- ✅ 여행 안전 정보 문서 작성

