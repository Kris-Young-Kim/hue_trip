/**
 * @file camping.ts
 * @description 캠핑장 관련 TypeScript 타입 정의
 *
 * 고캠핑 API 응답 데이터 구조를 기반으로 한 타입 정의
 * 모든 필드는 고캠핑 API 응답 필드명을 그대로 사용
 */

/**
 * 캠핑장 목록 항목 타입
 * 고캠핑 API 목록 조회 응답에서 사용
 */
export interface CampingSite {
  contentId: string; // 콘텐츠ID
  facltNm: string; // 캠핑장명
  lineIntro?: string; // 한줄 소개
  intro?: string; // 상세 설명
  addr1: string; // 주소
  addr2?: string; // 상세주소
  mapX: number; // 경도 (KATEC 좌표계, 정수형 * 10000000)
  mapY: number; // 위도 (KATEC 좌표계, 정수형 * 10000000)
  firstImageUrl?: string; // 대표이미지 URL
  tel?: string; // 전화번호
  homepage?: string; // 홈페이지 URL
  induty?: string; // 업종 (일반야영장, 자동차야영장 등)
  facltDivNm?: string; // 시설 구분
  operPdCl?: string; // 운영기간
  operDeCl?: string; // 운영일
  posblFcltyCl?: string; // 주요시설
  eqpmnLendCl?: string; // 캠핑장비 대여
  animalCmgCl?: string; // 반려동물 동반
  sbrsCl?: string; // 부대시설
  lctCl?: string; // 입지 구분
  doNm?: string; // 도명
  sigunguNm?: string; // 시군구명
  zipcode?: string; // 우편번호
  // 기타 필드 (고캠핑 API 명세서에 따라 추가 가능)
}

/**
 * 캠핑장 상세 정보 타입
 * 고캠핑 API 상세 조회 응답에서 사용
 */
export interface CampingSiteDetail {
  contentId: string;
  facltNm: string; // 캠핑장명
  lineIntro?: string; // 한줄 소개
  intro?: string; // 상세 설명
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  mapX: number; // 경도 (KATEC 좌표계)
  mapY: number; // 위도 (KATEC 좌표계)
  firstImageUrl?: string;
  // 시설 정보
  sbrsCl?: string; // 부대시설
  posblFcltyCl?: string; // 주요시설
  glampInnerFclty?: string; // 글램핑 내부시설
  caravInnerFclty?: string; // 카라반 내부시설
  // 운영 정보
  operPdCl?: string; // 운영기간
  operDeCl?: string; // 운영일
  lctCl?: string; // 입지 구분
  induty?: string; // 업종
  facltDivNm?: string; // 시설 구분
  doNm?: string; // 도명
  sigunguNm?: string; // 시군구명
  // 기타 필드
  [key: string]: unknown; // 고캠핑 API의 추가 필드 허용
}

/**
 * 캠핑장 시설 정보 타입
 * 상세 페이지의 시설 정보 섹션에서 사용
 */
export interface CampingFacility {
  contentId: string;
  // 시설 정보
  sbrsCl?: string; // 부대시설 (화장실, 샤워장 등)
  posblFcltyCl?: string; // 주요시설
  glampInnerFclty?: string; // 글램핑 내부시설
  caravInnerFclty?: string; // 카라반 내부시설
  // 운영 정보
  operPdCl?: string; // 운영기간
  operDeCl?: string; // 운영일
  // 기타 필드
  [key: string]: unknown;
}

/**
 * 캠핑장 필터 옵션 타입
 * 목록 페이지 필터링에 사용
 */
export interface CampingFilter {
  // 지역 필터
  doNm?: string; // 도명 (서울, 부산, 경기 등)
  sigunguNm?: string; // 시군구명
  
  // 캠핑 타입 필터
  induty?: string; // 업종 (일반야영장, 자동차야영장, 글램핑, 카라반)
  
  // 시설 필터 (부대시설)
  sbrsCl?: string; // 부대시설 (화장실, 샤워장, 전기, 와이파이 등)
  
  // 검색 키워드
  keyword?: string;
  
  // 정렬 옵션
  sortOrder?: 'name' | 'region' | 'popular'; // 이름순, 지역순, 인기순
  
  // 페이지네이션
  pageNo?: number; // 페이지 번호 (1부터 시작)
  numOfRows?: number; // 페이지당 항목 수
}

/**
 * 고캠핑 API 응답 기본 구조
 */
export interface GoCampingApiResponse<T> {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      items?: {
        item?: T | T[];
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
  // 에러 응답 구조
  error?: {
    code?: string;
    message?: string;
  };
}

/**
 * 캠핑장 목록 API 응답 타입
 */
export type CampingListResponse = GoCampingApiResponse<CampingSite>;

/**
 * 캠핑장 상세 API 응답 타입
 */
export type CampingDetailResponse = GoCampingApiResponse<CampingSiteDetail>;

