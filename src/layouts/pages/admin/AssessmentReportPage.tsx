/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";


const SEVERITY: Record<string, { label: string; text: string; badge: string; border: string; soft: string; dot: string }> = {
  CRITICAL: {
    label: "Critical",
    text: "text-[#B91C1C]",
    badge: "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]",
    border: "border-l-[#B91C1C]",
    soft: "bg-[#FEF2F2]",
    dot: "bg-[#B91C1C]",
  },
  HIGH: {
    label: "High",
    text: "text-[#C2410C]",
    badge: "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]",
    border: "border-l-[#C2410C]",
    soft: "bg-[#FFF7ED]",
    dot: "bg-[#C2410C]",
  },
  MEDIUM: {
    label: "Medium",
    text: "text-[#B45309]",
    badge: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",
    border: "border-l-[#B45309]",
    soft: "bg-[#FFFBEB]",
    dot: "bg-[#B45309]",
  },
  LOW: {
    label: "Low",
    text: "text-[#065F46]",
    badge: "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]",
    border: "border-l-[#065F46]",
    soft: "bg-[#ECFDF5]",
    dot: "bg-[#065F46]",
  },
};

const CATEGORY_TITLES: Record<string, string> = {
  NETWORK: "Network",
  NETWORK_SECURITY: "Network Security",
  WEB_APPLICATION: "Web Application",
  CLOUD_SECURITY: "Cloud Security",
  INFRASTRUCTURE: "Infrastructure",
  ACCESS_CONTROL: "Access Control",
  DATA_PROTECTION: "Data Protection",
  GOVERNANCE: "Governance",
  ENDPOINT_SECURITY: "Endpoint Security",
};

// Ordered dynamic field entry (new format)
type DynEntry = {
  label: string;
  value: string | null;
  type: string;
  subtopic: string | null;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9CA3AF] mb-3">
      {children}
    </p>
  );
}

export default function AssessmentReportPage() {
  const { findingId } = useParams();
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [, setAssessmentId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportSentAt, setReportSentAt] = useState<string | null>(null);

  useEffect(() => {
  if (!findingId) return;
  apiClient
    .get(`/technical-findings/${findingId}`)
    .then((res) => {
      const finding = res.data?.data;
      if (!finding) { setFindings([]); return; }
      setFindings([finding]);
      setAssessmentId(finding.assessment?.id || null);
      setReportSent(finding.reportSent || false);
      setReportSentAt(finding.reportSentAt || null);
    })
    .catch((err) => { console.error(err); setFindings([]); })
    .finally(() => setLoading(false));
}, [findingId]);

  const handleSendReport = async () => {
    if (!findingId) return;
    try {
      setSending(true);
      await apiClient.post(`/reports/send/${findingId}`);
      setReportSent(true);
      setReportSentAt(new Date().toISOString());
      alert("Report released successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to release report");
    } finally {
      setSending(false);
    }
  };

  const stats = useMemo(() => ({
    CRITICAL: findings.filter((f) => f.severity === "CRITICAL").length,
    HIGH: findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: findings.filter((f) => f.severity === "MEDIUM").length,
    LOW: findings.filter((f) => f.severity === "LOW").length,
  }), [findings]);

  const filteredFindings = useMemo(
    () => (!filter ? findings : findings.filter((f) => f.severity === filter)),
    [findings, filter]
  );

  const groupedFindings = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredFindings.forEach((f) => {
      const cat = f.category || "OTHER";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(f);
    });
    return grouped;
  }, [filteredFindings]);

  const totalScore =
    stats.CRITICAL * 40 + stats.HIGH * 20 + stats.MEDIUM * 10 + stats.LOW * 5;
  const healthPct = Math.max(0, Math.round(100 - Math.min(totalScore / 4, 100)));

  return (
    <AppLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .report-root { font-family: 'DM Sans', sans-serif; }
        .report-root h1, .report-root h2, .report-root h3, .report-root h4 { font-family: 'Lora', serif; }
        .report-root code, .report-root .mono { font-family: 'DM Mono', monospace; }
        .finding-enter { animation: fadeUp 0.35s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .stat-btn { transition: box-shadow 0.15s, border-color 0.15s; }
        .stat-btn:hover { box-shadow: 0 0 0 3px #E0E7FF; }
        .stat-btn.active { box-shadow: 0 0 0 3px #6366F1; border-color: #6366F1; }
        .bar-fill { transition: width 0.8s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <div className="report-root min-h-screen bg-[#F8F8F6] py-10 px-4 md:px-8">
        <div className="max-w-[860px] mx-auto">

          {/* ── COVER ── */}
          <div className="bg-white border border-[#E5E7EB]">
            <div className="flex items-stretch">
              <div className="w-1.5 bg-[#1E1E2E] flex-shrink-0" />
              <div className="flex-1 px-10 py-14">
                <div className="flex items-center justify-between mb-12">
                  <span className="text-[10px] tracking-[0.22em] uppercase text-[#9CA3AF] font-semibold">
                    Confidential · For Authorized Recipients Only
                  </span>
                  <span className="text-[10px] tracking-[0.1em] text-[#9CA3AF] mono">
                    {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </div>

                <h1 className="text-[38px] font-bold leading-tight text-[#111827] max-w-full">
                  Vulnerability Assessment Report
                </h1>

                <div className="mt-8 h-px bg-[#E5E7EB]" />

                <div className="mt-6 flex items-center gap-4">
                  {reportSent ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
                      <div className="w-2 h-2 rounded-full bg-[#059669]" />
                      <div>
                        <p className="text-sm font-semibold text-[#065F46]">Report Released</p>
                        {reportSentAt && (
                          <p className="text-xs text-[#047857] mt-0.5">
                            Released on {new Date(reportSentAt).toLocaleString("en-GB", {
                              day: "2-digit", month: "long", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendReport}
                      disabled={sending}
                      className="px-5 py-2.5 bg-[#111827] text-white text-sm font-medium hover:bg-[#1F2937] transition disabled:opacity-50 rounded"
                    >
                      {sending ? "Sending…" : "Release Report"}
                    </button>
                  )}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
                  <div>
                    <SectionLabel>Client</SectionLabel>
                    <p className="text-[#111827] font-medium">Client Organization</p>
                  </div>
                  <div>
                    <SectionLabel>Finding ID</SectionLabel>
                    <p className="text-[#111827] font-medium mono text-xs">{findingId || "—"}</p>
                  </div>
                  <div>
                    <SectionLabel>Prepared by</SectionLabel>
                    <p className="text-[#111827] font-medium">ISCO Security</p>
                  </div>
                  <div>
                    <SectionLabel>Classification</SectionLabel>
                    <p className="text-[#111827] font-medium">Restricted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-[#E5E7EB] border-t-0 flex items-center justify-center h-60">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#9CA3AF]">Loading report…</p>
              </div>
            </div>
          ) : (
            <>
              
                  {/* Health score */}
                  <div className="mt-8 flex items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                        <circle
                          cx="40" cy="40" r="34" fill="none"
                          stroke={healthPct >= 70 ? "#059669" : healthPct >= 40 ? "#D97706" : "#DC2626"}
                          strokeWidth="8"
                          strokeDasharray={`${(healthPct / 100) * 213.6} 213.6`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-[#111827]">
                        {healthPct}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">Security Health Score</p>
                      <p className="text-xs text-[#6B7280] mt-1">Weighted by severity — higher is better</p>
                    </div>
                  </div>

                  {/* Severity stat cards */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="border border-[#E5E7EB] p-5">
                      <SectionLabel>Total</SectionLabel>
                      <p className="text-3xl font-bold text-[#111827]">{findings.length}</p>
                      <p className="text-xs text-[#9CA3AF] mt-1">findings</p>
                    </div>
                    {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((key) => {
                      const s = SEVERITY[key];
                      const count = stats[key];
                      const pct = findings.length ? Math.round((count / findings.length) * 100) : 0;
                      return (
                        <button
                          key={key}
                          onClick={() => setFilter(filter === key ? null : key)}
                          className={`stat-btn border border-[#E5E7EB] p-5 text-left ${filter === key ? "active" : ""}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${s.dot} mb-3`} />
                          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#9CA3AF]">{s.label}</p>
                          <p className={`text-3xl font-bold mt-1 ${s.text}`}>{count}</p>
                          <div className="mt-3 h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div className={`bar-fill h-full rounded-full ${s.dot}`} style={{ width: `${pct}%` }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {filter && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-[#6B7280]">Filtered by severity:</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${SEVERITY[filter].badge}`}>{SEVERITY[filter].label}</span>
                      <button onClick={() => setFilter(null)} className="text-xs text-indigo-600 hover:underline ml-1">Clear filter</button>
                    </div>
                  )}

              {/* ── RISK RATING ── */}
              <div className="bg-white border border-[#E5E7EB] border-t-0">
                <div className="px-10 py-10">
                  <SectionLabel>02 · Risk Classification</SectionLabel>
                  <h2 className="text-2xl font-bold text-[#111827] mb-6">Risk Rating Matrix</h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="text-left py-3 pr-6 text-[10px] tracking-[0.15em] uppercase text-[#9CA3AF] font-semibold w-28">Severity</th>
                        <th className="text-left py-3 pr-6 text-[10px] tracking-[0.15em] uppercase text-[#9CA3AF] font-semibold w-32">CVSS Range</th>
                        <th className="text-left py-3 text-[10px] tracking-[0.15em] uppercase text-[#9CA3AF] font-semibold">Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: "CRITICAL", range: "9.0 – 10.0", action: "Emergency remediation — address within 24 hours" },
                        { key: "HIGH",     range: "7.0 – 8.9",  action: "Immediate action — address within 7 days" },
                        { key: "MEDIUM",   range: "4.0 – 6.9",  action: "Prioritize remediation in next release cycle" },
                        { key: "LOW",      range: "0.1 – 3.9",  action: "Address during scheduled maintenance window" },
                      ].map(({ key, range, action }) => {
                        const s = SEVERITY[key];
                        return (
                          <tr key={key} className="border-b border-[#F3F4F6]">
                            <td className="py-4 pr-6">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded ${s.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                {s.label}
                              </span>
                            </td>
                            <td className="py-4 pr-6 text-[#374151] mono text-xs">{range}</td>
                            <td className="py-4 text-[#4B5563]">{action}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── FINDINGS ── */}
              <div className="bg-white border border-[#E5E7EB] border-t-0">
                <div className="px-10 py-10">
                  <SectionLabel>03 · Technical Findings</SectionLabel>
                  <h2 className="text-2xl font-bold text-[#111827] mb-2">Detailed Findings &amp; Recommendations</h2>
                  <p className="text-sm text-[#6B7280] mb-10">
                    {filteredFindings.length} finding{filteredFindings.length !== 1 ? "s" : ""} displayed
                    {filter ? ` · ${SEVERITY[filter].label} severity` : ""}
                  </p>

                  <div className="space-y-0">
                    {Object.entries(groupedFindings).map(([category, items], catIdx) => (
                      <div key={category} className={catIdx > 0 ? "mt-14" : ""}>
                        {/* Category header */}
                        <div className="flex items-center gap-4 mb-8">
                          <div className="h-px flex-1 bg-[#E5E7EB]" />
                          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B7280] whitespace-nowrap">
                            {CATEGORY_TITLES[category] || category} · {items.length} {items.length === 1 ? "finding" : "findings"}
                          </span>
                          <div className="h-px flex-1 bg-[#E5E7EB]" />
                        </div>

                        <div className="space-y-10">
                          {items.map((f, idx) => {
                            const s = SEVERITY[f.severity] || SEVERITY.LOW;

                            // ── Parse dynamicFields ──
                            // Supports new ordered-array format and legacy flat-object format
                            let dynamicEntries: DynEntry[] = [];
                            let legacyDynamicFields: Record<string, any> = {};
                            try {
                              const raw = f.dynamicFields || f.dynamic_fields;
                              const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
                              if (Array.isArray(parsed)) {
                                dynamicEntries = parsed as DynEntry[];
                              } else {
                                legacyDynamicFields = parsed;
                              }
                            } 
                            catch { /* noop */ }

                            const fileFields: [string, string][] = dynamicEntries.length === 0
                              ? (Object.entries(legacyDynamicFields).filter(([key, value]) =>
                                  key.toLowerCase() !== "value" &&
                                  typeof value === "string" &&
                                  /\.(png|jpe?g|pdf)$/i.test(value)
                                ) as [string, string][])
                              : [];

                            const orderedEntries = dynamicEntries;

                            return (
                              <div
                          key={f.id}
                          className="finding-enter bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >

                          {/* TOP SEVERITY BAR */}

                          <div className={`h-1.5 w-full ${s.dot}`} />
                          <div className="p-8">
                            {/* FINDING HEADER */}
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  {/* FINDING NUMBER */}
                                  <span className="text-[11px] px-2.5 py-1 bg-[#111827] text-white rounded font-medium">
                                    Finding #{idx + 1}
                                  </span>
                                  {/* SEVERITY */}
                                  <span
                                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded ${s.badge}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                                    />
                                    {s.label}
                                  </span>

                                  {/* CATEGORY */}

                                  {f.category && (
                                    <span className="text-[11px] px-2.5 py-1 bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] rounded">
                                      {f.category}
                                    </span>
                                  )}
                                  {/* STATUS */}
                                  {f.status && (
                                    <span className="text-[11px] px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded">
                                      {f.status}
                                    </span>
                                  )}
                                </div>

                                {/* TITLE */}

                                <h4 className="text-[22px] font-bold text-[#111827] leading-snug">
                                  {f.title}
                                </h4>
                              </div>

                              {/* CVSS */}

                              {f.cvssScore && (
                                <div
                                  className={`flex-shrink-0 ${s.soft} border border-[#E5E7EB] px-5 py-4 text-center min-w-[90px] rounded-xl`}
                                >
                                  <p className="text-[9px] tracking-[0.15em] uppercase text-[#9CA3AF] font-semibold mb-1">
                                    CVSS
                                  </p>

                                  <p className={`text-3xl font-bold ${s.text}`}>
                                    {Number(f.cvssScore).toFixed(1)}
                                  </p>
                                </div>
                              )}
                            </div>
                                  <div className="mt-6 space-y-6">
                                    {orderedEntries.map((entry, ei) => {
                                      if (entry.type === "subtopic") {
                                        return (
                                          <div key={ei} className="mt-10 mb-4">
                                            <div className="flex items-center gap-3">
                                              <div className="h-px flex-1 bg-[#E5E7EB]" />
                                              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#6B7280] whitespace-nowrap px-1">
                                                {entry.label}
                                              </span>
                                              <div className="h-px flex-1 bg-[#E5E7EB]" />
                                            </div>
                                          </div>
                                        );
                                      }
                                      if (entry.type === "heading") {
                                        return (
                                          <div key={ei} className="mt-8">
                                            <h3 className="text-[22px] font-bold text-[#111827]">{entry.value}</h3>
                                          </div>
                                        );
                                      }
                                      if (entry.type === "severity") {
                                        const sev = SEVERITY[String(entry.value).toUpperCase()] || SEVERITY.LOW;
                                        return (
                                          <div key={ei}>
                                            <SectionLabel>Severity</SectionLabel>
                                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded ${sev.badge}`}>
                                              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                                              {sev.label}
                                            </span>
                                          </div>
                                        );
                                      }
                                      if (entry.type === "file") {
                                        return (
                                          <div key={ei}>
                                            <SectionLabel>{entry.label}</SectionLabel>
                                            <a
                                              href={entry.value || "#"}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="flex items-center justify-between border border-[#E5E7EB] px-4 py-3 hover:bg-[#F9FAFB] transition group rounded"
                                            >
                                              <div>
                                                <p className="text-sm font-medium text-[#111827]">View Attachment</p>
                                                <p className="text-xs text-[#9CA3AF] mt-0.5">Click to open</p>
                                              </div>
                                              <span className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-100 transition rounded">
                                                Open ↗
                                              </span>
                                            </a>
                                          </div>
                                        );
                                      }
                                      return (
                                        <div key={ei}>
                                          <SectionLabel>{entry.label}</SectionLabel>
                                          <p className="text-[#374151] leading-7 text-[14px] whitespace-pre-wrap">{entry.value}</p>
                                        </div>
                                      );
                                    })}

                                    {dynamicEntries.length === 0 && Object.entries(legacyDynamicFields)
                                      .filter(([key, value]) =>
                                        key !== "subtopic" &&
                                        typeof value === "string" &&
                                        !/\.(png|jpe?g|pdf)$/i.test(value)
                                      )
                                      .map(([key, value]) => (
                                        <div key={key}>
                                          <SectionLabel>{key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SectionLabel>
                                          <p className="text-[#374151] leading-7 text-[14px] whitespace-pre-wrap">{String(value)}</p>
                                        </div>
                                      ))
                                    }

                                    {(f.attachment || fileFields.length > 0) && (
                                      <div>
                                        <SectionLabel>Attachments</SectionLabel>
                                        <div className="space-y-2">
                                          {f.attachment && (
                                            <a
                                              href={f.attachment || "#"}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="flex items-center justify-between border border-[#E5E7EB] px-4 py-3 hover:bg-[#F9FAFB] transition group rounded"
                                            >
                                              <div>
                                                <p className="text-sm font-medium text-[#111827]">Primary Attachment</p>
                                                <p className="text-xs text-[#9CA3AF] mt-0.5">Click to view evidence file</p>
                                              </div>
                                              <span className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-100 transition rounded">
                                                Open ↗
                                              </span>
                                            </a>
                                          )}
                                          {fileFields.map(([label, value]) => {
                                            const displayLabel = label.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                                            return (
                                              <a
                                                key={label}
                                                href={value || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between border border-[#E5E7EB] px-4 py-3 hover:bg-[#F9FAFB] transition group rounded"
                                              >
                                                <div>
                                                  <p className="text-sm font-medium text-[#111827]">{displayLabel}</p>
                                                  <p className="text-xs text-[#9CA3AF] mt-0.5">Click to view evidence file</p>
                                                </div>
                                                <span className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-100 transition rounded">
                                                  Open ↗
                                                </span>
                                              </a>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {f.cvssVector && (
                                      <div>
                                        <SectionLabel>CVSS v3.1 Vector</SectionLabel>
                                        <table className="w-full text-sm border border-[#E5E7EB]">
                                          <tbody>
                                            <tr className="border-b border-[#F3F4F6]">
                                              <td className="p-3 text-[#6B7280] w-32 text-xs">Base Score</td>
                                              <td className={`p-3 font-semibold mono text-xs ${s.text}`}>{f.cvssScore}</td>
                                            </tr>
                                            <tr>
                                              <td className="p-3 text-[#6B7280] w-32 text-xs">Vector</td>
                                              <td className="p-3 mono text-[11px] text-[#374151] break-all">{f.cvssVector}</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>

                                  {/* Finding footer */}
                                  <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex justify-between text-[11px] text-[#9CA3AF]">
                                    <span className="mono">{f.cvssVector || ""}</span>
                                    <div className="flex gap-4">
                                      {f.createdAt && <span>Created {new Date(f.createdAt).toLocaleDateString()}</span>}
                                      {f.updatedAt && <span>Updated {new Date(f.updatedAt).toLocaleDateString()}</span>}
                                    </div>
                                  </div>
                                </div>

                                {idx < items.length - 1 && <div className="mt-10 border-b border-[#F3F4F6]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {filteredFindings.length === 0 && (
                      <div className="text-center py-20 text-[#9CA3AF]">
                        <p className="text-4xl mb-3">—</p>
                        <p className="text-sm">No findings match the current filter.</p>
                        {filter && (
                          <button onClick={() => setFilter(null)} className="mt-3 text-xs text-indigo-600 hover:underline">
                            Clear filter
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── FOOTER ── */}
              <div className="bg-white border border-[#E5E7EB] border-t-0">
                <div className="px-10 py-8 flex items-center justify-between">
                  <p className="text-xs text-[#9CA3AF]">ISCO Technologies · Vulnerability Assessment Report</p>
                  <p className="text-xs text-[#9CA3AF] mono">
                    {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}