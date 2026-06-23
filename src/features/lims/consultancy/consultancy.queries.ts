import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  consultancyApi,
  ConsultancyProjectCreate,
  ConsultancyProjectUpdate,
  ConsultancyTaskCreate,
  ConsultancyTaskUpdate,
  GapAssessmentCreate,
  GapAssessmentUpdate,
  GapAssessmentItemUpdate,
  ProjectGoLiveConfigUpsert,
} from "./consultancy.api";
import { lifecycleApi, LifecycleTransitionRequest } from "./lifecycle.api";

export const consultancyKeys = {
  frameworks: ["consultancy", "frameworks"] as const,
  framework: (id: number) => ["consultancy", "frameworks", id] as const,
  templates: (frameworkId?: number) => ["consultancy", "templates", frameworkId ?? "all"] as const,
  template: (id: number) => ["consultancy", "templates", id] as const,
  projects: ["consultancy", "projects"] as const,
  project: (id: number) => ["consultancy", "projects", id] as const,
  goLiveDefinitions: (projectId: number) =>
    ["consultancy", "projects", projectId, "golive", "definitions"] as const,
  readiness: (projectId: number) => ["consultancy", "projects", projectId, "readiness"] as const,
  assessments: (projectId: number) => ["consultancy", "projects", projectId, "assessments"] as const,
  assessment: (id: number) => ["consultancy", "assessments", id] as const,
  assessmentItems: (assessmentId: number) => ["consultancy", "assessments", assessmentId, "items"] as const,
  tasks: (projectId: number, status?: string) =>
    ["consultancy", "projects", projectId, "tasks", status ?? "all"] as const,
  task: (id: number) => ["consultancy", "tasks", id] as const,
};

// ── Frameworks ────────────────────────────────────────────────────────────────

export function useFrameworks() {
  return useQuery({
    queryKey: consultancyKeys.frameworks,
    queryFn: consultancyApi.listFrameworks,
    staleTime: 10 * 60_000,
  });
}

export function useFramework(id: number) {
  return useQuery({
    queryKey: consultancyKeys.framework(id),
    queryFn: () => consultancyApi.getFramework(id),
    staleTime: 10 * 60_000,
    enabled: !!id,
  });
}

// ── Templates ─────────────────────────────────────────────────────────────────

export function useTemplates(frameworkId?: number) {
  return useQuery({
    queryKey: consultancyKeys.templates(frameworkId),
    queryFn: () => consultancyApi.listTemplates(frameworkId),
    staleTime: 5 * 60_000,
  });
}

export function useTemplate(id: number) {
  return useQuery({
    queryKey: consultancyKeys.template(id),
    queryFn: () => consultancyApi.getTemplate(id),
    staleTime: 5 * 60_000,
    enabled: !!id,
  });
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: consultancyKeys.projects,
    queryFn: consultancyApi.listProjects,
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: consultancyKeys.project(id),
    queryFn: () => consultancyApi.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ConsultancyProjectCreate) => consultancyApi.createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.projects });
    },
  });
}

export function useUpdateProject(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ConsultancyProjectUpdate) => consultancyApi.updateProject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.project(id) });
      qc.invalidateQueries({ queryKey: consultancyKeys.projects });
    },
  });
}

export function useProvisionTemplate(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: number) => consultancyApi.provisionTemplate(projectId, templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.tasks(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.assessments(projectId) });
    },
  });
}

// ── Go-Live ───────────────────────────────────────────────────────────────────

export function useGoLiveDefinitions(projectId: number) {
  return useQuery({
    queryKey: consultancyKeys.goLiveDefinitions(projectId),
    queryFn: () => consultancyApi.listGoLiveDefinitions(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60_000,
  });
}

export function useUpsertGoLiveConfig(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checkKey, data }: { checkKey: string; data: ProjectGoLiveConfigUpsert }) =>
      consultancyApi.upsertGoLiveConfig(projectId, checkKey, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.goLiveDefinitions(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.readiness(projectId) });
    },
  });
}

export function useResetGoLiveConfig(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checkKey: string) => consultancyApi.resetGoLiveConfig(projectId, checkKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.goLiveDefinitions(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.readiness(projectId) });
    },
  });
}

export function useReadiness(projectId: number) {
  return useQuery({
    queryKey: consultancyKeys.readiness(projectId),
    queryFn: () => consultancyApi.getReadiness(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: true,
  });
}

export function useExecuteGoLive(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => consultancyApi.executeGoLive(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.project(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.projects });
      qc.invalidateQueries({ queryKey: consultancyKeys.readiness(projectId) });
    },
  });
}

// ── Assessments ───────────────────────────────────────────────────────────────

export function useAssessments(projectId: number) {
  return useQuery({
    queryKey: consultancyKeys.assessments(projectId),
    queryFn: () => consultancyApi.listAssessments(projectId),
    enabled: !!projectId,
  });
}

export function useAssessment(id: number) {
  return useQuery({
    queryKey: consultancyKeys.assessment(id),
    queryFn: () => consultancyApi.getAssessment(id),
    enabled: !!id,
  });
}

export function useCreateAssessment(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GapAssessmentCreate) => consultancyApi.createAssessment(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.assessments(projectId) });
    },
  });
}

export function useUpdateAssessment(id: number, projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GapAssessmentUpdate) => consultancyApi.updateAssessment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.assessment(id) });
      qc.invalidateQueries({ queryKey: consultancyKeys.assessments(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.readiness(projectId) });
    },
  });
}

// ── Assessment Items ──────────────────────────────────────────────────────────

export function useAssessmentItems(assessmentId: number) {
  return useQuery({
    queryKey: consultancyKeys.assessmentItems(assessmentId),
    queryFn: () => consultancyApi.getAssessmentItems(assessmentId),
    enabled: !!assessmentId,
  });
}

export function usePopulateAssessment(assessmentId: number, projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (frameworkId: number) => consultancyApi.populateAssessment(assessmentId, frameworkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.assessmentItems(assessmentId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.assessments(projectId) });
    },
  });
}

export function useUpdateAssessmentItem(assessmentId: number, projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: GapAssessmentItemUpdate }) =>
      consultancyApi.updateAssessmentItem(assessmentId, itemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.assessmentItems(assessmentId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.tasks(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.readiness(projectId) });
    },
  });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function useTasks(projectId: number, status?: string) {
  return useQuery({
    queryKey: consultancyKeys.tasks(projectId, status),
    queryFn: () => consultancyApi.listTasks(projectId, status),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ConsultancyTaskCreate) => consultancyApi.createTask(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.tasks(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.readiness(projectId) });
    },
  });
}

export function useUpdateTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConsultancyTaskUpdate }) =>
      consultancyApi.updateTask(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.tasks(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.readiness(projectId) });
    },
  });
}

export function useCompleteTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => consultancyApi.completeTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultancyKeys.tasks(projectId) });
      qc.invalidateQueries({ queryKey: consultancyKeys.readiness(projectId) });
    },
  });
}

// ── Lifecycle Transitions ─────────────────────────────────────────────────────

export function useTransitionInstrument() {
  return useMutation({
    mutationFn: ({ instrumentId, data }: { instrumentId: number; data: LifecycleTransitionRequest }) =>
      lifecycleApi.transitionInstrument(instrumentId, data),
  });
}

export function useTransitionMethod() {
  return useMutation({
    mutationFn: ({ methodId, data }: { methodId: number; data: LifecycleTransitionRequest }) =>
      lifecycleApi.transitionMethod(methodId, data),
  });
}

export function useTransitionDocument() {
  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: number; data: LifecycleTransitionRequest }) =>
      lifecycleApi.transitionDocument(documentId, data),
  });
}
