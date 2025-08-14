export function logError(error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
}