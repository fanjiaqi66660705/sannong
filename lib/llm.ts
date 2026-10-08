/**
 * 大语言模型 API 客户端
 * 支持 OpenAI 兼容格式（OpenAI / DeepSeek / Qwen / Kimi / 智谱等）
 *
 * 安全说明：API Key 仅在服务端通过环境变量读取，不会暴露到前端。
 * 未配置 API Key 时自动降级为"仅知识库"模式，保证演示可用性。
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/** 从环境变量读取 LLM 配置 */
export function getLLMConfig(): LLMConfig {
  return {
    baseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com/v1",
    apiKey: process.env.LLM_API_KEY || "",
    model: process.env.LLM_MODEL || "deepseek-chat",
  };
}

/** 是否已配置可用的大模型 API Key */
export function isLLMConfigured(): boolean {
  const { apiKey } = getLLMConfig();
  return !!apiKey && apiKey !== "sk-xxxxxxxxxxxxxxxx" && apiKey.trim().length > 0;
}

export interface LLMResponse {
  content: string;
  /** 是否使用了大模型（false 表示降级到知识库直出） */
  usedLLM: boolean;
}

/**
 * 调用大模型生成回答
 * @param messages 对话消息列表
 * @param systemPrompt 系统提示词
 * @returns 模型生成内容
 */
export async function callLLM(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<LLMResponse> {
  const cfg = getLLMConfig();

  // 未配置 API Key → 降级
  if (!isLLMConfigured()) {
    return {
      content: "",
      usedLLM: false,
    };
  }

  const finalMessages: ChatMessage[] = [];
  if (systemPrompt) {
    finalMessages.push({ role: "system", content: systemPrompt });
  }
  finalMessages.push(...messages);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s 超时

    const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: finalMessages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`LLM API 错误 (${resp.status}): ${errText.slice(0, 200)}`);
    }

    const data = await resp.json();
    const content: string = data.choices?.[0]?.message?.content || "";
    return { content, usedLLM: true };
  } catch (err: unknown) {
    // 超时或网络错误 → 降级
    console.error("[LLM 调用失败]", err instanceof Error ? err.message : String(err));
    return { content: "", usedLLM: false };
  }
}
