/**
 * 下乡调研文本解析器
 * 将杂乱的调研文字记录转化为结构化数据，供图表渲染。
 *
 * 支持两种模式：
 * 1. 正则模式（默认，无需 API）：通过正则提取 "名称:数字单位" 形式的键值对
 * 2. 大模型模式（需 API Key）：调用 LLM 解析，准确度更高
 */

export interface DataPoint {
  name: string;
  value: number;
  unit?: string;
  category?: string;
}

export interface ParseResult {
  title: string;
  barData: DataPoint[]; // 柱状图数据：对比型数据
  pieData: DataPoint[]; // 饼图数据：占比型数据（百分比/构成）
  summary: string;
  source: "regex" | "llm";
}

/** 中文数字转阿拉伯数字（简单版，支持 0-99） */
function cnNumToInt(s: string): number {
  const map: Record<string, number> = {
    零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5,
    六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 百: 100, 千: 1000, 万: 10000,
  };
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  if (/^\d+$/.test(s)) return parseInt(s, 10);

  let result = 0;
  let temp = 0;
  for (const ch of s) {
    if (!(ch in map)) return NaN;
    const v = map[ch];
    if (v >= 10) {
      temp = temp === 0 ? 1 : temp;
      result += temp * v;
      temp = 0;
    } else {
      temp = v;
    }
  }
  return result + temp;
}

/** 常见单位归一化 */
const UNIT_MAP: Record<string, string> = {
  亩: "亩",
  万元: "万元",
  万: "万",
  元: "元",
  人: "人",
  户: "户",
  头: "头",
  只: "只",
  吨: "吨",
  公斤: "公斤",
  千克: "千克",
  "%": "%",
  "％": "%",
};

/** 从文本中识别单位 */
function detectUnit(text: string): string | undefined {
  for (const u of Object.keys(UNIT_MAP)) {
    if (text.includes(u)) return UNIT_MAP[u];
  }
  return undefined;
}

/**
 * 正则解析：提取 "名称:数字单位" 或 "名称数字单位" 形式的键值对
 * 例如：
 *   "张村种植面积300亩" → {name:"张村", value:300, unit:"亩"}
 *   "种植业收入占40%" → {name:"种植业", value:40, unit:"%"}
 */
export function parseByRegex(text: string): ParseResult {
  const result: ParseResult = {
    title: "调研数据分析",
    barData: [],
    pieData: [],
    summary: "",
    source: "regex",
  };

  if (!text.trim()) return result;

  // 尝试提取标题（第一行或首个"："前的内容）
  const firstLine = text.split(/\n/)[0].trim();
  if (firstLine.length <= 30 && !firstLine.includes("：") && !firstLine.includes(":")) {
    result.title = firstLine;
  } else if (firstLine.includes("：")) {
    result.title = firstLine.split(/[：:]/)[0].trim().slice(0, 30) || "调研数据分析";
  }

  // 模式1：名称 + 数字 + 可选单位（支持百分号）
  // 匹配形如 "张村300亩"、"种植业40%"、"收入120万元"
  // 数字组仅匹配阿拉伯数字或中文数字（零一二三四五六七八九十百千万两）
  const CN_NUM = "零一二三四五六七八九十百千万两";
  const pattern1 = new RegExp(
    `([\\u4e00-\\u9fa5A-Za-z]{2,12}?)[:：]?\\s*([\\d.]+|[${CN_NUM}]{1,8})\\s*(万元|万|元|亩|人|户|头|只|吨|公斤|千克|%|％)?`,
    "g"
  );

  const seen = new Set<string>();
  const points: DataPoint[] = [];

  let m: RegExpExecArray | null;
  while ((m = pattern1.exec(text)) !== null) {
    const rawName = m[1].trim();
    const rawNum = m[2].trim();
    const rawUnit = m[3];
    const value = cnNumToInt(rawNum);

    // 过滤无效项
    if (
      !rawName ||
      isNaN(value) ||
      value <= 0 ||
      rawName.length > 12 ||
      // 过滤掉常见的非数据词
      /^(今年|去年|本次|调研|发现|其中|共计|总计|合计|平均|总|共|约|超过|达到)$/.test(rawName)
    ) {
      continue;
    }

    const key = `${rawName}|${value}|${rawUnit || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    points.push({
      name: rawName,
      value,
      unit: rawUnit ? UNIT_MAP[rawUnit] || rawUnit : undefined,
    });
  }

  // 区分饼图数据（百分比）与柱状图数据
  for (const p of points) {
    if (p.unit === "%") {
      result.pieData.push(p);
    } else {
      result.barData.push(p);
    }
  }

  // 限制数据条数，避免图表过挤
  if (result.barData.length > 12) result.barData = result.barData.slice(0, 12);
  if (result.pieData.length > 8) result.pieData = result.pieData.slice(0, 8);

  // 生成摘要
  const parts: string[] = [];
  if (result.barData.length > 0) {
    const max = result.barData.reduce((a, b) => (b.value > a.value ? b : a));
    parts.push(`共识别到 ${result.barData.length} 组对比数据，其中"${max.name}"数值最高（${max.value}${max.unit || ""}）。`);
  }
  if (result.pieData.length > 0) {
    const total = result.pieData.reduce((s, p) => s + p.value, 0);
    parts.push(`识别到 ${result.pieData.length} 项构成占比数据，合计约 ${total.toFixed(0)}%。`);
  }
  if (parts.length === 0) {
    result.summary = "未能从文本中识别到可图表化的数值数据。请尝试包含具体数字与单位的表述，如'张村种植面积300亩'。";
  } else {
    result.summary = parts.join(" ");
  }

  return result;
}

/**
 * 大模型解析：将文本交给 LLM，要求其输出 JSON 格式的结构化数据
 */
export async function parseByLLM(text: string): Promise<ParseResult> {
  // 动态导入避免在未配置时也加载
  const { callLLM } = await import("./llm");

  const systemPrompt = `你是一个下乡调研数据分析助手。请从用户提供的调研文本中提取可用于图表展示的数据。

请严格按以下 JSON 格式输出，不要输出任何额外文字：
{
  "title": "数据标题（简短，不超过20字）",
  "barData": [{"name":"类别名","value":数字,"unit":"单位（可选）"}],
  "pieData": [{"name":"类别名","value":百分比数字,"unit":"%"}],
  "summary": "一句话数据分析摘要"
}

规则：
1. barData 存放对比型数据（如各村种植面积、收入等），value 为数字。
2. pieData 存放占比/构成型数据（百分比），value 为 0-100 的数字。
3. name 必须是有意义的类别名称（如村名、产业类型），不要用'其中'、'共计'等词。
4. 若文本中没有可图表化数据，barData 和 pieData 返回空数组，并在 summary 说明。
5. 只输出合法 JSON，不要包含 markdown 代码块标记。`;

  const { content, usedLLM } = await callLLM(
    [{ role: "user", content: text }],
    systemPrompt
  );

  if (!usedLLM || !content) {
    // LLM 不可用，回退到正则
    return parseByRegex(text);
  }

  // 提取 JSON（可能被 markdown 包裹）
  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];

  try {
    const parsed = JSON.parse(jsonStr) as {
      title?: string;
      barData?: DataPoint[];
      pieData?: DataPoint[];
      summary?: string;
    };
    return {
      title: parsed.title || "调研数据分析",
      barData: Array.isArray(parsed.barData) ? parsed.barData : [],
      pieData: Array.isArray(parsed.pieData) ? parsed.pieData : [],
      summary: parsed.summary || "数据已由大模型解析完成。",
      source: "llm",
    };
  } catch {
    // JSON 解析失败，回退正则
    return parseByRegex(text);
  }
}
