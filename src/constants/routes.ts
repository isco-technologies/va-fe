export const ROUTES = {
  // PUBLIC
  LOGIN: "/login",
  UNAUTHORIZED:"/unauthorized",
  // ADMIN
  ADMIN_DASHBOARD:"/admin/dashboard",
  ADMIN_ASSESSMENTS:"/admin/assessment",
  ADMIN_COMPANIES:"/admin/companies",
  ADMIN_CHECKLISTS: "/admin/checklists",
  ADMIN_USERS:"/admin/users",
  // REPORTING
  // REPORTING DASHBOARD

  ADMIN_REPORTS:"/admin/reports",
  // REPORT EDITOR
  ADMIN_REPORT_EDITOR:(assessmentId: string) =>`/admin/reports/editor/${assessmentId}`,
  // FINAL REPORT VIEW
  ADMIN_REPORT_VIEW:(assessmentId: string) =>`/admin/reports/view/${assessmentId}`,
  // CHECKLISTS
  ADMIN_CHECKLIST_DOMAINS:(checklistId: string) =>`/admin/checklists/${checklistId}/domains`,
  // ASSESSMENT REVIEW
  ADMIN_ASSESSMENT_REVIEW:(assessmentId: string ) =>`/admin/assessments/${assessmentId}/review`,
  // ARCHIVES
  ADMIN_ARCHIVES:"/admin/archives",
  // CLIENT

  CLIENT_DASHBOARD:"/client/dashboard",
  CLIENT_ASSESSMENT:"/client/assessment",
  CLIENT_REPORTS:"/client/reports",
  CLIENT_REPORT_VIEW:(reportId: string) =>`/client/reports/${reportId}`,
  CLIENT_CONSENT:"/client/consent",
  
};