# Vercel 환경 변수 설정 가이드 (Pitch Travel)

이 문서는 Pitch Travel 서비스를 Vercel에 배포할 때 필요한 환경 변수를 설정하는 방법을 안내합니다.

## 🔒 보안 경고

**⚠️ 중요: 이 문서에는 예시 값만 포함되어 있습니다.**

- 실제 API 키나 Client ID는 절대 문서나 코드에 하드코딩하지 마세요
- 모든 민감한 정보는 환경 변수나 보안 저장소에만 저장하세요
- Git에 커밋되면 안 되는 파일: `.env`, `.env.local`, `.env.production.local` 등

## 🚨 현재 발생 중인 문제

### 1. 여행지 정보가 표시되지 않음

**원인:**
- Vercel 환경 변수에 `TOUR_API_KEY`가 설정되지 않았거나 잘못 설정됨
- 서버 사이드 API Route (`/api/travels`)에서 `process.env.TOUR_API_KEY`를 찾지 못함

**해결 방법:**
1. Vercel Dashboard 접속: https://vercel.com/dashboard
2. 프로젝트 선택 (`pitch-travel`) → **Settings** → **Environment Variables**
3. 다음 환경 변수 추가:
   - **Key**: `TOUR_API_KEY`
   - **Value**: 실제 TourAPI 키 값 (한국관광공사에서 발급받은 키)
   - **Environment**: Production, Preview, Development 모두 선택
4. **Save** 클릭
5. **Redeploy** 실행 (또는 새 커밋 푸시)

### 2. 네이버 지도가 표시되지 않음

**원인:**
- Vercel 환경 변수에 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`가 설정되지 않았거나 잘못 설정됨
- 네이버 클라우드 플랫폼에서 도메인 등록이 안 되어 있음

**해결 방법:**
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. 다음 환경 변수 추가:
   - **Key**: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
   - **Value**: 실제 Naver Map Client ID 값
   - **Environment**: Production, Preview, Development 모두 선택
3. **Save** 클릭
4. [네이버 클라우드 플랫폼 콘솔](https://console.ncloud.com) 접속
5. **AI·NAVER API** → **Application** → 해당 Application 선택
6. **Web Dynamic Map** 서비스 활성화 확인
7. **도메인 등록**에 `pitch-travel.vercel.app` 및 `*.vercel.app` 추가
8. **Redeploy** 실행

## 📋 필수 환경 변수 목록

### 한국관광공사 TourAPI

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `TOUR_API_KEY` | TourAPI 키 (서버 사이드 전용) | `your-api-key-here` | ✅ 필수 |
| `NEXT_PUBLIC_TOUR_API_BASE_URL` | TourAPI Base URL (선택 사항) | `http://apis.data.go.kr/B551011/KorService1` | 선택 |

**⚠️ 중요:**
- `TOUR_API_KEY`는 `NEXT_PUBLIC_` 접두사가 **없습니다** (서버 사이드 전용)
- 클라이언트는 `/api/travels` API Route를 통해 간접 접근

### 네이버 지도 API

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | Naver Map API Client ID | `your-client-id-here` | ✅ 필수 |

**⚠️ 중요:**
- 네이버 클라우드 플랫폼 콘솔에서 배포 URL 등록 필수
- `pitch-travel.vercel.app` 및 `*.vercel.app` 도메인 등록 필요

### Clerk 인증

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | `pk_...` | ✅ 필수 |
| `CLERK_SECRET_KEY` | Clerk Secret Key | `sk_...` | ✅ 필수 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | 로그인 URL | `/sign-in` | 선택 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | 로그인 후 리다이렉트 URL | `/` | 선택 |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | 회원가입 후 리다이렉트 URL | `/` | 선택 |

### Supabase

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xxx.supabase.co` | ✅ 필수 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJ...` | ✅ 필수 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | `eyJ...` | ✅ 필수 |
| `NEXT_PUBLIC_STORAGE_BUCKET` | Storage Bucket 이름 | `uploads` | 선택 |

### 관리자 설정 (선택)

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `ADMIN_USER_IDS` | 관리자 Clerk User ID (쉼표 구분) | `user_xxx,user_yyy` | 선택 |

### 사이트 URL (선택)

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `NEXT_PUBLIC_SITE_URL` | 프로덕션 도메인 | `https://pitch-travel.vercel.app` | 선택 |

## 🔧 Vercel 환경 변수 설정 방법

### 방법 1: Vercel Dashboard (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 (`pitch-travel`)
3. **Settings** → **Environment Variables** 클릭
4. **Add New** 클릭
5. 다음 정보 입력:
   - **Key**: 환경 변수 이름
   - **Value**: 환경 변수 값
   - **Environment**:
     - Production (프로덕션 배포)
     - Preview (프리뷰 배포)
     - Development (로컬 개발, 선택 사항)
6. **Save** 클릭
7. **Redeploy** 실행 (또는 새 커밋 푸시)

### 방법 2: Vercel CLI

```bash
# 단일 환경 변수 추가
vercel env add TOUR_API_KEY production

# 여러 환경 변수 한 번에 추가
vercel env add TOUR_API_KEY production preview development
```

## ✅ 환경 변수 설정 확인 체크리스트

배포 전 다음 항목들을 확인하세요:

- [ ] `TOUR_API_KEY` 설정됨 (서버 사이드 전용)
- [ ] `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 설정됨
- [ ] 네이버 클라우드 플랫폼에서 도메인 등록 완료
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 설정됨
- [ ] `CLERK_SECRET_KEY` 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정됨
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정됨
- [ ] 환경 변수 설정 후 **Redeploy** 실행

## 🐛 문제 해결

### 여행지 정보가 표시되지 않는 경우

1. 브라우저 개발자 도구 (F12) → **Console** 탭 확인
2. **Network** 탭에서 `/api/travels` 요청 확인
3. 응답 상태 코드 확인:
   - `500`: `TOUR_API_KEY` 환경 변수 누락 또는 잘못된 키
   - `200`: 데이터는 있지만 UI 렌더링 문제일 수 있음
4. Vercel Dashboard → **Deployments** → 최신 배포 → **Functions** 탭에서 로그 확인

### 네이버 지도가 표시되지 않는 경우

1. 브라우저 개발자 도구 (F12) → **Console** 탭 확인
2. 네이버 지도 스크립트 로드 오류 확인:
   - `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 환경 변수 누락
   - 네이버 클라우드 플랫폼에서 도메인 미등록
3. **Network** 탭에서 `https://oapi.map.naver.com` 요청 확인
4. 네이버 클라우드 플랫폼 콘솔에서:
   - Application 선택 → **Web Dynamic Map** 서비스 활성화 확인
   - **도메인 등록**에 `pitch-travel.vercel.app` 및 `*.vercel.app` 추가 확인

## 📚 참고 자료

- [한국관광공사 TourAPI 문서](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15128846)
- [네이버 지도 API 문서](https://navermaps.github.io/maps.js.ncp/)
- [Vercel 환경 변수 문서](https://vercel.com/docs/concepts/projects/environment-variables)

