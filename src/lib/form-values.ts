/**
 * Helpers for hydrating react-hook-form default values from a DB record.
 * `null` becomes `undefined` so optional number/string fields stay empty
 * instead of rendering "null".
 */
export type FormRecord = Record<string, unknown>;

export function toFormValues<T extends FormRecord>(
  record: FormRecord | null | undefined
): Partial<T> {
  if (!record) return {} as Partial<T>;
  const out: FormRecord = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = value === null ? undefined : value;
  }
  return out as Partial<T>;
}

/** Merge schema defaults with the values of an existing record (edit mode). */
export function withDefaults<T extends FormRecord>(
  defaults: T,
  record: FormRecord | null | undefined
): T {
  return { ...defaults, ...toFormValues<T>(record) };
}
