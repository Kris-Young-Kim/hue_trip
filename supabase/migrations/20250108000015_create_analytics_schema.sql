/**
 * @file 20250108000015_create_analytics_schema.sql
 * @description 분석을 위한 데이터베이스 스키마 확장
 */

-- =====================================================
-- analytics_events 테이블: 사용자 이벤트 추적
-- =====================================================
-- 사용자의 모든 상호작용 이벤트를 추적 (클릭, 페이지뷰, 검색 등)

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL, -- 세션 식별자
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'search', 'bookmark', 'share', 'review', 'filter'
  event_name TEXT NOT NULL, -- 이벤트 이름 (예: 'travel_detail_view', 'bookmark_add')
  page_path TEXT, -- 페이지 경로
  page_title TEXT, -- 페이지 제목
  referrer TEXT, -- 리퍼러 URL
  content_id TEXT, -- 관련 콘텐츠 ID (여행지 ID 등)
  properties JSONB DEFAULT '{}'::jsonb, -- 이벤트 속성 (검색어, 필터 설정 등)
  user_agent TEXT, -- 사용자 에이전트
  ip_address TEXT, -- IP 주소 (개인정보 보호를 위해 해시 처리 권장)
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE analytics_events IS '사용자 이벤트 추적 테이블 (페이지뷰, 클릭, 검색 등)';
COMMENT ON COLUMN analytics_events.session_id IS '세션 식별자 (클라이언트에서 생성)';
COMMENT ON COLUMN analytics_events.event_type IS '이벤트 유형 (page_view, click, search, bookmark, share, review, filter)';
COMMENT ON COLUMN analytics_events.properties IS '이벤트 속성 (JSON 형식, 검색어, 필터 설정 등)';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_content_id ON analytics_events(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_session ON analytics_events(user_id, session_id, created_at DESC);

-- =====================================================
-- analytics_sessions 테이블: 세션 추적
-- =====================================================
-- 사용자 세션 정보 추적 (시작/종료 시간, 페이지뷰 수 등)

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL, -- 세션 식별자
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ended_at TIMESTAMPTZ, -- 세션 종료 시간
  duration_seconds INTEGER, -- 세션 지속 시간 (초)
  page_views INTEGER DEFAULT 0, -- 페이지뷰 수
  events_count INTEGER DEFAULT 0, -- 이벤트 수
  referrer TEXT, -- 첫 방문 리퍼러
  landing_page TEXT, -- 랜딩 페이지
  exit_page TEXT, -- 종료 페이지
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT, -- 브라우저 정보
  os TEXT, -- 운영체제 정보
  country TEXT, -- 국가 (IP 기반)
  city TEXT, -- 도시 (IP 기반)
  properties JSONB DEFAULT '{}'::jsonb, -- 추가 속성
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE analytics_sessions IS '사용자 세션 추적 테이블';
COMMENT ON COLUMN analytics_sessions.session_id IS '세션 식별자 (클라이언트에서 생성)';
COMMENT ON COLUMN analytics_sessions.duration_seconds IS '세션 지속 시간 (초)';
COMMENT ON COLUMN analytics_sessions.properties IS '추가 세션 속성 (JSON 형식)';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_started ON analytics_sessions(user_id, started_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER trigger_update_analytics_sessions_updated_at
  BEFORE UPDATE ON analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configs_updated_at();

-- =====================================================
-- analytics_metrics 테이블: 집계된 메트릭 저장
-- =====================================================
-- 일별/주별/월별 집계된 메트릭 데이터 저장

CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  metric_date DATE NOT NULL, -- 메트릭 날짜
  metric_name TEXT NOT NULL, -- 메트릭 이름 (예: 'active_users', 'page_views', 'bookmarks')
  value NUMERIC NOT NULL, -- 메트릭 값
  dimension TEXT, -- 차원 (예: 'region', 'type', 'device')
  dimension_value TEXT, -- 차원 값 (예: '서울', '관광지', 'mobile')
  metadata JSONB DEFAULT '{}'::jsonb, -- 추가 메타데이터
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(metric_type, metric_date, metric_name, dimension, dimension_value)
);

COMMENT ON TABLE analytics_metrics IS '집계된 메트릭 저장 테이블 (일별/주별/월별)';
COMMENT ON COLUMN analytics_metrics.metric_type IS '메트릭 타입 (daily, weekly, monthly, yearly)';
COMMENT ON COLUMN analytics_metrics.metric_name IS '메트릭 이름 (active_users, page_views, bookmarks 등)';
COMMENT ON COLUMN analytics_metrics.dimension IS '차원 (region, type, device 등)';
COMMENT ON COLUMN analytics_metrics.dimension_value IS '차원 값';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_type_date ON analytics_metrics(metric_type, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_dimension ON analytics_metrics(dimension, dimension_value);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER trigger_update_analytics_metrics_updated_at
  BEFORE UPDATE ON analytics_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configs_updated_at();

-- =====================================================
-- analytics_reports 테이블: 생성된 리포트 저장
-- =====================================================
-- 분석 리포트 생성 및 저장 (기존 reports 테이블과 별도로 관리)

CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL, -- 'user_behavior', 'traffic', 'conversion', 'retention'
  report_name TEXT NOT NULL, -- 리포트 이름
  report_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  start_date DATE NOT NULL, -- 시작 날짜
  end_date DATE NOT NULL, -- 종료 날짜
  data JSONB NOT NULL DEFAULT '{}'::jsonb, -- 리포트 데이터
  summary JSONB DEFAULT '{}'::jsonb, -- 리포트 요약
  is_scheduled BOOLEAN DEFAULT false, -- 스케줄된 리포트 여부
  schedule_config JSONB, -- 스케줄 설정 (cron 표현식 등)
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE analytics_reports IS '분석 리포트 저장 테이블';
COMMENT ON COLUMN analytics_reports.report_type IS '리포트 유형 (user_behavior, traffic, conversion, retention)';
COMMENT ON COLUMN analytics_reports.data IS '리포트 데이터 (JSON 형식)';
COMMENT ON COLUMN analytics_reports.summary IS '리포트 요약 (JSON 형식)';
COMMENT ON COLUMN analytics_reports.schedule_config IS '스케줄 설정 (JSON 형식, cron 표현식 등)';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_period ON analytics_reports(report_period, start_date DESC, end_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_created_at ON analytics_reports(created_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER trigger_update_analytics_reports_updated_at
  BEFORE UPDATE ON analytics_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configs_updated_at();

-- =====================================================
-- analytics_alerts 테이블: 알림 설정 및 이력
-- =====================================================
-- 분석 기반 알림 설정 및 이력 (기존 alert_rules와 별도로 관리)

CREATE TABLE IF NOT EXISTS analytics_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  alert_name TEXT NOT NULL, -- 알림 이름
  alert_type TEXT NOT NULL, -- 'threshold', 'anomaly', 'trend'
  metric_name TEXT NOT NULL, -- 모니터링할 메트릭 이름
  condition JSONB NOT NULL, -- 알림 조건 (JSON 형식)
  channels JSONB DEFAULT '[]'::jsonb, -- 알림 채널 (email, webhook 등)
  is_active BOOLEAN DEFAULT true, -- 활성화 여부
  last_triggered_at TIMESTAMPTZ, -- 마지막 트리거 시간
  trigger_count INTEGER DEFAULT 0, -- 트리거 횟수
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE analytics_alerts IS '분석 기반 알림 설정 및 이력';
COMMENT ON COLUMN analytics_alerts.alert_type IS '알림 유형 (threshold, anomaly, trend)';
COMMENT ON COLUMN analytics_alerts.condition IS '알림 조건 (JSON 형식)';
COMMENT ON COLUMN analytics_alerts.channels IS '알림 채널 (JSON 배열, email, webhook 등)';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_user_id ON analytics_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_type ON analytics_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_metric_name ON analytics_alerts(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_is_active ON analytics_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_last_triggered ON analytics_alerts(last_triggered_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER trigger_update_analytics_alerts_updated_at
  BEFORE UPDATE ON analytics_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configs_updated_at();

-- =====================================================
-- 데이터 보존 정책 (선택 사항)
-- =====================================================
-- 오래된 데이터 자동 삭제를 위한 함수 (선택적으로 사용)

CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void AS $$
BEGIN
  -- 90일 이상 된 이벤트 삭제
  DELETE FROM analytics_events
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- 180일 이상 된 세션 삭제
  DELETE FROM analytics_sessions
  WHERE started_at < now() - INTERVAL '180 days';
  
  -- 집계된 메트릭은 보존 (삭제하지 않음)
  -- analytics_metrics는 삭제하지 않음
  
  -- 1년 이상 된 리포트 삭제
  DELETE FROM analytics_reports
  WHERE created_at < now() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_analytics_data IS '오래된 분석 데이터 정리 함수 (90일 이상 이벤트, 180일 이상 세션, 1년 이상 리포트 삭제)';

