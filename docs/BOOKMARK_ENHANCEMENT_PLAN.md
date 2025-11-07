# 북마크 기능 고도화 구현 계획서

## 목적

기본적인 북마크 추가/제거 기능을 넘어서 사용자가 여행지를 더 체계적으로 관리하고 활용할 수 있도록 고도화된 북마크 기능을 구현합니다.

---

## 현재 상태 분석

### 기존 기능
- ✅ 북마크 추가/제거 (인증 사용자: Supabase, 비인증: localStorage)
- ✅ 북마크 상태 표시 (별 아이콘)
- ✅ 북마크 통계 추적 (travel_stats 테이블)

### 현재 데이터베이스 스키마
```sql
-- bookmarks 테이블 (현재)
CREATE TABLE public.bookmarks (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    content_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, content_id)
);
```

### 제약사항
- 북마크를 단순 목록으로만 관리
- 폴더/카테고리 분류 불가
- 태그 기능 없음
- 메모/노트 기능 없음
- 일정 계획 연동 불가
- 공유 기능 없음

---

## 구현 단계별 계획

### Phase 1: 기본 고도화 기능 (우선순위: High)

#### 1.1 북마크 목록 페이지
**목표**: 사용자가 북마크한 여행지를 한눈에 볼 수 있는 전용 페이지 제공

**구현 내용**:
- `app/bookmarks/page.tsx` 생성
- 북마크한 여행지 목록 표시 (카드 레이아웃)
- 빈 상태 처리 (북마크가 없을 때 안내 메시지)
- 로딩 상태 처리
- 에러 처리

**기술 스택**:
- Next.js App Router
- Server Components (데이터 페칭)
- `TravelCard` 컴포넌트 재사용

**예상 작업 시간**: 2-3시간

---

#### 1.2 북마크 정렬 및 필터링
**목표**: 북마크 목록을 다양한 기준으로 정렬하고 필터링

**구현 내용**:
- 정렬 옵션:
  - 최신순 (created_at DESC)
  - 이름순 (title ASC)
  - 지역별 (areacode, sigungucode)
  - 타입별 (contenttypeid)
- 필터 옵션:
  - 지역 필터 (시/도, 시군구)
  - 여행지 타입 필터
  - 북마크 날짜 범위 필터
- 검색 기능:
  - 여행지명 검색
  - 주소 검색

**기술 스택**:
- URL 쿼리 파라미터로 필터 상태 관리
- Supabase 쿼리 빌더 활용

**예상 작업 시간**: 3-4시간

---

### Phase 2: 조직화 기능 (우선순위: High)

#### 2.1 북마크 폴더/카테고리 기능
**목표**: 북마크를 폴더별로 분류하여 체계적으로 관리

**데이터베이스 스키마**:
```sql
-- bookmark_folders 테이블
CREATE TABLE public.bookmark_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT, -- 폴더 색상 (선택 사항)
    icon TEXT, -- 폴더 아이콘 (선택 사항)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, name) -- 사용자별 폴더명 중복 방지
);

-- bookmarks 테이블 확장
ALTER TABLE public.bookmarks 
ADD COLUMN folder_id UUID REFERENCES bookmark_folders(id) ON DELETE SET NULL;
```

**구현 내용**:
- 폴더 생성/수정/삭제 UI
- 북마크 추가 시 폴더 선택 옵션
- 북마크를 폴더로 이동/복사
- 폴더별 북마크 개수 표시
- 폴더별 북마크 목록 보기

**컴포넌트**:
- `components/bookmarks/folder-list.tsx`: 폴더 목록
- `components/bookmarks/folder-dialog.tsx`: 폴더 생성/수정 다이얼로그
- `components/bookmarks/folder-select.tsx`: 폴더 선택 드롭다운

**예상 작업 시간**: 6-8시간

---

#### 2.2 북마크 태그 기능
**목표**: 북마크에 태그를 추가하여 유연한 분류 및 검색

**데이터베이스 스키마**:
```sql
-- bookmark_tags 테이블
CREATE TABLE public.bookmark_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT, -- 태그 색상 (선택 사항)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, name) -- 사용자별 태그명 중복 방지
);

-- bookmark_tag_relations 테이블 (다대다 관계)
CREATE TABLE public.bookmark_tag_relations (
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES bookmark_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (bookmark_id, tag_id)
);
```

**구현 내용**:
- 태그 생성/삭제
- 북마크에 태그 추가/제거
- 태그별 필터링
- 인기 태그 표시 (사용 빈도순)
- 태그 자동완성 기능
- 태그 색상 커스터마이징

**컴포넌트**:
- `components/bookmarks/tag-input.tsx`: 태그 입력 컴포넌트
- `components/bookmarks/tag-list.tsx`: 태그 목록
- `components/bookmarks/tag-filter.tsx`: 태그 필터

**예상 작업 시간**: 5-6시간

---

#### 2.3 북마크 노트/메모 기능
**목표**: 각 북마크에 개인 메모를 추가하여 추가 정보 기록

**데이터베이스 스키마**:
```sql
-- bookmark_notes 테이블
CREATE TABLE public.bookmark_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(bookmark_id) -- 북마크당 하나의 메모만 허용
);
```

**구현 내용**:
- 메모 추가/수정/삭제
- 메모 검색 기능
- 메모가 있는 북마크 표시 (아이콘)
- 메모 미리보기

**컴포넌트**:
- `components/bookmarks/bookmark-note.tsx`: 메모 표시/편집 컴포넌트
- `components/bookmarks/note-dialog.tsx`: 메모 편집 다이얼로그

**예상 작업 시간**: 3-4시간

---

### Phase 3: 고급 기능 (우선순위: Medium)

#### 3.1 북마크 일정 계획 기능
**목표**: 북마크한 여행지를 일정에 추가하여 여행 계획 수립

**데이터베이스 스키마**:
```sql
-- travel_plans 테이블
CREATE TABLE public.travel_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- travel_plan_items 테이블
CREATE TABLE public.travel_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    visit_date DATE,
    visit_order INTEGER, -- 일정 내 순서
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(plan_id, bookmark_id)
);
```

**구현 내용**:
- 여행 일정 생성/수정/삭제
- 북마크를 일정에 추가
- 일정별 여행지 그룹화
- 캘린더 뷰 (날짜별 여행지 표시)
- 일정 경로 표시 (지도 연동)
- 일정 공유 기능

**컴포넌트**:
- `components/bookmarks/travel-plan-list.tsx`: 일정 목록
- `components/bookmarks/travel-plan-dialog.tsx`: 일정 생성/수정 다이얼로그
- `components/bookmarks/travel-plan-calendar.tsx`: 캘린더 뷰
- `components/bookmarks/travel-plan-map.tsx`: 일정 경로 지도

**예상 작업 시간**: 10-12시간

---

#### 3.2 북마크 지도 보기
**목표**: 북마크한 여행지를 지도에 표시하여 위치 파악

**구현 내용**:
- 북마크한 여행지 마커 표시
- 폴더/태그별로 마커 색상 구분
- 일정 경로 표시 (Phase 3.1과 연동)
- 마커 클릭 시 여행지 정보 표시
- 지도에서 북마크 추가/제거

**컴포넌트**:
- `components/bookmarks/bookmark-map.tsx`: 북마크 지도 컴포넌트
- `components/bookmarks/map-filter.tsx`: 지도 필터 (폴더/태그별)

**예상 작업 시간**: 4-5시간

---

#### 3.3 북마크 일괄 관리 기능
**목표**: 여러 북마크를 한 번에 관리

**구현 내용**:
- 다중 선택 모드 (체크박스)
- 일괄 삭제
- 일괄 폴더 이동
- 일괄 태그 추가/제거
- 선택된 북마크 개수 표시

**컴포넌트**:
- `components/bookmarks/bulk-actions.tsx`: 일괄 작업 툴바
- `components/bookmarks/bookmark-card.tsx`: 체크박스 포함 카드

**예상 작업 시간**: 3-4시간

---

### Phase 4: 공유 및 내보내기 (우선순위: Medium)

#### 4.1 북마크 공유 기능
**목표**: 북마크 목록을 다른 사용자와 공유

**데이터베이스 스키마**:
```sql
-- bookmark_shares 테이블
CREATE TABLE public.bookmark_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE, -- 공유 토큰
    folder_id UUID REFERENCES bookmark_folders(id) ON DELETE CASCADE, -- 폴더 공유
    is_public BOOLEAN DEFAULT false, -- 공개/비공개
    expires_at TIMESTAMPTZ, -- 만료일 (선택 사항)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

**구현 내용**:
- 북마크 목록 공유 URL 생성
- 폴더별 공유
- 공개/비공개 설정
- 공유 링크 만료일 설정
- 공유 링크 접근 페이지 (`app/bookmarks/shared/[token]/page.tsx`)

**예상 작업 시간**: 5-6시간

---

#### 4.2 북마크 내보내기/가져오기
**목표**: 북마크 데이터를 백업하거나 다른 서비스로 마이그레이션

**구현 내용**:
- JSON 형식으로 북마크 내보내기 (폴더, 태그, 메모 포함)
- CSV 형식으로 내보내기 (엑셀 호환)
- 북마크 가져오기 기능 (JSON/CSV)
- 다른 서비스에서 북마크 마이그레이션 (선택 사항)

**컴포넌트**:
- `components/bookmarks/export-dialog.tsx`: 내보내기 다이얼로그
- `components/bookmarks/import-dialog.tsx`: 가져오기 다이얼로그

**예상 작업 시간**: 4-5시간

---

### Phase 5: 알림 및 분석 (우선순위: Low)

#### 5.1 북마크 알림 기능
**목표**: 북마크한 여행지 관련 정보 업데이트 시 알림

**데이터베이스 스키마**:
```sql
-- bookmark_notifications 테이블
CREATE TABLE public.bookmark_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'info_update', 'event', 'weather' 등
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

**구현 내용**:
- 여행지 정보 업데이트 시 알림
- 여행지 이벤트/프로모션 알림
- 북마크한 여행지 주변 날씨 알림
- 알림 목록 페이지
- 알림 읽음 처리

**예상 작업 시간**: 6-8시간

---

#### 5.2 북마크 통계/분석 기능
**목표**: 사용자의 북마크 패턴 분석

**구현 내용**:
- 북마크한 여행지 통계 (지역별, 타입별)
- 가장 많이 북마크한 지역/타입
- 북마크 트렌드 분석 (시간대별)
- 개인 여행 취향 분석

**컴포넌트**:
- `components/bookmarks/bookmark-stats.tsx`: 통계 표시 컴포넌트
- 차트/그래프 시각화

**예상 작업 시간**: 4-5시간

---

## 구현 우선순위

### 1단계 (즉시 구현)
1. ✅ 북마크 목록 페이지
2. ✅ 북마크 정렬 및 필터링

### 2단계 (1단계 완료 후)
3. ✅ 북마크 폴더/카테고리 기능
4. ✅ 북마크 태그 기능
5. ✅ 북마크 노트/메모 기능

### 3단계 (2단계 완료 후)
6. ✅ 북마크 일정 계획 기능
7. ✅ 북마크 지도 보기
8. ✅ 북마크 일괄 관리 기능

### 4단계 (3단계 완료 후)
9. ✅ 북마크 공유 기능
10. ✅ 북마크 내보내기/가져오기

### 5단계 (선택 사항)
11. ✅ 북마크 알림 기능
12. ✅ 북마크 통계/분석 기능

---

## 기술 스택

### 프론트엔드
- **Next.js 15** (App Router)
- **React 19** (Server/Client Components)
- **TypeScript** (타입 안정성)
- **Tailwind CSS v4** (스타일링)
- **shadcn/ui** (UI 컴포넌트)
- **lucide-react** (아이콘)

### 백엔드/데이터베이스
- **Supabase** (PostgreSQL)
- **Clerk** (인증)

### 차트/시각화 (선택 사항)
- **recharts** 또는 **chart.js** (통계 차트)

---

## 데이터베이스 마이그레이션 계획

### 마이그레이션 파일 순서
1. `20250108_000000_create_bookmark_folders.sql`
2. `20250108_000001_add_folder_to_bookmarks.sql`
3. `20250108_000002_create_bookmark_tags.sql`
4. `20250108_000003_create_bookmark_tag_relations.sql`
5. `20250108_000004_create_bookmark_notes.sql`
6. `20250108_000005_create_travel_plans.sql`
7. `20250108_000006_create_travel_plan_items.sql`
8. `20250108_000007_create_bookmark_shares.sql`
9. `20250108_000008_create_bookmark_notifications.sql`

---

## API/Server Actions 계획

### 북마크 관련
- `actions/bookmarks/get-bookmarks.ts`: 북마크 목록 조회
- `actions/bookmarks/create-bookmark.ts`: 북마크 생성
- `actions/bookmarks/delete-bookmark.ts`: 북마크 삭제
- `actions/bookmarks/update-bookmark.ts`: 북마크 업데이트 (폴더, 태그 등)

### 폴더 관련
- `actions/bookmarks/folders/get-folders.ts`: 폴더 목록 조회
- `actions/bookmarks/folders/create-folder.ts`: 폴더 생성
- `actions/bookmarks/folders/update-folder.ts`: 폴더 수정
- `actions/bookmarks/folders/delete-folder.ts`: 폴더 삭제

### 태그 관련
- `actions/bookmarks/tags/get-tags.ts`: 태그 목록 조회
- `actions/bookmarks/tags/create-tag.ts`: 태그 생성
- `actions/bookmarks/tags/delete-tag.ts`: 태그 삭제
- `actions/bookmarks/tags/add-tag-to-bookmark.ts`: 북마크에 태그 추가
- `actions/bookmarks/tags/remove-tag-from-bookmark.ts`: 북마크에서 태그 제거

### 메모 관련
- `actions/bookmarks/notes/get-note.ts`: 메모 조회
- `actions/bookmarks/notes/save-note.ts`: 메모 저장/수정
- `actions/bookmarks/notes/delete-note.ts`: 메모 삭제

### 일정 관련
- `actions/bookmarks/plans/get-plans.ts`: 일정 목록 조회
- `actions/bookmarks/plans/create-plan.ts`: 일정 생성
- `actions/bookmarks/plans/update-plan.ts`: 일정 수정
- `actions/bookmarks/plans/delete-plan.ts`: 일정 삭제
- `actions/bookmarks/plans/add-bookmark-to-plan.ts`: 일정에 북마크 추가

### 공유 관련
- `actions/bookmarks/shares/create-share.ts`: 공유 링크 생성
- `actions/bookmarks/shares/get-shared-bookmarks.ts`: 공유된 북마크 조회
- `actions/bookmarks/shares/delete-share.ts`: 공유 링크 삭제

### 내보내기/가져오기
- `actions/bookmarks/export/export-bookmarks.ts`: 북마크 내보내기
- `actions/bookmarks/import/import-bookmarks.ts`: 북마크 가져오기

---

## UI/UX 고려사항

### 접근성
- ARIA 속성 적용
- 키보드 네비게이션 지원
- 스크린 리더 지원

### 반응형 디자인
- 모바일 퍼스트 접근
- 태블릿/데스크톱 최적화

### 성능 최적화
- Server Components 활용 (데이터 페칭)
- 클라이언트 사이드 캐싱
- 이미지 최적화 (Next.js Image)

### 사용자 경험
- 로딩 상태 표시
- 에러 처리 및 사용자 친화적 메시지
- 성공 피드백 (toast 알림)
- 드래그 앤 드롭 (폴더 이동, 일정 순서 변경)

---

## 테스트 계획

### 단위 테스트
- Server Actions 테스트
- 유틸리티 함수 테스트

### 통합 테스트
- API 엔드포인트 테스트
- 데이터베이스 쿼리 테스트

### E2E 테스트 (선택 사항)
- 북마크 추가/삭제 플로우
- 폴더 생성 및 북마크 이동 플로우
- 태그 추가 및 필터링 플로우

---

## 예상 총 작업 시간

- **Phase 1**: 5-7시간
- **Phase 2**: 14-18시간
- **Phase 3**: 17-21시간
- **Phase 4**: 9-11시간
- **Phase 5**: 10-13시간

**총 예상 시간**: 55-70시간

---

## 다음 단계

1. ✅ 이 계획서 검토 및 승인
2. Phase 1 구현 시작 (북마크 목록 페이지)
3. 단계별 구현 및 테스트
4. 사용자 피드백 수집 및 개선

---

## 참고 자료

- [TODO.md](./TODO.md) - 북마크 고도화 계획
- [PRD.md](./PRD.md) - 제품 요구사항 문서
- [Design.md](./Design.md) - 디자인 가이드라인
- Supabase 문서: https://supabase.com/docs
- Next.js 문서: https://nextjs.org/docs

