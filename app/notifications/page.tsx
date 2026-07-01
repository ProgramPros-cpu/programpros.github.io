import { Bell, Settings } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function NotificationsPage() {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="System and activity notifications will appear here. Configure notification preferences in Settings to control what you see."
      actionLabel="Notification Settings"
      actionHref="/settings"
    />
  );
}
