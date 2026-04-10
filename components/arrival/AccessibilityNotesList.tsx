interface AccessibilityNotesListProps {
  notes: string[];
}

export function AccessibilityNotesList({ notes }: AccessibilityNotesListProps) {
  if (notes.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary">Accessibility notes</h3>
      <ul className="mt-2 space-y-1.5" role="list">
        {notes.map((note, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
            <span
              className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-sage/20 text-sage"
              aria-hidden
            >
              ✓
            </span>
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
