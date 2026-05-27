import axios from "./Axios";

// STATUS

export type ChecklistStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

// MODEL

export interface Checklists {
  id: string;

  name: string;

  description?: string | null;

  status: ChecklistStatus;

  createdAt?: string;

  updatedAt?: string;

  // computed fields from backend

  domainCount?: number;

  controlCount?: number;
}

// CREATE DTO

export interface CreateChecklistDto {
  name: string;

  description?: string | null;
}

// UPDATE DTO

export interface UpdateChecklistDto {
  name?: string;

  description?: string | null;
}

// GET ALL

export async function getChecklists(): Promise<Checklists[]> {
  const res = await axios.get(
    "/checklists"
  );

  return res.data;
}

// CREATE

export async function createChecklist(
  payload: CreateChecklistDto
): Promise<Checklists> {
  const res = await axios.post(
    "/checklists",
    payload
  );

  return res.data;
}

// UPDATE

export async function updateChecklist(
  id: string,
  payload: UpdateChecklistDto
): Promise<Checklists> {
  const res = await axios.put(
    `/checklists/${id}`,
    payload
  );

  return res.data;
}

// ARCHIVE

export async function archiveChecklist(
  id: string
): Promise<Checklists> {
  const res = await axios.patch(
    `/checklists/${id}/archive`
  );

  return res.data;
}