import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, Lock, CheckCircle2, ExternalLink } from "lucide-react";
import { useAuthStore } from "../../../feature/store/authStore";

interface Policy {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const POLICIES: Policy[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    description:
      "Describes how we collect, use, and protect your personal data in accordance with applicable data protection laws.",
    icon: <Lock className="w-5 h-5 text-indigo-600" />,
    href: "/policies/privacy",
  },
  {
    id: "terms",
    title: "Terms of Service",
    description:
      "Outlines your rights and responsibilities while using the ISCO Security platform, including acceptable use and liability.",
    icon: <FileText className="w-5 h-5 text-indigo-600" />,
    href: "/policies/terms",
  },
];

function PolicyCard({ policy }: { policy: Policy }) {
  return (
    <div className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
      <div className="mt-0.5 shrink-0 w-9 h-9 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center">
        {policy.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">{policy.title}</span>
          <a
            href={policy.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Read <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{policy.description}</p>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Review & Accept Policies
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xs leading-relaxed">
            Before you access the platform, please review and accept our policies.
            You only need to do this once.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Step indicator */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <StepBadge step={1} label="Set password" done />
              <div className="flex-1 h-px bg-gray-200" />
              <StepBadge step={2} label="Accept policies" active />
              <div className="flex-1 h-px bg-gray-200" />
              <StepBadge step={3} label="Dashboard" />
            </div>
          </div>

          <div className="p-6 space-y-4">

            {/* Policy cards */}
            <div className="space-y-3">
              {POLICIES.map((p) => (
                <PolicyCard key={p.id} policy={p} />
              ))}
            </div>

            {/* Checkbox */}
            <div className="border-t border-gray-100 pt-4">
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
                  I have read and agree to the{" "}
                  <a
                    href={POLICIES.find((p) => p.id === "privacy")!.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href={POLICIES.find((p) => p.id === "terms")!.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service
                  </a>
                  .
                </span>
              </label>
            </div>

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