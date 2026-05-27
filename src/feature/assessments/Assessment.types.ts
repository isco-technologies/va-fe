export type AssessmentStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "COMPLETED";

export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export interface Company {
  id: string;
  name: string;
}

export interface Checklist {
  id: string;
  name: string;
}

export interface Assessment {
  id: string;
  name: string;
  status: AssessmentStatus;

  company: Company;
  checklist: Checklist;

  progress?: number;
  riskLevel?: RiskLevel;

  createdAt: string;
}
