/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import {Building2, ClipboardList, ShieldAlert, AlertTriangle,ArrowUpRight, SlidersHorizontal, X,} from "lucide-react";
import {AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,Tooltip, ResponsiveContainer, Cell,} from "recharts";

// TYPES
type DashboardStats = {
  totalCompanies: number;
  totalAssessments: number;
  pendingAssessments: number;
  inProgressAssessments: number;
  completedAssessments: number;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
};
type RecentFinding = {
  id: string; title: string; severity: string; category: string;
  createdAt: string; assessment: { company: { name: string } };
};
type RecentAssessment = {
  id: string; name: string; status: string; createdAt: string;
  company: { name: string };
};
type DashboardResponse = {
  stats: DashboardStats;
  recentFindings: RecentFinding[];
  recentAssessments: RecentAssessment[];
};

// CONSTANTS
const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-yellow-50 text-yellow-700 border border-yellow-200",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  completed:   "bg-green-50 text-green-700 border border-green-200",
};
const SEVERITY_BAR: Record<string, string> = {
  critical: "bg-red-500", high: "bg-orange-400",
  medium: "bg-yellow-400", low: "bg-green-500",
};
const BAR_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
const TOOLTIP_STYLE = {
  fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)", background: "#fff",
};

// BADGES
function SeverityBadge({ severity }: { severity?: string | null }) {
  if (!severity) return <span className="px-2 py-1 rounded-full text-xs border bg-gray-100 text-gray-400 border-gray-200">—</span>;
  const normalized = severity.toUpperCase();
  const styles: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
    LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return <span className={`px-2 py-1 rounded-full text-xs border font-medium ${styles[normalized] || "bg-gray-100 text-gray-500 border-gray-200"}`}>{normalized}</span>;
}
function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/ /g, "_");
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[key] ?? "bg-gray-100 text-gray-600"}`}>{status.replace(/_/g, " ")}</span>;
}

// DETAIL PANELS
function CompaniesDetail({ stats, recentAssessments }: { stats: DashboardStats; recentAssessments: RecentAssessment[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total", value: stats.totalCompanies, color: "text-indigo-600" },
          { label: "Assessments", value: stats.totalAssessments, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Recent Assessments</p>
        <div className="space-y-2">
          {recentAssessments.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-xs font-medium text-gray-800">{a.company.name}</p>
                <p className="text-[10px] text-gray-400">{new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssessmentsDetail({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Pending", value: stats.pendingAssessments, color: "bg-yellow-400", text: "text-yellow-700" },
    { label: "In Progress", value: stats.inProgressAssessments, color: "bg-blue-400", text: "text-blue-700" },
    { label: "Completed", value: stats.completedAssessments, color: "bg-green-400", text: "text-green-700" },
  ];
  const total = stats.totalAssessments || 1;
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-4xl font-bold text-blue-600">{stats.totalAssessments}</p>
        <p className="text-xs text-gray-400 mt-1">Total Assessments</p>
      </div>
      <div className="space-y-3">
        {items.map(({ label, value, color, text }) => {
          const pct = Math.round((value / total) * 100);
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${text}`}>{label}</span>
                <span className="text-xs text-gray-500">{value} <span className="text-gray-300">({pct}%)</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FindingsDetail({ stats }: { stats: DashboardStats }) {
  const severityData = [
    { label: "Critical", value: stats.criticalFindings, key: "critical" },
    { label: "High", value: stats.highFindings, key: "high" },
    { label: "Medium", value: stats.mediumFindings, key: "medium" },
    { label: "Low", value: stats.lowFindings, key: "low" },
  ];
  const total = stats.totalFindings || 1;
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-4xl font-bold text-orange-500">{stats.totalFindings}</p>
        <p className="text-xs text-gray-400 mt-1">Total Findings</p>
      </div>
      <div className="space-y-3">
        {severityData.map(({ label, value, key }) => {
          const pct = Math.round((value / total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{label}</span>
                <span className="text-xs text-gray-500">{value} <span className="text-gray-300">({pct}%)</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${SEVERITY_BAR[key]} transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CriticalDetail({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Critical", value: stats.criticalFindings, bar: "bg-red-500", text: "text-red-600" },
    { label: "High", value: stats.highFindings, bar: "bg-orange-400", text: "text-orange-600" },
  ];
  return (
    <div className="space-y-4">
      <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
        <p className="text-4xl font-bold text-red-600">{stats.criticalFindings}</p>
        <p className="text-xs text-red-400 mt-1">Critical Findings</p>
      </div>
      <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
        <p className="text-4xl font-bold text-orange-500">{stats.highFindings}</p>
        <p className="text-xs text-orange-400 mt-1">High Severity</p>
      </div>
      <p className="text-xs text-gray-400 text-center">
        {stats.criticalFindings + stats.highFindings} findings require immediate attention
      </p>
      <div className="space-y-2">
        {items.map(({ label, value, bar, text }) => {
          const pct = stats.totalFindings ? Math.round((value / stats.totalFindings) * 100) : 0;
          return (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className={`text-xs font-medium ${text}`}>{label}</span>
                <span className="text-xs text-gray-400">{pct}% of total</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// MAIN COMPONENT
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    apiClient.get("/dashboard/admin")
      .then((res) => setDashboard(res.data))
      .catch((err) => console.error("Dashboard Error", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = (key: string) => {
    if (activeCard === key) {
      // close
      setVisible(false);
      setTimeout(() => setActiveCard(null), 300);
      return;
    }
    if (activeCard) {
      // switch
      setVisible(false);
      setTimeout(() => {
        setActiveCard(key);
        setTimeout(() => setVisible(true), 50);
      }, 200);
    } else {
      // open
      setActiveCard(key);
      setAnimating(true);
      setTimeout(() => { setVisible(true); setAnimating(false); }, 50);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setActiveCard(null), 300);
  };

  if (loading) return <AppLayout><div className="p-6 text-sm text-gray-400">Loading dashboard…</div></AppLayout>;
  if (!dashboard) return <AppLayout><div className="p-6 text-sm text-red-500">Failed to load dashboard.</div></AppLayout>;

  const { stats, recentFindings, recentAssessments } = dashboard;

  const areaData = [
    { month: "Jan", current: 0, prev: 0 },
    { month: "Feb", current: Math.round(stats.totalFindings * 0.3), prev: Math.round(stats.totalFindings * 0.5) },
    { month: "Mar", current: Math.round(stats.totalFindings * 0.55), prev: Math.round(stats.totalFindings * 0.35) },
    { month: "Apr", current: Math.round(stats.totalFindings * 0.4), prev: Math.round(stats.totalFindings * 0.6) },
    { month: "May", current: Math.round(stats.totalFindings * 0.7), prev: Math.round(stats.totalFindings * 0.45) },
    { month: "Jun", current: Math.round(stats.totalFindings * 0.5), prev: Math.round(stats.totalFindings * 0.3) },
    { month: "Jul", current: stats.totalFindings, prev: Math.round(stats.totalFindings * 0.55) },
  ];

  const severityBarData = [
    { name: "Critical", value: stats.criticalFindings },
    { name: "High", value: stats.highFindings },
    { name: "Medium", value: stats.mediumFindings },
    { name: "Low", value: stats.lowFindings },
  ];

  const totalFindings = stats.totalFindings || 1;
  const severityRows = [
    { label: "Critical", count: stats.criticalFindings, key: "critical" },
    { label: "High", count: stats.highFindings, key: "high" },
    { label: "Medium", count: stats.mediumFindings, key: "medium" },
    { label: "Low", count: stats.lowFindings, key: "low" },
  ];

  const kpis = [
    {
      key: "companies",
      label: "Total Companies",
      value: stats.totalCompanies,
      icon: <Building2 className="w-4 h-4 text-indigo-500" />,
      sub: `${stats.totalAssessments} assessments`,
      dotColor: "bg-indigo-400",
      activeRing: "ring-indigo-400",
    },
    {
      key: "assessments",
      label: "Total Assessments",
      value: stats.totalAssessments,
      icon: <ClipboardList className="w-4 h-4 text-blue-500" />,
      sub: `${stats.completedAssessments} completed`,
      dotColor: "bg-green-400",
      activeRing: "ring-blue-400",
    },
    {
      key: "findings",
      label: "Total Findings",
      value: stats.totalFindings,
      icon: <ShieldAlert className="w-4 h-4 text-orange-500" />,
      sub: `${stats.pendingAssessments} pending review`,
      dotColor: "bg-orange-400",
      activeRing: "ring-orange-400",
    },
    {
      key: "critical",
      label: "Critical Findings",
      value: stats.criticalFindings,
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      sub: `${stats.highFindings} high severity`,
      dotColor: "bg-red-400",
      activeRing: "ring-red-400",
    },
  ];

  const detailTitle: Record<string, string> = {
    companies: "Companies Overview",
    assessments: "Assessments Breakdown",
    findings: "Findings Breakdown",
    critical: "Critical & High Findings",
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-5">

        {/* PAGE HEADER */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Detailed overview of your security posture</p>
        </div>

        {/* KPI ROW */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const isActive = activeCard === kpi.key;
            return (
              <button
                key={kpi.key}
                onClick={() => handleCardClick(kpi.key)}
                className={`bg-white border rounded-xl p-4 text-left transition-all duration-200 cursor-pointer hover:shadow-md
                  ${isActive ? `border-transparent ring-2 ${kpi.activeRing} shadow-md` : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    {kpi.icon}
                    {kpi.label}
                  </div>
                  <ArrowUpRight className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-gray-600" : "text-gray-300"}`} />
                </div>
                <p className="text-3xl font-semibold text-gray-900 leading-none">{kpi.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-2 h-2 rounded-full ${kpi.dotColor}`} />
                  <span className="text-xs text-gray-400">{kpi.sub}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Area chart — 2/3 */}
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-800">Finding Trends</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />Current period</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />Previous period</span>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#e5e7eb" }} />
                  <Area type="monotone" dataKey="current" name="Current" stroke="#6366f1" strokeWidth={2} fill="url(#gCurrent)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
                  <Area type="monotone" dataKey="prev" name="Previous" stroke="#facc15" strokeWidth={2} fill="url(#gPrev)" dot={false} activeDot={{ r: 4, fill: "#facc15" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right panel — slides between bar chart and detail view */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 overflow-hidden relative">

            {/* Bar chart — default */}
            <div className={`transition-all duration-300 ease-in-out ${activeCard ? "opacity-0 translate-x-4 absolute inset-0 pointer-events-none p-5" : "opacity-100 translate-x-0"}`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-800">By Severity</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Critical</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Low</span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={severityBarData} barSize={22} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#f9fafb" }} />
                    <Bar dataKey="value" name="Findings" radius={[4, 4, 0, 0]}>
                      {severityBarData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detail panel — slides in */}
            <div className={`transition-all duration-300 ease-in-out ${activeCard && visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none p-5"}`}>
              {activeCard && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-800">{detailTitle[activeCard]}</p>
                    <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {activeCard === "companies" && <CompaniesDetail stats={stats} recentAssessments={recentAssessments} />}
                  {activeCard === "assessments" && <AssessmentsDetail stats={stats} />}
                  {activeCard === "findings" && <FindingsDetail stats={stats} />}
                  {activeCard === "critical" && <CriticalDetail stats={stats} />}
                </>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Recent Findings — 2/3 */}
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">Recent Findings</p>
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Severity", "Title", "Company", "Category", "Date"].map((h) => (
                    <th key={h} className="px-5 py-2.5 font-medium text-gray-400 uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentFindings.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3"><SeverityBadge severity={f.severity} /></td>
                    <td className="px-5 py-3 text-gray-800 font-medium truncate max-w-[160px]">{f.title}</td>
                    <td className="px-5 py-3 text-gray-500">{f.assessment.company.name}</td>
                    <td className="px-5 py-3 text-gray-400">{f.category}</td>
                    <td className="px-5 py-3 text-gray-400">{new Date(f.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Severity breakdown — 1/3 */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">Severity Breakdown</p>
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="px-5 py-4 space-y-4">
              {severityRows.map(({ label, count, key }) => {
                const pct = Math.round((count / totalFindings) * 100);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-600">{label}</span>
                      <span className="text-xs font-medium text-gray-800">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${SEVERITY_BAR[key]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100">
              <div className="px-5 py-3 border-b border-gray-50">
                <p className="text-xs font-medium text-gray-600">Recent Assessments</p>
              </div>
              <div className="divide-y divide-gray-50">
                {recentAssessments.slice(0, 4).map((a) => (
                  <div key={a.id} className="px-5 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">{a.company.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}