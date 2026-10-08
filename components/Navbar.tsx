"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/chat", label: "政策问答" },
  { href: "/dashboard", label: "数据看板" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-farm-100">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-farm-gradient flex items-center justify-center text-white font-bold">
            农
          </div>
          <div className="leading-tight">
            <div className="font-bold text-farm-800">三农发展研究会</div>
            <div className="text-[10px] text-gray-500">Intelligent Portal</div>
          </div>
        </Link>

        {/* 桌面导航 */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-farm-50 text-farm-700"
                    : "text-gray-600 hover:bg-farm-50 hover:text-farm-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* 移动端菜单按钮 */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-farm-50"
          onClick={() => setOpen(!open)}
          aria-label="菜单"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* 移动端展开菜单 */}
      {open && (
        <div className="md:hidden border-t border-farm-100 bg-white">
          <div className="px-4 py-2 flex flex-col">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-farm-50 text-farm-700"
                      : "text-gray-600 hover:bg-farm-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
