export function jenkins(): boolean {
  return !!process.env.WORKSPACE;
}
