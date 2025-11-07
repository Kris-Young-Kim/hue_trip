-- =====================================================
-- 마이그레이션: 관리자 권한 부여
-- 작성일: 2025-01-08
-- 설명: 특정 이메일 주소의 사용자에게 관리자 권한 부여
-- =====================================================

-- ⚠️ 주의: 이 SQL은 Clerk에서 사용자를 찾아야 하므로
--          먼저 해당 이메일로 로그인하여 Supabase에 동기화되어 있어야 합니다.
--          또는 Clerk Dashboard에서 사용자 ID를 확인한 후 사용하세요.

-- 방법 1: 이메일 주소로 관리자 권한 부여 (Clerk에서 이메일로 사용자 찾기)
-- ⚠️ 이 방법은 Clerk의 users 테이블에 직접 접근할 수 없으므로
--    먼저 사용자가 로그인하여 Supabase users 테이블에 동기화되어 있어야 합니다.

-- youngkiss3181@gmail.com 계정에 관리자 권한 부여
-- (이메일 주소로 사용자를 찾아서 업데이트)
UPDATE public.users
SET role = 'admin'
WHERE clerk_id IN (
  -- Clerk에서 이메일로 사용자를 찾을 수 없으므로,
  -- 먼저 사용자가 로그인하여 Supabase에 동기화되어 있어야 합니다.
  -- 또는 아래 방법 2를 사용하세요.
  SELECT clerk_id FROM public.users
  WHERE name LIKE '%youngkiss3181%' 
     OR clerk_id IN (
       -- Clerk Dashboard에서 확인한 사용자 ID를 여기에 입력
       -- 예: 'user_2abc123def456'
     )
)
AND role != 'admin';

-- 방법 2: Clerk User ID를 직접 사용 (권장)
-- Clerk Dashboard에서 사용자 ID를 확인한 후 아래 SQL을 실행하세요.
-- 
-- 1. Clerk Dashboard → Users → 사용자 선택
-- 2. 사용자 ID 복사 (예: user_2abc123def456)
-- 3. 아래 SQL에서 'YOUR_CLERK_USER_ID'를 실제 ID로 교체

-- youngkiss3181@gmail.com 계정 (Clerk User ID로 직접 설정)
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE clerk_id = 'YOUR_CLERK_USER_ID_FOR_youngkiss3181@gmail.com';

-- GitHub 계정 kris-young-kim (Clerk User ID로 직접 설정)
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE clerk_id = 'YOUR_CLERK_USER_ID_FOR_GITHUB_ACCOUNT';

-- 방법 3: 여러 사용자를 한 번에 관리자로 설정
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE clerk_id IN (
--   'user_2abc123def456',  -- youngkiss3181@gmail.com
--   'user_2xyz789ghi012'   -- GitHub 계정
-- );

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 관리자 권한 부여 SQL 준비 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 다음 단계:';
    RAISE NOTICE '   1. Clerk Dashboard에서 사용자 ID 확인';
    RAISE NOTICE '   2. 위의 방법 2 또는 3을 사용하여 SQL 실행';
    RAISE NOTICE '   3. 또는 관리자 페이지(/admin/users)에서 이메일로 검색하여 권한 부여';
    RAISE NOTICE '';
    RAISE NOTICE '💡 팁:';
    RAISE NOTICE '   - GitHub 계정의 경우, GitHub 이메일 주소를 확인해야 합니다.';
    RAISE NOTICE '   - 또는 관리자 페이지에서 이메일로 검색하여 권한을 부여할 수 있습니다.';
END $$;

