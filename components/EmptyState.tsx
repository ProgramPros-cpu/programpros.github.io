import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-icon">
          <Icon size={32} />
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="btn btn-primary">
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
