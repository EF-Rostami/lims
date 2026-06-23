"use client";

import { useEffect } from "react";
import { useProject } from "@/features/lims/consultancy/consultancy.queries";
import { useProjectContextStore } from "@/features/lims/consultancy/project-context.store";

export function ProjectContextSetter({ id }: { id: number }) {
  const { data: project } = useProject(id);
  const setProject = useProjectContextStore((s) => s.setProject);
  const clearProject = useProjectContextStore((s) => s.clearProject);

  useEffect(() => {
    if (project) setProject(project.id, project.name);
    return () => clearProject();
  }, [project, setProject, clearProject]);

  return null;
}
