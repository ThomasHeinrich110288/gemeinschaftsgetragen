import { notFound } from "next/navigation";
import { ProjectPage } from "../../../../../components/project-page";
import { loadProjectBundle } from "../../../../../lib/data";

interface ProjectPageParams {
  orgSlug: string;
  projectSlug: string;
}

export default async function ProjectRoute({
  params
}: {
  params: ProjectPageParams;
}) {
  try {
    const bundle = await loadProjectBundle(params.orgSlug, params.projectSlug);
    return <ProjectPage bundle={bundle} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}
