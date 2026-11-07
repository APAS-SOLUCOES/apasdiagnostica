/** Deterministic variant choice: same assessment + same slot always yields the same wording. */
export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickVariant<T>(variants: readonly T[], assessmentId: string, slot: string): T {
  if (variants.length === 0) throw new Error(`Sem variações para ${slot}.`);
  return variants[hashString(`${assessmentId}::${slot}`) % variants.length] as T;
}
