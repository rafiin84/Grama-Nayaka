/** Next unused id for a prefix. `taken` reports whether an id already exists, so a counter that restarts on page reload can never reuse one. */
export function nextId(prefix: string, taken: (id: string) => boolean, counter: { n: number }): string {
  let id: string; do { id = `${prefix}-${++counter.n}`; } while (taken(id)); return id;
}
