/** Joins class names, dropping falsy values. Deliberately tiny — no merge semantics needed. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
