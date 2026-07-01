import { SlidersHorizontal, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function CategoriesPage() {
  return (
    <EmptyState
      icon={SlidersHorizontal}
      title="No categories defined"
      description="Categories help classify family records into groups like health, education, housing, and employment for easier filtering."
      actionLabel="Add Category"
      actionHref="/settings"
    />
  );
}
