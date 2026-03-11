/** Shallow-compare two objects by top-level key identity (===). */
export function shallowEqual(a: object | null, b: object): boolean {
  if (a === null) return false;
  const objA = a as Record<string, unknown>, objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysB) {
    if (objA[key] !== objB[key]) return false;
  }
  return true;
}
