export function logRuntime<T>(str: string, func: () => T): T {
  const start = Date.now();
  const r = func();
  const end = Date.now();
  console.log(`${str}: ${end - start}ms`);
  return r;
}
