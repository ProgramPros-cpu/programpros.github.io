import { BarChart3, FileText } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function ReportsPage() {
  return (
    <EmptyState
      icon={BarChart3}
      title="No reports generated"
      description="Generate detailed reports on family data, survey completion, and regional breakdowns. Build a report from existing form data."
      actionLabel="Generate Report"
      actionHref="/forms"
    />
  );
}
