interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center mb-4 text-[var(--color-muted)]">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-muted)] max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}
