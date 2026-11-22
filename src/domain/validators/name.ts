export function isValidName(value: string): boolean {
  return value.trim().length >= 3 && /[a-zA-ZÀ-ÿ]/.test(value);
}
