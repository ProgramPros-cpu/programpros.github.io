import { Database, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function DataCollectionPage() {
  return (
    <EmptyState
      icon={Database}
      title="No active data collection campaigns"
      description="Create a data collection campaign to start gathering family information from field workers across regions."
      actionLabel="New Campaign"
      actionHref="/forms"
    />
  );
}
