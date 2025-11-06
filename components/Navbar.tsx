/**
 * @file Navbar.tsx
 * @description GNB 컴포넌트 (레거시 호환)
 * 
 * GlobalNav 컴포넌트를 사용하도록 변경
 */

import { GlobalNav } from "@/components/navigation/global-nav";

export default function Navbar() {
  return <GlobalNav />;
}
