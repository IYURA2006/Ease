interface WarningListProps {
  warnings: string[];
}

export function WarningList({ warnings }: WarningListProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber/30 bg-amber/5 p-4">
      <h3 className="text-sm font-semibold text-amber-900">Things to be aware of</h3>
      <ul className="mt-2 space-y-1.5" role="list">
        {warnings.map((warning, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
            <span className="mt-0.5 flex-shrink-0" aria-hidden>
              ⚠
            </span>
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
}
