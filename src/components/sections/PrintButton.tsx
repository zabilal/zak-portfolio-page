"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center rounded-md border border-line-2 px-3 text-sm text-fg"
    >
      Print
    </button>
  );
}
