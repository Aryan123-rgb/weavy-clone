import { api } from "~/trpc/server";
import { WorkflowWrapper } from "~/components/workflow/WorkflowWrapper";
import { notFound } from "next/navigation";

export default async function WorkflowPage({ params }: { params: Promise<{ workflowId: string }> }) {
  const { workflowId } = await params;
  
  const workflow = await api.workflow.getById({ id: workflowId });

  if (!workflow) {
    notFound();
  }

  return (
    <WorkflowWrapper 
      workflowName={workflow.name} 
      initialData={workflow.definition}
    />
  );
}
