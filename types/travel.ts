/**
 * @file travel.ts
 * @description 여행지 관련 TypeScript 타입 정의
 *
 * 한국관광공사 TourAPI 응답 데이터 구조를 기반으로 한 타입 정의
 * 모든 필드는 TourAPI 응답 필드명을 그대로 사용
 */

/**
 * 여행지 목록 항목 타입
 * TourAPI 목록 조회 응답에서 사용
 */
export interface TravelSite {
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠 타입ID (12:관광지, 14:문화시설, 15:축제, 32:숙박, 38:쇼핑, 39:음식점)
  title: string; // 여행지명
  addr1?: string; // 주소
  addr2?: string; // 상세주소
  mapx?: string; // 경도 (WGS84 좌표계)
  mapy?: string; // 위도 (WGS84 좌표계)
  firstimage?: string; // 대표이미지 URL
  firstimage2?: string; // 대표이미지 썸네일 URL
  tel?: string; // 전화번호
  homepage?: string; // 홈페이지 URL
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  areacode?: string; // 지역코드
  sigungucode?: string; // 시군구코드
  zipcode?: string; // 우편번호
  overview?: string; // 개요
  // 기타 필드 (TourAPI 명세서에 따라 추가 가능)
  [key: string]: unknown;
}

/**
 * 여행지 상세 정보 타입
 * TourAPI 상세 조회 응답에서 사용
 */
export interface TravelSiteDetail {
  contentid: string;
  contenttypeid: string;
  title: string; // 여행지명
  addr1?: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  mapx?: string; // 경도 (WGS84 좌표계)
  mapy?: string; // 위도 (WGS84 좌표계)
  firstimage?: string;
  overview?: string; // 개요
  // 운영 정보
  usetime?: string; // 이용시간
  restdate?: string; // 휴무일
  usetimefestival?: string; // 축제 이용시간
  // 시설 정보
  infocenter?: string; // 문의 및 안내
  parking?: string; // 주차시설
  parkingfee?: string; // 주차요금
  expguide?: string; // 체험안내
  expagerange?: string; // 체험가능연령
  accomcount?: string; // 수용인원
  usefee?: string; // 이용요금
  discountinfo?: string; // 할인정보
  // 기타 정보
  chkbabycarriage?: string; // 유모차 대여
  chkpet?: string; // 애완동물 동반
  chkcreditcard?: string; // 신용카드 가능
  // 카테고리 정보
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  // 기타 필드
  [key: string]: unknown;
}

/**
 * 여행지 이미지 정보 타입
 * TourAPI 이미지 조회 응답에서 사용
 */
export interface TravelImage {
  contentid: string;
  originimgurl?: string; // 원본 이미지 URL
  smallimageurl?: string; // 썸네일 이미지 URL
  imgname?: string; // 이미지명
  serialnum?: string; // 이미지 순번
  // 기타 필드
  [key: string]: unknown;
}

/**
 * 여행지 필터 옵션 타입
 * 목록 페이지 필터링에 사용
 */
export interface TravelFilter {
  // 지역 필터
  areaCode?: string; // 지역코드 (시/도)
  sigunguCode?: string; // 시군구코드
  
  // 여행지 타입 필터
  contentTypeId?: string; // 콘텐츠 타입ID (12:관광지, 14:문화시설, 15:축제, 32:숙박, 38:쇼핑, 39:음식점)
  
  // 카테고리 필터
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  
  // 검색 키워드
  keyword?: string;
  
  // 정렬 옵션
  arrange?: string; // 정렬 (A:제목순, B:조회순, C:수정일순, D:생성일순)
  
  // 페이지네이션
  pageNo?: number; // 페이지 번호 (1부터 시작)
  numOfRows?: number; // 페이지당 항목 수
}

/**
 * TourAPI 응답 기본 구조
 */
export interface TourApiResponse<T> {
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
 * 여행지 목록 API 응답 타입
 */
export type TravelListResponse = TourApiResponse<TravelSite>;

/**
 * 여행지 상세 API 응답 타입
 */
export type TravelDetailResponse = TourApiResponse<TravelSiteDetail>;

/**
 * 여행지 이미지 목록 API 응답 타입
 */
export type TravelImageListResponse = TourApiResponse<TravelImage>;

