import { ScrollText, Settings } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function AuditLogsPage() {
  return (
    <EmptyState
      icon={ScrollText}
      title="No audit logs recorded"
      description="System activity logs — logins, edits, approvals, and deletions — will be tracked here for compliance and security review."
      actionLabel="Audit Settings"
      actionHref="/settings"
    />
  );
}
