import { SlidersHorizontal, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function CustomFieldsPage() {
  return (
    <EmptyState
      icon={SlidersHorizontal}
      title="No custom fields"
      description="Create custom fields to capture additional family data beyond the standard form. Fields can be text, number, date, or dropdown."
      actionLabel="Add Custom Field"
      actionHref="/forms"
    />
  );
}
