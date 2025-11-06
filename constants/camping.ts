/**
 * @file camping.ts
 * @description 캠핑장 관련 상수 정의
 *
 * 캠핑 타입, 지역, 시설, 정렬 옵션 등의 상수값 정의
 * UI 컴포넌트와 필터링 로직에서 사용
 */

/**
 * 캠핑 타입 상수
 * 고캠핑 API의 induty 필드값과 일치해야 함
 */
export const CAMPING_TYPES = {
  ALL: "전체",
  GENERAL: "일반야영장",
  CAR: "자동차야영장",
  GLAMPING: "글램핑",
  CARAVAN: "카라반",
} as const;

/**
 * 캠핑 타입 코드 (API 응답값)
 */
export const CAMPING_TYPE_CODES = {
  GENERAL: "일반야영장",
  CAR: "자동차야영장",
  GLAMPING: "글램핑",
  CARAVAN: "카라반",
} as const;

export type CampingType = typeof CAMPING_TYPE_CODES[keyof typeof CAMPING_TYPE_CODES];

/**
 * 지역(시/도) 상수
 */
export const REGIONS = {
  ALL: "전체",
  SEOUL: "서울",
  BUSAN: "부산",
  DAEGU: "대구",
  INCHEON: "인천",
  GWANGJU: "광주",
  DAEJEON: "대전",
  ULSAN: "울산",
  SEJONG: "세종",
  GYEONGGI: "경기",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  JEJU: "제주",
} as const;

export type Region = typeof REGIONS[keyof typeof REGIONS];

/**
 * 시설 코드 상수
 * 고캠핑 API의 sbrsCl (부대시설) 필드값
 */
export const FACILITIES = {
  TOILET: "화장실",
  SHOWER: "샤워장",
  ELECTRIC: "전기",
  WIFI: "와이파이",
  PET: "반려동물동반가능",
  PARKING: "주차장",
  STORE: "매점",
  WATER: "물놀이장",
  PLAYGROUND: "운동시설",
  CAMPFIRE: "장비대여",
  WALK: "산책로",
  POOL: "수영장",
} as const;

export type Facility = typeof FACILITIES[keyof typeof FACILITIES];

/**
 * 시설 코드 매핑 (API 응답값 → 상수)
 * 실제 API 응답에서 어떤 형식으로 오는지 확인 필요
 */
export const FACILITY_CODES: Record<string, Facility> = {
  toilet: FACILITIES.TOILET,
  shower: FACILITIES.SHOWER,
  electrical: FACILITIES.ELECTRIC,
  wifi: FACILITIES.WIFI,
  pet: FACILITIES.PET,
  parking: FACILITIES.PARKING,
  store: FACILITIES.STORE,
  water: FACILITIES.WATER,
  playground: FACILITIES.PLAYGROUND,
  campfire: FACILITIES.CAMPFIRE,
  walk: FACILITIES.WALK,
  pool: FACILITIES.POOL,
};

/**
 * 정렬 옵션 상수
 */
export const SORT_OPTIONS = {
  NAME: "name", // 이름순 (가나다순)
  REGION: "region", // 지역순
  POPULAR: "popular", // 인기순
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

/**
 * 정렬 옵션 표시명
 */
export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  [SORT_OPTIONS.NAME]: "이름순",
  [SORT_OPTIONS.REGION]: "지역순",
  [SORT_OPTIONS.POPULAR]: "인기순",
};

/**
 * 페이지네이션 기본값
 */
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20, // 페이지당 항목 수
  INITIAL_PAGE: 1, // 초기 페이지 번호
} as const;

/**
 * 지역 배열 (드롭다운 등에서 사용)
 */
export const REGION_LIST = Object.values(REGIONS).filter(
  (region) => region !== REGIONS.ALL
);

/**
 * 캠핑 타입 배열 (드롭다운 등에서 사용)
 */
export const CAMPING_TYPE_LIST = Object.values(CAMPING_TYPES).filter(
  (type) => type !== CAMPING_TYPES.ALL
);

/**
 * 시설 배열 (체크박스 등에서 사용)
 */
export const FACILITY_LIST = Object.values(FACILITIES);

