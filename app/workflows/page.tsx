import { Workflow, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function WorkflowsPage() {
  return (
    <EmptyState
      icon={Workflow}
      title="No workflows configured"
      description="Automate data review with approval workflows. Define steps from submission to verification to publication."
      actionLabel="Create Workflow"
      actionHref="/settings"
    />
  );
}
