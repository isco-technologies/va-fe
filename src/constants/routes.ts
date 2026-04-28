export const ROUTES = {
  // PUBLIC
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",

  // ADMIN
  ADMIN_DASHBOARD: "/admin/assessment",
  ADMIN_ASSESSMENTS: "/admin/assessment",
  ADMIN_COMPANIES: "/admin/companies",
  ADMIN_CHECKLISTS: "/admin/checklists",
  ADMIN_USERS: "/admin/users",


  ADMIN_CHECKLIST_DOMAINS: (checklistId: string) =>
    `/admin/checklists/${checklistId}/domains`,

  ADMIN_ASSESSMENT_REVIEW: (assessmentId: string) =>
    `/admin/assessments/${assessmentId}/review`,

  // CLIENT
  CLIENT_DASHBOARD: "/client/assessment",
  CLIENT_ASSESSMENT: "/client/assessment",
};