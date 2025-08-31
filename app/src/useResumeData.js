const BASE = (import.meta.env.VITE_DATA_BASE || '').replace(/\/$/, '');

export async function loadRegistry() {
  const res = await fetch(`${BASE}/data/index.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load index.json');
  return res.json();
}

export async function loadResumeJson(slug, version) {
  const path = `${BASE}/data/resumes/${slug}@${version}.json`;
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Resume JSON not found for ${slug} v${version}`);
  }
  return res.json();
}