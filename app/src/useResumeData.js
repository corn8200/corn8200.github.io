export async function loadRegistry() {
  const res = await fetch('/data/index.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load index.json');
  return res.json();
}
export async function loadResumeJson(slug, version) {
  // try file name convention first
  const tryPaths = [
    `/data/resumes/${slug}@${version}.json`,
    // fallback: scan all then pick match (not ideal; kept minimal)
  ];
  for (const p of tryPaths) {
    const r = await fetch(p, { cache: 'no-store' });
    if (r.ok) return r.json();
  }
  throw new Error(`Resume JSON not found for ${slug} v${version}`);
}