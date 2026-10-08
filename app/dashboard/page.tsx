"use client";

import dynamic from "next/dynamic";

const ResearchDashboard = dynamic(
  () => import("@/components/ResearchDashboard"),
  { ssr: false }
);

export default function DashboardPage() {
  return <ResearchDashboard />;
}
