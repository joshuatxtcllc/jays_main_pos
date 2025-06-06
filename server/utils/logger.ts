
export function log(message: string, category?: string) {
  const timestamp = new Date().toISOString();
  const prefix = category ? `[${category}]` : '';
  console.log(`${timestamp} ${prefix} ${message}`);
}
