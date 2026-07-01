import { FolderTree, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function ProgramsPage() {
  return (
    <EmptyState
      icon={FolderTree}
      title="No programs created"
      description="Programs group related surveys and data collection efforts. Create a program to organize welfare, health, or education initiatives."
      actionLabel="Create Program"
      actionHref="/forms"
    />
  );
}
