import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  UserCheck,
  Globe,
  Scale,
  Clock,
  AlertTriangle,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import { useAuthStore } from "../../../feature/store/authStore";

const PRIVACY_CARDS = [
  {
    icon: UserCheck,
    title: "What Data We Collect",
    description:
      "Account info (name, email, organization), assessment responses, findings, technical info such as IP and login activity, and any files submitted during an assessment.",
  },
  {
    icon: FileText,
    title: "Why We Use Your Data",
    description:
      "To manage accounts, enable assessments, generate audit-ready reports, provide support, and comply with legal or regulatory obligations.",
  },
  {
    icon: UserCheck,
    title: "Who Can Access Your Data",
    description:
      "Only authorized users, internal technical staff, and trusted service providers. Data is never sold or shared with third parties.",
  },
  {
    icon: Globe,
    title: "Data Stays in Rwanda",
    description:
      "All data is stored and processed within Rwanda. We do not transfer your data outside the country without informing you and applying appropriate safeguards.",
  },
  {
    icon: Lock,
    title: "How We Protect Your Data",
    description:
      "Secure authentication, role-based access, encrypted transmission, system monitoring, audit logs, and regular backups protect your data at every stage.",
  },
  {
    icon: ShieldCheck,
    title: "Your Rights",
    description:
      "You may access, correct, or delete your data, object to processing, withdraw consent, restrict processing, or request information on how your data is used.",
  },
  {
    icon: Scale,
    title: "Lawful Basis for Processing",
    description:
      "We process your data only where lawful — based on your consent, contractual need, service delivery, or compliance with legal and regulatory obligations.",
  },
  {
    icon: Clock,
    title: "Data Retention",
    description:
      "We retain data only as long as necessary — while your account is active, as required by your organization, or as mandated by law or audit obligations.",
  },
  {
    icon: ClipboardList,
    title: "Your Responsibilities",
    description:
      "Ensure data you upload is accurate, relevant, and lawfully obtained. Do not submit personal or confidential information unless it is necessary for the assessment.",
  },
  {
    icon: AlertTriangle,
    title: "Data Breaches",
    description:
      "If a breach poses high risk to users, we will investigate, mitigate the impact, and notify affected users or authorities as required by Rwanda's data protection law.",
  },
  {
    icon: RefreshCw,
    title: "Policy Updates",
    description:
      "This notice may be updated to reflect changes in the application, legal requirements, or our data practices. You will be informed of significant changes.",
  },
];

export default function ClientPolicyPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  const handleContinue = () => {
    if (!agreed || done) return;
    const { user } = useAuthStore.getState();
    localStorage.setItem(`consented_${user!.id}`, "true");
    setDone(true);
    setTimeout(() => navigate("/client/dashboard"), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Review & Accept Policies
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-sm leading-relaxed">
            Before you access the platform, please review our data privacy notice and accept our policies.
            You only need to do this once.
          </p>
        </div>

        {/* Step indicator */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
          <div className="flex items-center gap-3">
            <StepBadge step={1} label="Set password" done />
            <div className="flex-1 h-px bg-gray-200" />
            <StepBadge step={2} label="Accept policies" active />
            <div className="flex-1 h-px bg-gray-200" />
            <StepBadge step={3} label="Dashboard" />
          </div>
        </div>

        {/* Section title */}
        <div>
          <h2 className="text-base font-semibold text-gray-900">Data Privacy Notice</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            How ISCO Technologies collects, uses, and protects your personal data
          </p>
        </div>

        {/* Privacy cards grid — 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRIVACY_CARDS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-5 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Icon className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 mb-2">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Consent box */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* Checkbox */}
          <label
            className={`flex items-start gap-3 cursor-pointer group select-none ${
              done ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={done}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                  agreed
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-gray-300 group-hover:border-indigo-400"
                }`}
              >
                {agreed && (
                  <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                    <path
                      d="M1.5 5L4.5 8L10.5 2"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700 leading-snug">
              I have read and understood the Data Privacy Notice above and agree to the collection and use of my data as described.
            </span>
          </label>

          {/* CTA */}
          <button
            onClick={handleContinue}
            disabled={!agreed || done}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              agreed && !done
                ? "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {done ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Redirecting to dashboard…
              </>
            ) : (
              "Continue to Dashboard"
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Your consent is saved and you won't be asked again.
          </p>
        </div>

      </div>
    </div>
  );
}

function StepBadge({
  step, label, done = false, active = false,
}: {
  step: number; label: string; done?: boolean; active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          done
            ? "bg-indigo-600 text-white"
            : active
            ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? (
          <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
            <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          step
        )}
      </div>
      <span className={`text-[10px] font-medium whitespace-nowrap ${
        active ? "text-indigo-700" : done ? "text-gray-500" : "text-gray-400"
      }`}>
        {label}
      </span>
    </div>
  );
}