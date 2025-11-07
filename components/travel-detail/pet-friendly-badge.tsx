/**
 * @file pet-friendly-badge.tsx
 * @description 반려동물 동반 여행지 뱃지 컴포넌트
 *
 * 반려동물 동반 가능 여행지를 표시하는 뱃지 컴포넌트
 *
 * 주요 기능:
 * 1. 반려동물 동반 가능 여행지 뱃지 표시
 * 2. 다양한 크기 및 스타일 지원
 *
 * @dependencies
 * - lucide-react: Heart 아이콘
 */

"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PetFriendlyBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PetFriendlyBadge({ size = "md", className }: PetFriendlyBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full",
        sizeClasses[size],
        className
      )}
      aria-label="반려동물 동반 가능"
    >
      <Heart className={cn("fill-current", iconSizes[size])} aria-hidden="true" />
      <span>반려동물 동반 가능</span>
    </span>
  );
}

