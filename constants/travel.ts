/**
 * @file travel.ts
 * @description 여행지 관련 상수 정의
 *
 * 여행지 타입, 지역, 카테고리, 정렬 옵션 등의 상수값 정의
 * UI 컴포넌트와 필터링 로직에서 사용
 */

/**
 * 여행지 타입 상수
 * TourAPI의 contenttypeid 필드값과 일치해야 함
 */
export const TRAVEL_TYPES = {
  ALL: "전체",
  TOURIST_SPOT: "관광지", // 12
  CULTURAL_FACILITY: "문화시설", // 14
  FESTIVAL: "축제", // 15
  ACCOMMODATION: "숙박", // 32
  SHOPPING: "쇼핑", // 38
  RESTAURANT: "음식점", // 39
} as const;

/**
 * 여행지 타입 코드 (API 응답값 - contenttypeid)
 */
export const TRAVEL_TYPE_CODES = {
  TOURIST_SPOT: "12", // 관광지
  CULTURAL_FACILITY: "14", // 문화시설
  FESTIVAL: "15", // 축제
  ACCOMMODATION: "32", // 숙박
  SHOPPING: "38", // 쇼핑
  RESTAURANT: "39", // 음식점
} as const;

export type TravelType = typeof TRAVEL_TYPE_CODES[keyof typeof TRAVEL_TYPE_CODES];

/**
 * 지역(시/도) 상수 및 코드
 * TourAPI의 areacode와 매핑
 */
export const REGIONS = {
  ALL: "전체",
  SEOUL: "서울", // 1
  INCHEON: "인천", // 2
  DAEJEON: "대전", // 3
  DAEGU: "대구", // 4
  GWANGJU: "광주", // 5
  BUSAN: "부산", // 6
  ULSAN: "울산", // 7
  SEJONG: "세종", // 8
  GYEONGGI: "경기", // 31
  GANGWON: "강원", // 32
  CHUNGBUK: "충북", // 33
  CHUNGNAM: "충남", // 34
  GYEONGBUK: "경북", // 35
  GYEONGNAM: "경남", // 36
  JEONBUK: "전북", // 37
  JEONNAM: "전남", // 38
  JEJU: "제주", // 39
} as const;

/**
 * 지역 코드 매핑 (지역명 → areacode)
 */
export const REGION_CODES: Record<string, string> = {
  [REGIONS.SEOUL]: "1",
  [REGIONS.INCHEON]: "2",
  [REGIONS.DAEJEON]: "3",
  [REGIONS.DAEGU]: "4",
  [REGIONS.GWANGJU]: "5",
  [REGIONS.BUSAN]: "6",
  [REGIONS.ULSAN]: "7",
  [REGIONS.SEJONG]: "8",
  [REGIONS.GYEONGGI]: "31",
  [REGIONS.GANGWON]: "32",
  [REGIONS.CHUNGBUK]: "33",
  [REGIONS.CHUNGNAM]: "34",
  [REGIONS.GYEONGBUK]: "35",
  [REGIONS.GYEONGNAM]: "36",
  [REGIONS.JEONBUK]: "37",
  [REGIONS.JEONNAM]: "38",
  [REGIONS.JEJU]: "39",
};

export type Region = typeof REGIONS[keyof typeof REGIONS];

/**
 * 정렬 옵션 상수
 * TourAPI의 arrange 파라미터값
 */
export const SORT_OPTIONS = {
  TITLE: "A", // 제목순
  POPULAR: "B", // 조회순
  MODIFIED: "C", // 수정일순
  CREATED: "D", // 생성일순
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

/**
 * 정렬 옵션 표시명
 */
export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  [SORT_OPTIONS.TITLE]: "제목순",
  [SORT_OPTIONS.POPULAR]: "조회순",
  [SORT_OPTIONS.MODIFIED]: "수정일순",
  [SORT_OPTIONS.CREATED]: "생성일순",
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
 * 여행지 타입 배열 (드롭다운 등에서 사용)
 */
export const TRAVEL_TYPE_LIST = Object.values(TRAVEL_TYPES).filter(
  (type) => type !== TRAVEL_TYPES.ALL
);

/**
 * 여행지 타입 코드 배열
 */
export const TRAVEL_TYPE_CODE_LIST = Object.values(TRAVEL_TYPE_CODES);

