export function readText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return;
  const text = value.trim();
  return text && text.length <= maxLength ? text : undefined;
}
