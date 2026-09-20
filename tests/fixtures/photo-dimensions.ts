export function photoDimensions(index: number) {
  return [
    { width: 1200, height: 800 },
    { width: 800, height: 1200 },
    { width: 900, height: 900 },
    { width: 1600, height: 600 },
  ][index % 4]!;
}
