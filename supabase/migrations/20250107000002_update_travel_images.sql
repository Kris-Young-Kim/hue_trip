-- =====================================================
-- 마이그레이션: 여행지 이미지 업데이트
-- 작성일: 2025-01-07
-- 설명: Unsplash MCP를 사용하여 각 여행지에 맞는 고품질 이미지로 업데이트
-- =====================================================

-- 서울 지역 여행지 이미지 업데이트
UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1546417404-73e80b4a749b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126508' AND title = '경복궁';

UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1753012333052-9819bea0b179?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126507' AND title = '남산서울타워';

UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1577550753140-f1189b1959eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126506' AND title = '청계천';

UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1633353273310-74e804d1862a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126505' AND title = '북촌한옥마을';

UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1744792423727-d164009b42cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126504' AND title = '명동';

-- 부산 지역 여행지 이미지 업데이트
UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1708881419465-4d3d88035999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126503' AND title = '해운대해수욕장';

UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1733647781019-3a4d28ff86db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126502' AND title = '감천문화마을';

UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1611635431581-ff15168fce2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126501' AND title = '태종대 유원지';

-- 제주도 지역 여행지 이미지 업데이트
UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1621770401232-39a944faa2df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126500' AND title = '성산일출봉';

UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1605018720463-5ad050002e02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126499' AND title = '한라산';

-- 강원도 지역 여행지 이미지 업데이트
UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1635067463955-c55b153fe40f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126498' AND title = '남이섬';

-- 경기도 지역 여행지 이미지 업데이트
UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1762397931563-87966b53c4b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126497' AND title = '에버랜드';

-- 문화시설 이미지 업데이트
UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1546417404-73e80b4a749b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126496' AND title = '국립중앙박물관';

-- 음식점 이미지 업데이트
UPDATE public.travels 
SET firstimage = 'https://images.unsplash.com/photo-1744792423727-d164009b42cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
WHERE contentid = '126495' AND title = '명동교자';

