import { ProjectContextSetter } from "./ProjectContextSetter";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <ProjectContextSetter id={Number(id)} />
      {children}
    </>
  );
}
