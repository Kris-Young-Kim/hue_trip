/**
 * @file footer-nav.tsx
 * @description FNB (Foot Navigation Bar) 컴포넌트
 *
 * 푸터 네비게이션 바 - 페이지 하단의 네비게이션 및 정보
 *
 * 주요 기능:
 * 1. 주요 링크 네비게이션
 * 2. 소셜 미디어 링크
 * 3. 저작권 정보
 * 4. API 제공자 정보
 *
 * 접근성:
 * - ARIA 라벨 및 역할 정의
 * - 키보드 네비게이션 지원
 * - 스크린 리더 지원
 *
 * @dependencies
 * - next/link: 라우팅
 * - lucide-react: 아이콘
 */

"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterNavProps {
  className?: string;
}

const footerLinks = {
  main: [
    { href: "/", label: "홈" },
    { href: "/safety", label: "안전 수칙" },
    { href: "/feedback", label: "피드백" },
  ],
  about: [
    { href: "/about", label: "서비스 소개" },
    { href: "/terms", label: "이용약관" },
    { href: "/privacy", label: "개인정보처리방침" },
  ],
  support: [
    { href: "/faq", label: "자주 묻는 질문" },
    { href: "/contact", label: "문의하기" },
    { href: "https://www.gocamping.or.kr", label: "고캠핑 API", external: true },
  ],
};

const socialLinks = [
  { href: "#", label: "Facebook", icon: Facebook },
  { href: "#", label: "Twitter", icon: Twitter },
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "mailto:contact@pitchcamping.com", label: "이메일", icon: Mail },
];

export function FooterNav({ className }: FooterNavProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
        className
      )}
      role="contentinfo"
      aria-label="푸터 네비게이션"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 브랜드 섹션 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pitch Camping</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              전국의 캠핑장 정보를 한눈에 확인하고, 안전하고 즐거운 캠핑 여행을 계획하세요.
            </p>
            {/* 소셜 미디어 링크 */}
            <div className="flex items-center gap-3" role="list" aria-label="소셜 미디어 링크">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    aria-label={social.label}
                    role="listitem"
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 주요 링크 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">주요 링크</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.main.map((link) => (
                <li key={link.href} role="listitem">
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 서비스 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">서비스 정보</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.about.map((link) => (
                <li key={link.href} role="listitem">
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">지원</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.support.map((link) => (
                <li key={link.href} role="listitem">
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md inline-flex items-center gap-1"
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-3 h-3" aria-hidden="true" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} Pitch Camping. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-right">
              데이터 제공:{" "}
              <a
                href="https://www.gocamping.or.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md"
              >
                한국관광공사 고캠핑
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

