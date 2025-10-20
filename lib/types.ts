export interface Organization {
  id: string;
  name: string;
  slug: string;
  location?: string;
}

export interface Project {
  id: string;
  orgId: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
}

export type CostMeta = Record<string, string | number | null>;

export interface CostItem {
  id: string;
  projectId: string;
  type: "COST";
  title: string;
  subtitle?: string;
  need: number | null;
  currency: string;
  meta: CostMeta;
  description: string;
  document: string | null;
}

export type TaskType = "ROLE" | "TASK";

export interface TaskSchedule {
  label: string;
  startHour: number;
  endHour: number;
  days: string[];
}

export interface TaskItem {
  id: string;
  projectId: string;
  type: TaskType;
  title: string;
  description: string;
  schedule?: TaskSchedule;
  meta?: Record<string, string>;
}

export interface PledgeSeed {
  itemId: string;
  maxAmount: number;
  count: number;
}

export type DiscussionType = "RATIONALE" | "QUESTION" | "COUNTERPROPOSAL";

export interface DiscussionEntry {
  id: string;
  projectId: string;
  itemId?: string;
  author: string;
  type: DiscussionType;
  createdAt: string;
  content: string;
}

export interface CostWithComputed extends CostItem {
  coverageAmount: number;
  coverageRatio: number;
  pledges: PledgeSeed[];
  preview: AliquotPreview;
}

export interface AliquotPreview {
  factor: number;
  sumMax: number;
  totalAssigned: number;
  chargeGroups: Array<{
    amount: number;
    count: number;
  }>;
}

export interface ProjectBundle {
  organization: Organization;
  project: Project;
  costs: CostWithComputed[];
  roles: TaskItem[];
  tasks: TaskItem[];
  discussions: DiscussionEntry[];
}
