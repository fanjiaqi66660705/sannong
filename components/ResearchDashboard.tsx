"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
  unit?: string;
}

interface AnalyzeResult {
  title: string;
  barData: DataPoint[];
  pieData: DataPoint[];
  summary: string;
  source: "regex" | "llm";
}

const SAMPLE_TEXT = `青山乡下乡调研报告

本次调研走访了青山乡下辖的5个行政村，了解各村农业生产与农民收入情况。

一、各村耕地面积与粮食产量
张村耕地面积3200亩，粮食总产量1280吨；
李村耕地面积2800亩，粮食总产量1120吨；
王村耕地面积4100亩，粮食总产量1640吨；
赵村耕地面积1900亩，粮食总产量760吨；
陈村耕地面积3500亩，粮食总产量1400吨。

二、农民收入构成（全乡平均）
种植业收入占比42%，
养殖业收入占比23%，
外出务工收入占比28%，
财产性及转移性收入占比7%。

三、农户数量
张村农户420户，李村农户380户，王村农户510户，赵村农户260户，陈村农户460户。
`;

const PIE_COLORS = ["#2c6f2c", "#57a857", "#8bc88b", "#d48a1e", "#ebc05b", "#f2da93", "#b96916", "#964c15"];

const EMPTY_RESULT: AnalyzeResult = {
  title: "",
  barData: [],
  pieData: [],
  summary: "",
  source: "regex",
};

export default function ResearchDashboard() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("请输入调研文本");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "解析失败");
      }
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "解析失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setText(SAMPLE_TEXT);
    setError("");
  };

  const clearAll = () => {
    setText("");
    setResult(null);
    setError("");
  };

  const hasBar = !!result && result.barData.length > 0;
  const hasPie = !!result && result.pieData.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-farm-800 mb-2">下乡调研数据可视化看板</h1>
        <p className="text-gray-600 text-sm">
          粘贴杂乱的调研文字记录，自动识别数值并生成柱状图与饼图
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* 左侧：文本输入 */}
        <div className="lg:col-span-2 space-y-3">
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">调研文本</label>
              <div className="flex gap-2">
                <button onClick={loadSample} className="text-xs text-farm-600 hover:underline">
                  加载示例
                </button>
                <button onClick={clearAll} className="text-xs text-gray-400 hover:text-farm-600">
                  清空
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请粘贴下乡调研记录文本，例如：&#10;张村耕地面积3200亩，粮食产量1280吨；&#10;种植业收入占比42%，养殖业占比23%..."
              rows={16}
              className="input-field resize-none text-sm leading-relaxed"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="btn-primary w-full mt-3"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  解析中...
                </>
              ) : (
                <>一键生成图表</>
              )}
            </button>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>

          {/* 解析摘要 */}
          {result && (
            <div className="panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-farm-800">📋 解析摘要</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-farm-50 text-farm-600">
                  {result.source === "llm" ? "大模型解析" : "正则解析"}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-farm-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">对比数据</span>
                  <div className="text-lg font-bold text-farm-700">{result.barData.length} 组</div>
                </div>
                <div className="bg-wheat-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">占比数据</span>
                  <div className="text-lg font-bold text-wheat-600">{result.pieData.length} 项</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：图表展示 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 柱状图 */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-farm-800">📊 对比数据 · 柱状图</h3>
              {result?.title && (
                <span className="text-xs text-gray-400">{result.title}</span>
              )}
            </div>
            {hasBar ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result!.barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #dcf0dc", fontSize: 13 }}
                      formatter={(value, _name, props: any) => [
                        `${value}${props?.payload?.unit || ""}`,
                        "数值",
                      ]}
                    />
                    <Bar dataKey="value" fill="#2c6f2c" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart text={loading ? "正在解析..." : "暂无对比数据，输入含数值的调研文本后生成柱状图"} />
            )}
          </div>

          {/* 饼图 */}
          <div className="panel p-5">
            <h3 className="font-semibold text-farm-800 mb-4">🥧 构成占比 · 饼图</h3>
            {hasPie ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result!.pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {result!.pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #dcf0dc", fontSize: 13 }}
                      formatter={(value: number) => [`${value}%`, "占比"]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart text={loading ? "正在解析..." : "暂无占比数据，文本中包含百分比（如'种植业占42%'）时生成饼图"} />
            )}
          </div>

          {/* 数据明细表 */}
          {result && (hasBar || hasPie) && (
            <div className="panel p-5">
              <h3 className="font-semibold text-farm-800 mb-3">📑 数据明细</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-farm-100 text-left text-gray-500">
                      <th className="py-2 px-3">类别</th>
                      <th className="py-2 px-3">数值</th>
                      <th className="py-2 px-3">类型</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.barData.map((d, i) => (
                      <tr key={`b-${i}`} className="border-b border-gray-50 hover:bg-farm-50/50">
                        <td className="py-2 px-3 text-farm-700">{d.name}</td>
                        <td className="py-2 px-3 font-medium">{d.value}{d.unit || ""}</td>
                        <td className="py-2 px-3">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-farm-50 text-farm-600">对比</span>
                        </td>
                      </tr>
                    ))}
                    {result.pieData.map((d, i) => (
                      <tr key={`p-${i}`} className="border-b border-gray-50 hover:bg-wheat-50/50">
                        <td className="py-2 px-3 text-wheat-700">{d.name}</td>
                        <td className="py-2 px-3 font-medium">{d.value}%</td>
                        <td className="py-2 px-3">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-wheat-50 text-wheat-600">占比</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-72 flex items-center justify-center text-gray-400 text-sm bg-farm-50/30 rounded-xl border border-dashed border-farm-200">
      {text}
    </div>
  );
}
