import { NextResponse } from "next/server";

// 处理 Trae 浏览器注入的 Vite HMR 客户端请求，返回空脚本避免 404 干扰
export async function GET() {
  return new NextResponse("// vite client stub for Trae browser compatibility", {
    headers: { "Content-Type": "application/javascript" },
  });
}
