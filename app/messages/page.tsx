import { MessageSquare, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function MessagesPage() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No messages"
      description="Direct messages between administrators and field workers will appear here. Start a conversation to coordinate data collection."
      actionLabel="New Message"
      actionHref="/settings"
    />
  );
}
