import { UserCog, UserPlus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function UsersPage() {
  return (
    <EmptyState
      icon={UserCog}
      title="No users configured"
      description="Add administrators, field workers, and reviewers to manage data collection. Assign roles to control access levels."
      actionLabel="Add User"
      actionHref="/settings"
    />
  );
}
