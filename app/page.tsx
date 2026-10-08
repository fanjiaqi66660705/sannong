import Link from "next/link";

const features = [
  {
    title: "三农政策智能问答机器人",
    desc: "集成大语言模型与预设三农政策知识库，精准解答农业补贴申请、土地流转、乡村振兴等政策疑问，附带来源依据。",
    icon: "💬",
    color: "from-farm-500 to-farm-700",
    href: "/chat",
    cta: "开始提问",
    points: ["本地知识库检索匹配", "大模型生成准确回答", "回答附政策来源标注", "支持多轮对话追问"],
  },
  {
    title: "下乡调研数据可视化看板",
    desc: "输入杂乱的下乡调研文字记录，自动识别其中的类别与数值，一键生成柱状图、饼图，让调研结果一目了然。",
    icon: "📊",
    color: "from-wheat-400 to-wheat-600",
    href: "/dashboard",
    cta: "生成图表",
    points: ["自然语言文本解析", "自动提取数值与分类", "柱状图 / 饼图多维度展示", "一键导出与复用"],
  },
];

const stats = [
  { value: "200+", label: "政策知识条目" },
  { value: "2", label: "AI 核心能力" },
  { value: "100%", label: "响应式适配" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero 区域 */}
      <section className="relative overflow-hidden bg-farm-gradient text-white">
        {/* 背景装饰：麦田网格 */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-wheat-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-farm-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-wheat-300 animate-pulse" />
            智能官网 · 面试作品 Demo
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            以智能技术
            <span className="bg-gradient-to-r from-wheat-200 to-wheat-400 bg-clip-text text-transparent"> 赋能三农研究</span>
          </h1>
          <p className="text-lg md:text-xl text-farm-100 max-w-2xl mx-auto mb-10">
            三农发展研究会智能官网，整合政策智能问答与调研数据可视化两大 AI 能力，让政策解读更精准、调研分析更高效。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat" className="btn-primary bg-white text-farm-700 hover:bg-farm-50 !py-3">
              体验政策问答
              <span aria-hidden>→</span>
            </Link>
            <Link href="/dashboard" className="btn-secondary bg-transparent text-white border-white/40 hover:bg-white/10 !py-3">
              体验数据看板
            </Link>
          </div>

          {/* 统计数据 */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-wheat-300">{s.value}</div>
                <div className="text-xs text-farm-200 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 功能展示 */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-farm-800 mb-3">核心 AI 能力</h2>
          <p className="text-gray-600">两大亮点功能，覆盖政策咨询与调研分析全场景</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((f) => (
            <div key={f.title} className="panel p-8 hover:shadow-lg transition-shadow group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-farm-800 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{f.desc}</p>

              <ul className="space-y-2 mb-6">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-farm-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>

              <Link href={f.href} className="inline-flex items-center gap-1 text-farm-600 font-medium text-sm hover:gap-2 transition-all">
                {f.cta}
                <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 技术架构说明 */}
      <section className="bg-farm-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-farm-800 mb-3">技术架构</h2>
            <p className="text-gray-600">Next.js App Router + Tailwind CSS + Recharts</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { t: "前端框架", d: "Next.js 14 App Router" },
              { t: "样式方案", d: "Tailwind CSS 响应式" },
              { t: "AI 能力", d: "大模型 API + 本地知识库" },
              { t: "数据可视化", d: "Recharts 柱状图/饼图" },
            ].map((x) => (
              <div key={x.t} className="panel p-5 text-center">
                <div className="text-sm text-gray-500 mb-1">{x.t}</div>
                <div className="font-semibold text-farm-700">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
