/**
 * @file 20250108000014_create_filter_presets.sql
 * @description 필터 프리셋 저장을 위한 데이터베이스 스키마
 */

-- 필터 프리셋 테이블
CREATE TABLE IF NOT EXISTS filter_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filter_type TEXT NOT NULL, -- 'travel', 'statistics', 'dashboard'
  filter_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- 필터 설정 (JSON)
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_filter_presets_user_id ON filter_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_filter_presets_filter_type ON filter_presets(user_id, filter_type);
CREATE INDEX IF NOT EXISTS idx_filter_presets_is_default ON filter_presets(user_id, is_default) WHERE is_default = true;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER trigger_update_filter_presets_updated_at
  BEFORE UPDATE ON filter_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configs_updated_at();

