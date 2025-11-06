-- 피드백 저장 테이블 생성
-- 사용자 피드백(버그 리포트, 기능 제안 등)을 저장하는 테이블

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- 비인증 사용자도 피드백 가능하므로 NULL 허용
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'other')), -- 피드백 유형
  title TEXT NOT NULL, -- 제목
  description TEXT NOT NULL, -- 상세 설명
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')), -- 우선순위 (관리자 설정)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')), -- 상태
  contact_email TEXT, -- 연락처 이메일 (선택 사항)
  page_url TEXT, -- 피드백 관련 페이지 URL (선택 사항)
  user_agent TEXT, -- 사용자 브라우저 정보 (선택 사항)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_feedback_type ON feedback(type);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- 코멘트 추가
COMMENT ON TABLE feedback IS '사용자 피드백 저장 테이블 (버그 리포트, 기능 제안 등)';
COMMENT ON COLUMN feedback.user_id IS '피드백 작성자 ID (NULL 허용: 비인증 사용자도 피드백 가능)';
COMMENT ON COLUMN feedback.type IS '피드백 유형: bug(버그), feature(기능 제안), improvement(개선사항), other(기타)';
COMMENT ON COLUMN feedback.priority IS '우선순위: low(낮음), medium(보통), high(높음) - 관리자가 설정';
COMMENT ON COLUMN feedback.status IS '처리 상태: pending(대기), reviewing(검토중), resolved(해결됨), rejected(거절됨)';

