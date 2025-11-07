-- =====================================================
-- 마이그레이션: 사용자 역할(role) 추가
-- 작성일: 2025-01-08
-- 설명: users 테이블에 role 컬럼 추가하여 관리자, 편집자, 비권한자 구분
--       role: 'admin' | 'editor' | 'user' (기본값: 'user')
-- =====================================================

-- users 테이블에 role 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user'));

-- role 컬럼에 인덱스 추가 (권한 체크 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE role IN ('admin', 'editor');

-- role 컬럼 설명 추가
COMMENT ON COLUMN public.users.role IS '사용자 역할: admin(관리자), editor(편집자), user(일반 사용자)';

-- 기존 사용자는 모두 'user' 역할로 설정 (이미 DEFAULT로 설정됨)
-- 특정 사용자를 관리자로 설정하려면 별도 UPDATE 실행 필요

-- 예시: 이메일로 관리자 권한 부여 (실제 이메일 주소로 변경 필요)
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE clerk_id IN (
--   SELECT id FROM clerk.users WHERE email_addresses @> '[{"email_address": "youngkiss3181@gmail.com"}]'::jsonb
-- );

-- 마이그레이션 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 사용자 역할(role) 컬럼 추가 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 역할 종류:';
    RAISE NOTICE '   - admin: 관리자 (모든 권한)';
    RAISE NOTICE '   - editor: 편집자 (일부 관리 기능)';
    RAISE NOTICE '   - user: 일반 사용자 (기본값)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 관리자 권한 부여 예시:';
    RAISE NOTICE '   UPDATE users SET role = ''admin'' WHERE clerk_id = ''user_xxx'';';
END $$;

