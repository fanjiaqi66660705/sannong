import { NextRequest, NextResponse } from "next/server";
import { parseByRegex, parseByLLM, type ParseResult } from "@/lib/text-parser";
import { isLLMConfigured } from "@/lib/llm";

export const runtime = "nodejs";

export interface AnalyzeRequestBody {
  text: string;
}

export interface AnalyzeResponseBody extends ParseResult {
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequestBody;
    const text = (body?.text || "").trim();

    if (!text) {
      return NextResponse.json(
        { error: "请输入调研文本内容" } as AnalyzeResponseBody,
        { status: 400 }
      );
    }

    // 文本过长时截断，避免超出 LLM 上下文
    const truncated = text.length > 8000 ? text.slice(0, 8000) : text;

    const useLLM =
      process.env.ANALYZE_USE_LLM !== "false" && isLLMConfigured();

    let result: ParseResult;
    if (useLLM) {
      result = await parseByLLM(truncated);
    } else {
      result = parseByRegex(truncated);
    }

    return NextResponse.json(result as AnalyzeResponseBody);
  } catch (err: unknown) {
    console.error("[analyze API 错误]", err);
    return NextResponse.json(
      { error: "解析失败，请稍后重试" } as AnalyzeResponseBody,
      { status: 500 }
    );
  }
}
