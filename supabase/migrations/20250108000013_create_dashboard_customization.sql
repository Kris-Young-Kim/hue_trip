/**
 * @file 20250108000013_create_dashboard_customization.sql
 * @description 대시보드 커스터마이징을 위한 데이터베이스 스키마
 */

-- 대시보드 설정 테이블
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  layout_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 대시보드 위젯 테이블
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboard_configs(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- 'time_series', 'region_type', 'performance', 'cost', 'user_behavior', 'predictions', 'report', 'alert', 'data_export'
  widget_config JSONB DEFAULT '{}'::jsonb, -- 위젯별 설정 (크기, 위치, 필터 등)
  position INTEGER NOT NULL DEFAULT 0, -- 정렬 순서
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 대시보드 공유 테이블
CREATE TABLE IF NOT EXISTS dashboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboard_configs(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view', -- 'view', 'edit'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dashboard_id, shared_with_user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_user_id ON dashboard_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_is_default ON dashboard_configs(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_dashboard_id ON dashboard_shares(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_shared_with_user_id ON dashboard_shares(shared_with_user_id);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_dashboard_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dashboard_configs_updated_at
  BEFORE UPDATE ON dashboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configs_updated_at();

CREATE TRIGGER trigger_update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configs_updated_at();

CREATE TRIGGER trigger_update_dashboard_shares_updated_at
  BEFORE UPDATE ON dashboard_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configs_updated_at();

-- share_token 자동 생성 함수 (트리거에서 사용하지 않음, 애플리케이션에서 생성)

