import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge, buildContext, type KnowledgeItem } from "@/lib/knowledge-base";
import { callLLM, isLLMConfigured } from "@/lib/llm";

export const runtime = "nodejs";

export interface ChatRequestBody {
  message: string;
}

export interface ChatResponseBody {
  answer: string;
  citations: { category: string; source: string }[];
  usedLLM: boolean;
  mode: "knowledge+llm" | "knowledge-only" | "fallback";
}

/** 构建系统提示词，限定大模型基于知识库回答 */
function buildSystemPrompt(context: string): string {
  return `你是"三农发展研究会"的智能政策问答助手，专注于农业、农村、农民（三农）领域的政策咨询。

请严格遵循以下规则：
1. 回答必须基于下方【知识库参考资料】，不得编造知识库中没有的政策内容。
2. 若知识库参考资料为空或与问题无关，请明确告知用户"知识库中暂无相关政策依据"，并建议咨询当地农业农村部门，不要编造答案。
3. 回答要条理清晰，优先使用分点列出，语言通俗易懂，贴合农民群众。
4. 回答末尾用"—— 参考来源：xxx"的形式标注信息来源。
5. 不要回答与三农政策无关的问题，礼貌引导用户回到三农话题。

【知识库参考资料】
${context}`;
}

/** 从知识库条目直接拼接回答（降级模式） */
function buildFallbackAnswer(items: KnowledgeItem[]): string {
  if (items.length === 0) {
    return "抱歉，我未能在三农政策知识库中找到与您问题相关的内容。建议您咨询当地乡镇农业农村部门或村委会，以获取最新、最准确的政策信息。";
  }
  const parts = items.map((it) => `${it.answer}\n\n—— 参考来源：${it.source}`);
  return parts.join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const message = (body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "请输入您的问题" },
        { status: 400 }
      );
    }

    // 1. 检索知识库
    const relevantItems = searchKnowledge(message, 3);
    const context = buildContext(relevantItems);

    // 2. 构造引用来源
    const citations = relevantItems.map((it) => ({
      category: it.category,
      source: it.source,
    }));

    // 3. 决定回答模式
    const allowFallbackLLM = process.env.CHAT_ALLOW_FALLBACK_LLM !== "false";
    const llmReady = isLLMConfigured() && allowFallbackLLM;

    // 知识库有命中 → 优先使用 LLM 润色；无 LLM 则直出知识库答案
    if (relevantItems.length > 0 && llmReady) {
      const { content, usedLLM } = await callLLM(
        [{ role: "user", content: message }],
        buildSystemPrompt(context)
      );
      if (usedLLM && content.trim()) {
        return NextResponse.json({
          answer: content.trim(),
          citations,
          usedLLM: true,
          mode: "knowledge+llm",
        });
      }
    }

    // 降级：直接输出知识库答案
    return NextResponse.json({
      answer: buildFallbackAnswer(relevantItems),
      citations,
      usedLLM: false,
      mode: relevantItems.length > 0 ? "knowledge-only" : "fallback",
    });
  } catch (err: unknown) {
    console.error("[chat API 错误]", err);
    return NextResponse.json(
      { error: "服务繁忙，请稍后重试" },
      { status: 500 }
    );
  }
}
