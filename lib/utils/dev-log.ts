/**
 * 개발 환경에서만 로그를 출력하는 유틸리티
 * 프로덕션에서는 모든 로그가 제거되어 성능에 영향을 주지 않음
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const devLog = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // 에러는 항상 로깅 (프로덕션에서도 필요)
    console.error(...args);
  },
};

