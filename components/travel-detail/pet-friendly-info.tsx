/**
 * @file pet-friendly-info.tsx
 * @description 반려동물 동반 여행지 정보 컴포넌트
 *
 * 반려동물 동반 여행지의 상세 정보를 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 반려동물 시설 정보 표시 (펜션, 호텔, 카페 등)
 * 2. 반려동물 규정 및 주의사항 표시
 * 3. 반려동물 동반 만족도 표시 (추후 구현)
 *
 * @dependencies
 * - lib/supabase/server.ts: createClerkSupabaseClient
 * - lucide-react: 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { Heart, Info, AlertCircle, CheckCircle, XCircle, Dog, Cat } from "lucide-react";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { PetFriendlyBadge } from "./pet-friendly-badge";
import { cn } from "@/lib/utils";

interface PetFriendlyInfoData {
  id: string;
  travel_contentid: string;
  pet_types_allowed: string[] | null;
  pet_size_limit: string | null;
  pet_count_limit: number | null;
  requires_leash: boolean | null;
  requires_muzzle: boolean | null;
  has_pet_area: boolean | null;
  has_pet_restroom: boolean | null;
  has_pet_shower: boolean | null;
  has_pet_cafe: boolean | null;
  has_pet_hotel: boolean | null;
  pet_fee: number | null;
  pet_fee_description: string | null;
  restrictions: string | null;
  notes: string | null;
  verified: boolean;
}

interface PetFriendlyInfoProps {
  contentId: string;
  petFriendly?: boolean;
}

export function PetFriendlyInfo({ contentId, petFriendly }: PetFriendlyInfoProps) {
  const [info, setInfo] = useState<PetFriendlyInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useClerkSupabaseClient();

  useEffect(() => {
    const fetchInfo = async () => {
      if (!petFriendly) {
        setLoading(false);
        return;
      }

      console.group("[PetFriendlyInfo] 반려동물 동반 정보 조회 시작");
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("pet_friendly_info")
          .select("*")
          .eq("travel_contentid", contentId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("[PetFriendlyInfo] 정보 조회 실패:", fetchError);
          setError("반려동물 동반 정보를 불러오는데 실패했습니다.");
          return;
        }

        if (data) {
          console.log("[PetFriendlyInfo] 정보 조회 성공");
          setInfo(data);
        } else {
          console.log("[PetFriendlyInfo] 정보 없음 (기본 정보만 표시)");
        }
      } catch (err) {
        console.error("[PetFriendlyInfo] 정보 조회 오류:", err);
        setError("반려동물 동반 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetchInfo();
  }, [contentId, petFriendly, supabase]);

  if (!petFriendly) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            반려동물 동반 정보
          </h2>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            반려동물 동반 정보
          </h2>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Heart className="w-6 h-6 text-green-600 dark:text-green-400 fill-current" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          반려동물 동반 정보
        </h2>
        {info?.verified && (
          <span className="ml-auto px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
            검증됨
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* 허용되는 반려동물 종류 */}
        {info?.pet_types_allowed && info.pet_types_allowed.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Dog className="w-4 h-4" />
              허용되는 반려동물
            </h3>
            <div className="flex flex-wrap gap-2">
              {info.pet_types_allowed.map((type, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800"
                >
                  {type === "dog" ? "강아지" : type === "cat" ? "고양이" : type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 반려동물 규정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {info?.pet_size_limit && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">크기 제한</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {info.pet_size_limit === "all" 
                    ? "제한 없음" 
                    : info.pet_size_limit === "small" 
                    ? "소형견" 
                    : info.pet_size_limit === "medium"
                    ? "중형견"
                    : "대형견"}
                </p>
              </div>
            </div>
          )}

          {info?.pet_count_limit !== null && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">마리 수 제한</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {info.pet_count_limit === 0 ? "제한 없음" : `${info.pet_count_limit}마리`}
                </p>
              </div>
            </div>
          )}

          {info?.requires_leash !== null && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {info.requires_leash ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">목줄 필수</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {info.requires_leash ? "필수" : "선택"}
                </p>
              </div>
            </div>
          )}

          {info?.requires_muzzle !== null && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {info.requires_muzzle ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">입마개 필수</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {info.requires_muzzle ? "필수" : "선택"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 반려동물 시설 정보 */}
        {(info?.has_pet_area || 
          info?.has_pet_restroom || 
          info?.has_pet_shower || 
          info?.has_pet_cafe || 
          info?.has_pet_hotel) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              반려동물 시설
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {info.has_pet_area && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-900 dark:text-white">반려동물 전용 공간</span>
                </div>
              )}
              {info.has_pet_restroom && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-900 dark:text-white">반려동물 화장실</span>
                </div>
              )}
              {info.has_pet_shower && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-900 dark:text-white">반려동물 샤워 시설</span>
                </div>
              )}
              {info.has_pet_cafe && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-900 dark:text-white">반려동물 카페</span>
                </div>
              )}
              {info.has_pet_hotel && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-900 dark:text-white">반려동물 호텔/펜션</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 반려동물 추가 요금 */}
        {info?.pet_fee !== null && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              반려동물 추가 요금
            </h3>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {info.pet_fee === 0 ? "무료" : `₩${info.pet_fee.toLocaleString()}`}
              </p>
              {info.pet_fee_description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {info.pet_fee_description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 제한사항 및 주의사항 */}
        {info?.restrictions && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              제한사항 및 주의사항
            </h3>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                {info.restrictions}
              </p>
            </div>
          </div>
        )}

        {/* 기타 참고사항 */}
        {info?.notes && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              기타 참고사항
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
                {info.notes}
              </p>
            </div>
          </div>
        )}

        {/* 정보가 없는 경우 기본 메시지 */}
        {!info && (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              반려동물 동반이 가능한 여행지입니다.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              상세 정보는 여행지에 직접 문의해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

