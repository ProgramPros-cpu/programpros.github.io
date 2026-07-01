import { MapPin, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function LocationsPage() {
  return (
    <EmptyState
      icon={MapPin}
      title="No locations defined"
      description="Define regions, districts, and areas to organize family data by geography. Locations help filter records and assign field workers."
      actionLabel="Add Location"
      actionHref="/settings"
    />
  );
}
