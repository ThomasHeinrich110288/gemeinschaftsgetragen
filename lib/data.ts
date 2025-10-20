import { promises as fs } from "fs";
import path from "path";
import { buildAliquotPreview } from "./aliquot";
import type {
  CostItem,
  CostWithComputed,
  DiscussionEntry,
  Organization,
  PledgeSeed,
  Project,
  ProjectBundle,
  TaskItem
} from "./types";

const seedDir = path.join(process.cwd(), "seed");

async function loadJsonFile<T>(fileName: string): Promise<T> {
  const filePath = path.join(seedDir, fileName);
  const fileContents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContents) as T;
}

export async function loadProjectBundle(
  orgSlug: string,
  projectSlug: string
): Promise<ProjectBundle> {
  const [organization, project] = await Promise.all([
    loadJsonFile<Organization>("organization.json"),
    loadJsonFile<Project>("project.json")
  ]);

  if (organization.slug !== orgSlug) {
    throw new Error(`Organisation mit Slug ${orgSlug} nicht gefunden.`);
  }

  if (project.slug !== projectSlug) {
    throw new Error(`Projekt mit Slug ${projectSlug} nicht gefunden.`);
  }

  const [rawCosts, rawTasks, pledgeSeeds, discussions] = await Promise.all([
    loadJsonFile<CostItem[]>("items.costs.json"),
    loadJsonFile<TaskItem[]>("items.tasks.json"),
    loadJsonFile<PledgeSeed[]>("pledges.json"),
    loadJsonFile<DiscussionEntry[]>("discussion.json")
  ]);

  const projectCosts: CostWithComputed[] = rawCosts
    .filter((cost) => cost.projectId === project.id)
    .map((cost) => {
      const pledges = pledgeSeeds.filter((pledge) => pledge.itemId === cost.id);
      const preview = buildAliquotPreview(cost.need, pledges);
      const coverageAmount = cost.need ? Math.min(preview.totalAssigned, cost.need) : 0;
      const coverageRatio = cost.need && cost.need > 0 ? coverageAmount / cost.need : 0;
      return {
        ...cost,
        coverageAmount,
        coverageRatio,
        pledges,
        preview
      };
    });

  const projectTasks = rawTasks.filter((task) => task.projectId === project.id);
  const roles = projectTasks.filter((task) => task.type === "ROLE");
  const tasks = projectTasks.filter((task) => task.type === "TASK");

  const projectDiscussions = discussions
    .filter((entry) => entry.projectId === project.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    organization,
    project,
    costs: projectCosts,
    roles,
    tasks,
    discussions: projectDiscussions
  };
}
