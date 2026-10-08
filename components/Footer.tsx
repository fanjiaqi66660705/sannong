import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-farm-900 text-farm-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-farm-600 flex items-center justify-center text-white font-bold">
              农
            </div>
            <div className="font-bold text-white">三农发展研究会</div>
          </div>
          <p className="text-sm text-farm-200 leading-relaxed">
            聚焦农业、农村、农民问题研究，以智能技术赋能乡村振兴，打造政策解读与调研分析一体化平台。
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">快捷导航</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-wheat-300 transition-colors">首页</Link></li>
            <li><Link href="/chat" className="hover:text-wheat-300 transition-colors">三农政策问答</Link></li>
            <li><Link href="/dashboard" className="hover:text-wheat-300 transition-colors">调研数据看板</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">技术亮点</h4>
          <ul className="space-y-2 text-sm text-farm-200">
            <li>· 大模型驱动的政策智能问答</li>
            <li>· 本地三农知识库精准检索</li>
            <li>· 调研文本自动结构化与可视化</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-farm-800">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-farm-300 text-center">
          © {new Date().getFullYear()} 三农发展研究会 · 智能官网 Demo · 仅供学习与面试展示使用
        </div>
      </div>
    </footer>
  );
}
