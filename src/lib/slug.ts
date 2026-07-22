export function getPackageSlug(pkg: { slug?: string; title: string; id?: string }): string {
  if (pkg.slug) return pkg.slug;
  return (pkg.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');
}
