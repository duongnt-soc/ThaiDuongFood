/**
 * Checks if the given object has any values that are not `null` or `undefined`.
 *
 * @param obj - The object to check for values.
 * @returns `true` if the object has at least one value that is not `null` or `undefined`, otherwise `false`.
 */
export function hasValues(obj: Record<string, any>): boolean {
  return Object.values(obj).some((value) => !!value)
}
