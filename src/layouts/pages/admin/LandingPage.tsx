import React from "react";
import { Link } from "react-router-dom";
import {ShieldCheck,ClipboardList,FileSearch,CheckCircle2,ArrowRight,} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      <section className="relative overflow-hidden bg-gradient-to-br py-05 from-indigo-800 via-slate-700 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm text-white backdrop-blur">
            Security • Compliance • Audit
          </span>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Cyber Security and Data Protection Assessments <br />
            <span className="text-indigo-200">Made Structured & Reliable</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-indigo-100">
            Perform professional security assessments using standardized
            <strong className="text-white"> YES / NO / NA </strong>
            responses, capture findings, and generate audit-ready results.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-medium text-indigo-700 hover:bg-indigo-50 transition"
            >
               Assessments <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <ValueCard
              icon={<ShieldCheck />}
              title="Domain-Based Structure"
              desc="Assess security posture using organized domains and controls for clarity and consistency."
            />
            <ValueCard
              icon={<ClipboardList />}
              title="Standardized Responses"
              desc="YES / NO / NA answers ensure uniform evaluation across all controls."
            />
            <ValueCard
              icon={<FileSearch />}
              title="Audit-Ready Findings"
              desc="Each control supports findings for remediation tracking and reporting."
            />
          </div>
        </div>
      </section>

      
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center">
            Assessment Workflow
          </h2>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <Step
              number="01"
              title="Select Domain"
              desc="Choose the security domain to evaluate."
            />
            <Step
              number="02"
              title="Evaluate Assessments"
              desc="Answer controls using YES / NO / NA and document findings."
            />
            <Step
              number="03"
              title="Finalize Assessment"
              desc="Review results and submit for reporting."
            />
          </div>
        </div>
      </section>

      
      <section className="bg-slate-900 py-20 text-center text-white">
        <h2 className="text-3xl font-semibold">
          Ready to Run Your First Assessment?
        </h2>
        <p className="mt-4 text-slate-300">
          Designed for security teams, auditors, and compliance professionals.
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-8 py-4 font-medium hover:bg-indigo-500 transition"
        >
          Go to Login <CheckCircle2 className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}



function ValueCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
      <div className="mb-4 inline-flex rounded-lg bg-indigo-100 p-3 text-indigo-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{desc}</p>
    </div>
  );
}

function Step({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-8">
      <span className="absolute -top-4 left-6 rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">
        {number}
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{desc}</p>
    </div>
  );
}
export { LandingPage };
