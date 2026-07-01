import { Inbox, FileText } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function SubmissionsPage() {
  return (
    <EmptyState
      icon={Inbox}
      title="No submissions yet"
      description="Form submissions from field workers will appear here for review and approval. Create a form to get started."
      actionLabel="Create Form"
      actionHref="/forms"
    />
  );
}
