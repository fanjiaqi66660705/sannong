import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "三农发展研究会 | 智能官网",
  description:
    "三农发展研究会智能官网 - 提供三农政策智能问答机器人与下乡调研数据可视化看板，助力乡村振兴研究。",
  keywords: ["三农", "乡村振兴", "农业政策", "调研报告", "数据可视化"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
