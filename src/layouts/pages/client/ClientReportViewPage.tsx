/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../appLayout";
import apiClient from "../../../api/Axios";
import { Download } from "lucide-react";

const SEVERITY: Record<string, { label: string; text: string; badge: string; soft: string; dot: string }> = {
  CRITICAL: { label: "Critical", text: "text-[#B91C1C]", badge: "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]", soft: "bg-[#FEF2F2]", dot: "bg-[#B91C1C]" },
  HIGH:     { label: "High",     text: "text-[#C2410C]", badge: "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]", soft: "bg-[#FFF7ED]", dot: "bg-[#C2410C]" },
  MEDIUM:   { label: "Medium",   text: "text-[#B45309]", badge: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]", soft: "bg-[#FFFBEB]", dot: "bg-[#B45309]" },
  LOW:      { label: "Low",      text: "text-[#065F46]", badge: "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]", soft: "bg-[#ECFDF5]", dot: "bg-[#065F46]" },
};

const CATEGORY_TITLES: Record<string, string> = {
  NETWORK: "Network", NETWORK_SECURITY: "Network Security", WEB_APPLICATION: "Web Application",
  CLOUD_SECURITY: "Cloud Security", INFRASTRUCTURE: "Infrastructure", ACCESS_CONTROL: "Access Control",
  DATA_PROTECTION: "Data Protection", GOVERNANCE: "Governance", ENDPOINT_SECURITY: "Endpoint Security",
};

type DynEntry = { label: string; value: string | null; type: string; subtopic: string | null };

const isFileEntry = (e: DynEntry) => e.type === "file" || e.type === "attachment";
const isAffected  = (e: DynEntry) => e.label?.toLowerCase() === "affected systems";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#9CA3AF] mb-3">{children}</p>;
}

function AttachmentLink({ href, label }: { href: string; label: string }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:4000";
  const url = href.startsWith("http") ? href : `${API_BASE}/uploads/${href.split(/[\\/]/).pop()}`;
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="flex items-center justify-between border border-[#E5E7EB] px-4 py-3 hover:bg-[#F9FAFB] transition group rounded"
    >
      <div>
        <p className="text-sm font-medium text-[#111827]">{label}</p>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Click to view file</p>
      </div>
      <span className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-100 transition rounded">Open ↗</span>
    </a>
  );
}

// ─── FINDING CARD (read-only) ─────────────────────────────────────────────────
// Mirrors AssessmentReportPage FindingCard exactly — severity and attachments
// come from dynamicFields in order, no special pinned blocks.

function FindingCard({ f, idx, total }: { f: any; idx: number; total: number }) {
  let dynamicEntries: DynEntry[] = [];
  try {
    const raw = f.dynamicFields || f.dynamic_fields;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw || []);
    if (Array.isArray(parsed)) dynamicEntries = parsed as DynEntry[];
  } catch { /* noop */ }

  const affEntry = dynamicEntries.find(isAffected);
  const displayEntries = dynamicEntries.filter((e) => !isFileEntry(e) && !isAffected(e));
  const fileEntries = dynamicEntries.filter(isFileEntry);

  return (
    <div className="finding-enter bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="h-1.5 w-full bg-[#6366F1]" />
      <div className="p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] px-2.5 py-1 bg-[#111827] text-white rounded font-medium">Finding #{idx + 1}</span>
            </div>
            <h4 className="text-[22px] font-bold text-[#111827] leading-snug">{f.title}</h4>
          </div>
          {f.cvssScore && (
            <div className="flex-shrink-0 bg-[#F9FAFB] border border-[#E5E7EB] px-5 py-4 text-center min-w-[90px] rounded-xl">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#9CA3AF] font-semibold mb-1">CVSS</p>
              <p className="text-3xl font-bold text-[#111827]">{Number(f.cvssScore).toFixed(1)}</p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {displayEntries.map((entry, ei) => {
            if (entry.type === "subtopic") return (
              <div key={ei} className="mt-10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#6B7280] whitespace-nowrap px-1">{entry.label}</span>
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>
              </div>
            );
            if (entry.type === "severity" && entry.value) {
              const sev = SEVERITY[String(entry.value).toUpperCase()] || SEVERITY.LOW;
              return (
                <div key={ei}>
                  <SectionLabel>{entry.label}</SectionLabel>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded ${sev.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />{sev.label}
                  </span>
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

          {fileEntries.map((entry, i) => (
            <div key={i}>
              <SectionLabel>{entry.label}</SectionLabel>
              <AttachmentLink href={entry.value || "#"} label={entry.label} />
            </div>
          ))}

          {affEntry?.value && (
            <div className="mt-6 pt-5 border-t border-[#F3F4F6]">
              <SectionLabel>Affected Systems</SectionLabel>
              <p className="text-[#374151] leading-7 text-[14px] whitespace-pre-wrap">{affEntry.value}</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex justify-between text-[11px] text-[#9CA3AF]">
          <span className="mono">{f.cvssVector || ""}</span>
          <div className="flex gap-4">
            {f.createdAt && <span>Created {new Date(f.createdAt).toLocaleDateString()}</span>}
            {f.updatedAt && <span>Updated {new Date(f.updatedAt).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
      {idx < total - 1 && <div className="border-b border-[#F3F4F6]" />}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ClientReportViewPage() {
  const { assessmentId } = useParams();
  const reportRef = useRef<HTMLDivElement>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [assessmentName, setAssessmentName] = useState<string | null>(null);
  const [reportSentAt, setReportSentAt] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!assessmentId) return;
    // Fetch all released findings for this assessment
    apiClient
      .get(`/technical-findings/assessment/${assessmentId}/released`)
      .then((res) => {
        const data = res.data?.data || [];
        setFindings(data);
        if (data.length > 0) {
          const a = data[0].assessment;
          setCompanyName(a?.company?.name || null);
          // Prefer checklist name over assessment name
          setAssessmentName(a?.checklist?.name || a?.name || null);
          setReportSentAt(a?.reportSentAt || a?.report_sent_at || null);
        }
      })
      .catch((err) => { console.error(err); setFindings([]); })
      .finally(() => setLoading(false));
  }, [assessmentId]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Fix oklch colors that html2canvas can't parse — replace with safe fallbacks
      const allEls = reportRef.current.querySelectorAll("*");
      const origStyles: { el: Element; color: string; bg: string; border: string }[] = [];
      allEls.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const color  = computed.color;
        const bg     = computed.backgroundColor;
        const border = computed.borderColor;
        if (color.includes("oklch") || bg.includes("oklch") || border.includes("oklch")) {
          origStyles.push({ el, color, bg, border });
          const htmlEl = el as HTMLElement;
          if (color.includes("oklch"))  htmlEl.style.color           = "#111827";
          if (bg.includes("oklch"))     htmlEl.style.backgroundColor = "transparent";
          if (border.includes("oklch")) htmlEl.style.borderColor     = "#E5E7EB";
        }
      });

      // Prevent page breaks inside finding cards
      const cards = reportRef.current.querySelectorAll(".finding-enter, .bg-white.border");
      cards.forEach((el) => { (el as HTMLElement).style.pageBreakInside = "avoid"; });

      await html2pdf()
        .set({
          margin:      [10, 10, 10, 10],
          filename:    `${assessmentName || "report"}.pdf`,
          image:       { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak:   { mode: ["avoid-all", "css", "legacy"] },
        } as any)
        .from(reportRef.current)
        .save();
      // Restore page break styles
      cards.forEach((el) => { (el as HTMLElement).style.pageBreakInside = ""; });

      // Restore original styles
      origStyles.forEach(({ el }) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.color           = "";
        htmlEl.style.backgroundColor = "";
        htmlEl.style.borderColor     = "";
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const groupedFindings = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    findings.forEach((f) => {
      const cat = f.category || "OTHER";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(f);
    });
    return grouped;
  }, [findings]);

  return (
    <AppLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .report-root { font-family: 'DM Sans', sans-serif; }
        .report-root h1, .report-root h2, .report-root h3, .report-root h4 { font-family: 'Lora', serif; }
        .report-root code, .report-root .mono { font-family: 'DM Mono', monospace; }
        .finding-enter { animation: fadeUp 0.35s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* PDF DOWNLOAD BUTTON */}
      <div className="max-w-[860px] mx-auto mb-4 flex justify-end px-4 md:px-8">
        <button onClick={handleDownloadPDF} disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
        >
          <Download size={15} />
          {downloading ? "Generating PDF…" : "Download PDF"}
        </button>
      </div>

      <div className="report-root min-h-screen bg-[#F8F8F6] py-4 px-4 md:px-8">
        <div ref={reportRef} className="max-w-[860px] mx-auto">

          {/* COVER */}
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
                {assessmentName && <p className="text-lg text-[#6B7280] mt-2">{assessmentName}</p>}
                <div className="mt-8 h-px bg-[#E5E7EB]" />
                <div className="mt-6">
                  <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
                    <div className="w-2 h-2 rounded-full bg-[#059669]" />
                    <div>
                      <p className="text-sm font-semibold text-[#065F46]">Official Report</p>
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
                </div>
                <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
                  <div><SectionLabel>Client</SectionLabel><p className="text-[#111827] font-medium">{companyName || "—"}</p></div>
                  <div><SectionLabel>Prepared by</SectionLabel><p className="text-[#111827] font-medium">ISCO Security</p></div>
                  <div><SectionLabel>Classification</SectionLabel><p className="text-[#111827] font-medium">Restricted</p></div>
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
              {/* RISK RATING */}
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
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
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

              {/* FINDINGS */}
              <div className="bg-white border border-[#E5E7EB] border-t-0">
                <div className="px-10 py-10">
                  <SectionLabel>03 · Technical Findings</SectionLabel>
                  <h2 className="text-2xl font-bold text-[#111827] mb-2">Detailed Findings &amp; Recommendations</h2>
                  <p className="text-sm text-[#6B7280] mb-10">
                    {findings.length} finding{findings.length !== 1 ? "s" : ""} displayed
                  </p>
                  <div className="space-y-0">
                    {Object.entries(groupedFindings).map(([category, items], catIdx) => (
                      <div key={category} className={catIdx > 0 ? "mt-14" : ""}>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="h-px flex-1 bg-[#E5E7EB]" />
                          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6B7280] whitespace-nowrap">
                            {CATEGORY_TITLES[category] || category} · {items.length} {items.length === 1 ? "finding" : "findings"}
                          </span>
                          <div className="h-px flex-1 bg-[#E5E7EB]" />
                        </div>
                        <div className="space-y-10">
                          {items.map((f, idx) => (
                            <FindingCard key={f.id} f={f} idx={idx} total={items.length} />
                          ))}
                        </div>
                      </div>
                    ))}
                    {findings.length === 0 && (
                      <div className="text-center py-20 text-[#9CA3AF]">
                        <p className="text-4xl mb-3">—</p>
                        <p className="text-sm">No findings available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
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