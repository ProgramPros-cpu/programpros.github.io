import { Megaphone, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function AnnouncementsPage() {
  return (
    <EmptyState
      icon={Megaphone}
      title="No announcements posted"
      description="Post announcements to notify field workers and members about updates, deadlines, and new survey launches."
      actionLabel="New Announcement"
      actionHref="/settings"
    />
  );
}
