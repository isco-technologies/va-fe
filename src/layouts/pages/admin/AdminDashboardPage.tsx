import { useEffect, useState } from "react";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import {Building2,ClipboardList,ShieldAlert,AlertTriangle,ArrowUpRight,SlidersHorizontal,} from "lucide-react";
import {AreaChart,Area,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Cell,} from "recharts";

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
  id: string;
  title: string;
  severity: string;
  category: string;
  createdAt: string;
  assessment: {
    company: {
      name: string;
    };
  };
};

type RecentAssessment = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  company: {
    name: string;
  };
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
  critical: "bg-red-500",
  high:     "bg-orange-400",
  medium:   "bg-yellow-400",
  low:      "bg-green-500",
};

const BAR_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  background: "#fff",
};

//  BADGES 

function SeverityBadge({
  severity,
}: {
  severity?: string | null;
}) {

  if (!severity) {
    return (
      <span className="px-2 py-1 rounded-full text-xs border bg-gray-100 text-gray-400 border-gray-200">
        —
      </span>
    );
  }

  const normalized =
    severity.toUpperCase();

  const styles: Record<
    string,
    string
  > = {
    CRITICAL:
      "bg-red-100 text-red-700 border-red-200",

    HIGH:
      "bg-orange-100 text-orange-700 border-orange-200",

    MEDIUM:
      "bg-amber-100 text-amber-700 border-amber-200",

    LOW:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs border font-medium ${
        styles[normalized] ||
        "bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      {normalized}
    </span>
  );
}
function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/ /g, "_");
  const label = status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[key] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

//  COMPONENT 

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    apiClient
      .get("/dashboard/admin")
      .then((res) => setDashboard(res.data))
      .catch((err) => console.error("Dashboard Error", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 text-sm text-gray-400">Loading dashboard…</div>
      </AppLayout>
    );
  }

  if (!dashboard) {
    return (
      <AppLayout>
        <div className="p-6 text-sm text-red-500">Failed to load dashboard.</div>
      </AppLayout>
    );
  }

  const { stats, recentFindings, recentAssessments } = dashboard;

  // Area chart: severity trend (current vs previous — using static shape since
  // the backend only provides totals; swap for real time-series when available)
  const areaData = [
    { month: "Jan", current: 0,                        prev: 0 },
    { month: "Feb", current: Math.round(stats.totalFindings * 0.3),  prev: Math.round(stats.totalFindings * 0.5) },
    { month: "Mar", current: Math.round(stats.totalFindings * 0.55), prev: Math.round(stats.totalFindings * 0.35) },
    { month: "Apr", current: Math.round(stats.totalFindings * 0.4),  prev: Math.round(stats.totalFindings * 0.6) },
    { month: "May", current: Math.round(stats.totalFindings * 0.7),  prev: Math.round(stats.totalFindings * 0.45) },
    { month: "Jun", current: Math.round(stats.totalFindings * 0.5),  prev: Math.round(stats.totalFindings * 0.3) },
    { month: "Jul", current: stats.totalFindings,                    prev: Math.round(stats.totalFindings * 0.55) },
  ];

  // Bar chart: severity breakdown by count
  const severityBarData = [
    { name: "Critical", value: stats.criticalFindings },
    { name: "High",     value: stats.highFindings },
    { name: "Medium",   value: stats.mediumFindings },
    { name: "Low",      value: stats.lowFindings },
  ];

  // Severity % bars for the "top sold item"-style panel
  const totalFindings = stats.totalFindings || 1;
  const severityRows = [
    { label: "Critical", count: stats.criticalFindings, key: "critical" },
    { label: "High",     count: stats.highFindings,     key: "high" },
    { label: "Medium",   count: stats.mediumFindings,   key: "medium" },
    { label: "Low",      count: stats.lowFindings,      key: "low" },
  ];

  const kpis = [
    {
      label: "Total Companies",
      value: stats.totalCompanies,
      icon: <Building2 className="w-4 h-4 text-indigo-500" />,
      sub: `${stats.totalAssessments} assessments`,
      dotColor: "bg-indigo-400",
    },
    {
      label: "Total Assessments",
      value: stats.totalAssessments,
      icon: <ClipboardList className="w-4 h-4 text-blue-500" />,
      sub: `${stats.completedAssessments} completed`,
      dotColor: "bg-green-400",
    },
    {
      label: "Total Findings",
      value: stats.totalFindings,
      icon: <ShieldAlert className="w-4 h-4 text-orange-500" />,
      sub: `${stats.pendingAssessments} pending review`,
      dotColor: "bg-orange-400",
    },
    {
      label: "Critical Findings",
      value: stats.criticalFindings,
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      sub: `${stats.highFindings} high severity`,
      dotColor: "bg-red-400",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-5">

        {/* ── PAGE HEADER ─────────────────────────────────────────── */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Detailed overview of your security posture
          </p>
        </div>

        {/* ── KPI ROW ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {kpi.icon}
                  {kpi.label}
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <p className="text-3xl font-semibold text-gray-900 leading-none">
                {kpi.value}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`w-2 h-2 rounded-full ${kpi.dotColor}`} />
                <span className="text-xs text-gray-400">{kpi.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Area chart — takes 2/3 width */}
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-800">Finding Trends</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                  Current period
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                  Previous period
                </span>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#facc15" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#e5e7eb" }} />
                  <Area type="monotone" dataKey="current" name="Current" stroke="#6366f1" strokeWidth={2} fill="url(#gCurrent)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
                  <Area type="monotone" dataKey="prev"    name="Previous" stroke="#facc15" strokeWidth={2} fill="url(#gPrev)" dot={false} activeDot={{ r: 4, fill: "#facc15" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar chart — 1/3 width */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
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
                    {severityBarData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Recent Findings table — 2/3 */}
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">Recent Findings</p>
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-2.5 font-medium text-gray-400 uppercase tracking-wide text-[10px]">Severity</th>
                  <th className="px-5 py-2.5 font-medium text-gray-400 uppercase tracking-wide text-[10px]">Title</th>
                  <th className="px-5 py-2.5 font-medium text-gray-400 uppercase tracking-wide text-[10px]">Company</th>
                  <th className="px-5 py-2.5 font-medium text-gray-400 uppercase tracking-wide text-[10px]">Category</th>
                  <th className="px-5 py-2.5 font-medium text-gray-400 uppercase tracking-wide text-[10px]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentFindings.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <SeverityBadge severity={f.severity} />
                    </td>
                    <td className="px-5 py-3 text-gray-800 font-medium truncate max-w-[160px]">
                      {f.title}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {f.assessment.company.name}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{f.category}</td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(f.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
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
                      <div
                        className={`h-full rounded-full ${SEVERITY_BAR[key]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Assessments mini-list */}
            <div className="border-t border-gray-100">
              <div className="px-5 py-3 border-b border-gray-50">
                <p className="text-xs font-medium text-gray-600">Recent Assessments</p>
              </div>
              <div className="divide-y divide-gray-50">
                {recentAssessments.slice(0, 4).map((a) => (
                  <div key={a.id} className="px-5 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                        {a.company.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(a.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short",
                        })}
                      </p>
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




