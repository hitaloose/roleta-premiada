/** Caminho de um arquivo de `public/`, respeitando o base path do build (ex.: GitHub Pages). */
export function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
