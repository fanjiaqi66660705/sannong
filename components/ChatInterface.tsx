"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Citation {
  category: string;
  source: string;
}

interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  mode?: string;
}

const STORAGE_KEY = "sannong_chat_history";

const SUGGESTED_QUESTIONS = [
  "如何申请农业补贴？",
  "耕地地力保护补贴的标准是什么？",
  "农村土地流转的程序是什么？",
  "乡村振兴包括哪些方面？",
  "农机购置补贴怎么申请？",
];

/** 简易 HTML 转义，防止 XSS */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/** 将换行转为 <br>，加粗 **text** 转为 <strong> */
function formatAssistantContent(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 加载历史对话
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              "您好！我是三农政策智能问答助手 🤖\n我可以解答农业补贴、土地流转、乡村振兴、农村医保养老等政策问题。\n请问有什么可以帮您？",
          },
        ]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // 持久化 + 自动滚动
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        /* ignore */
      }
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // 自适应 textarea 高度
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    const userMsg: ChatMessageItem = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "请求失败");
      }
      const assistantMsg: ChatMessageItem = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        citations: data.citations,
        mode: data.mode,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "抱歉，回答生成失败，请检查网络后重试。" +
            (err instanceof Error ? `\n（${err.message}）` : ""),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "对话已清空。我是三农政策智能问答助手 🤖，请问有什么可以帮您？",
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-farm-800 mb-2">三农政策智能问答</h1>
        <p className="text-gray-600 text-sm">
          基于本地三农政策知识库 + 大语言模型，为您解答三农领域政策疑问
        </p>
      </div>

      {/* 推荐问题 */}
      {messages.length <= 1 && (
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-3 py-1.5 text-xs rounded-full bg-farm-50 text-farm-700 border border-farm-200 hover:bg-farm-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="panel flex flex-col h-[60vh] min-h-[420px] overflow-hidden">
        {/* 消息区 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`msg-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-farm-600 text-white rounded-br-sm"
                      : "bg-farm-50 text-gray-800 rounded-bl-sm border border-farm-100"
                  }`}
                >
                  {msg.role === "user" ? (
                    <span className="whitespace-pre-wrap">{escapeHtml(msg.content)}</span>
                  ) : (
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatAssistantContent(msg.content) }}
                    />
                  )}
                </div>

                {/* 引用来源 */}
                {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-1.5 px-1 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      来源：{msg.citations.map((c) => c.source).join("；")}
                    </span>
                    {msg.mode && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100">
                        {msg.mode === "knowledge+llm"
                          ? "知识库+大模型"
                          : msg.mode === "knowledge-only"
                          ? "知识库直出"
                          : "未命中"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-farm-50 border border-farm-100 rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-farm-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-farm-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-farm-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输入区 */}
        <form onSubmit={handleSubmit} className="border-t border-farm-100 p-3 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的三农政策问题，Enter 发送，Shift+Enter 换行"
              rows={1}
              className="input-field resize-none"
              disabled={loading}
            />
            <button type="submit" className="btn-primary !py-2.5" disabled={loading || !input.trim()}>
              发送
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">回答基于预设知识库，仅供参考</span>
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-farm-600 transition-colors"
            >
              清空对话
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
