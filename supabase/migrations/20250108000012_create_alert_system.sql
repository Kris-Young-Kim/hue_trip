-- =====================================================
-- 마이그레이션: 시스템 알림 테이블 추가
-- 작성일: 2025-01-08
-- 설명: 관리자용 시스템 알림 및 알림 규칙 관리
-- =====================================================

-- =====================================================
-- alert_rules 테이블: 알림 규칙 저장
-- =====================================================

CREATE TABLE public.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 규칙 이름
    description TEXT, -- 규칙 설명
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'user_count',
        'error_rate',
        'api_response_time',
        'page_load_time',
        'cost',
        'traffic',
        'performance'
    )), -- 모니터링할 지표 유형
    threshold_value NUMERIC NOT NULL, -- 임계값
    threshold_operator TEXT NOT NULL CHECK (threshold_operator IN ('>', '>=', '<', '<=', '==')), -- 비교 연산자
    check_interval_minutes INTEGER DEFAULT 5, -- 체크 간격 (분)
    enabled BOOLEAN DEFAULT true, -- 활성화 여부
    channels JSONB NOT NULL DEFAULT '[]'::jsonb, -- 알림 채널 (email, webhook 등)
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 생성자
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.alert_rules IS '알림 규칙 저장 테이블';
COMMENT ON COLUMN public.alert_rules.name IS '규칙 이름';
COMMENT ON COLUMN public.alert_rules.description IS '규칙 설명';
COMMENT ON COLUMN public.alert_rules.metric_type IS '모니터링할 지표 유형';
COMMENT ON COLUMN public.alert_rules.threshold_value IS '임계값';
COMMENT ON COLUMN public.alert_rules.threshold_operator IS '비교 연산자 (>, >=, <, <=, ==)';
COMMENT ON COLUMN public.alert_rules.check_interval_minutes IS '체크 간격 (분)';
COMMENT ON COLUMN public.alert_rules.channels IS '알림 채널 (JSON 배열: email, webhook 등)';

CREATE INDEX idx_alert_rules_enabled ON public.alert_rules (enabled);
CREATE INDEX idx_alert_rules_metric_type ON public.alert_rules (metric_type);

-- =====================================================
-- alert_history 테이블: 알림 발송 이력
-- =====================================================

CREATE TABLE public.alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.alert_rules(id) ON DELETE SET NULL, -- 알림 규칙 ID
    metric_type TEXT NOT NULL, -- 지표 유형
    metric_value NUMERIC NOT NULL, -- 실제 지표 값
    threshold_value NUMERIC NOT NULL, -- 임계값
    message TEXT NOT NULL, -- 알림 메시지
    channel TEXT NOT NULL CHECK (channel IN ('email', 'webhook', 'slack', 'discord')), -- 발송 채널
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')), -- 발송 상태
    sent_at TIMESTAMPTZ, -- 발송 시간
    error_message TEXT, -- 오류 메시지 (실패 시)
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.alert_history IS '알림 발송 이력 테이블';
COMMENT ON COLUMN public.alert_history.rule_id IS '알림 규칙 ID';
COMMENT ON COLUMN public.alert_history.metric_type IS '지표 유형';
COMMENT ON COLUMN public.alert_history.metric_value IS '실제 지표 값';
COMMENT ON COLUMN public.alert_history.threshold_value IS '임계값';
COMMENT ON COLUMN public.alert_history.message IS '알림 메시지';
COMMENT ON COLUMN public.alert_history.channel IS '발송 채널';
COMMENT ON COLUMN public.alert_history.status IS '발송 상태';

CREATE INDEX idx_alert_history_rule ON public.alert_history (rule_id);
CREATE INDEX idx_alert_history_created ON public.alert_history (created_at DESC);
CREATE INDEX idx_alert_history_status ON public.alert_history (status);

-- =====================================================
-- alert_channels 테이블: 알림 채널 설정
-- =====================================================

CREATE TABLE public.alert_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_type TEXT NOT NULL CHECK (channel_type IN ('email', 'webhook', 'slack', 'discord')), -- 채널 유형
    name TEXT NOT NULL, -- 채널 이름
    config JSONB NOT NULL, -- 채널 설정 (이메일 주소, 웹훅 URL 등)
    enabled BOOLEAN DEFAULT true, -- 활성화 여부
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 생성자
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.alert_channels IS '알림 채널 설정 테이블';
COMMENT ON COLUMN public.alert_channels.channel_type IS '채널 유형 (email, webhook, slack, discord)';
COMMENT ON COLUMN public.alert_channels.name IS '채널 이름';
COMMENT ON COLUMN public.alert_channels.config IS '채널 설정 (JSON 형식)';

CREATE INDEX idx_alert_channels_type ON public.alert_channels (channel_type);
CREATE INDEX idx_alert_channels_enabled ON public.alert_channels (enabled);

-- =====================================================
-- 업데이트 트리거: updated_at 자동 업데이트
-- =====================================================

CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_alert_rules_updated_at
    BEFORE UPDATE ON public.alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_rules_updated_at();

CREATE OR REPLACE FUNCTION update_alert_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_alert_channels_updated_at
    BEFORE UPDATE ON public.alert_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_channels_updated_at();

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 시스템 알림 테이블 생성 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   1. alert_rules (알림 규칙)';
    RAISE NOTICE '   2. alert_history (알림 발송 이력)';
    RAISE NOTICE '   3. alert_channels (알림 채널 설정)';
END $$;

