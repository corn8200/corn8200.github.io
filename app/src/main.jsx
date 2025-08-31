import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { Chrono } from 'react-chrono';
import { loadRegistry, loadResumeJson } from './useResumeData.js';
import './index.css';

function safeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const s = url.trim();
  if (/^mailto:/i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return '#';
}

function View() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: null, model: null });
  const [expandedSections, setExpandedSections] = useState({ summary: true });
  const [activeSkill, setActiveSkill] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const reg = await loadRegistry();
        const bySlugOrAlias = (s) => (v) => v.slug === s || (Array.isArray(v.aliases) && v.aliases.includes(s));
        const newest = (variants = []) => {
          const parse = (v) => (String(v||'0.0.0').split('.').map(n=>parseInt(n,10)));
          return [...variants].sort((a,b)=>{
            const [a1=0,a2=0,a3=0]=parse(a.version); const [b1=0,b2=0,b3=0]=parse(b.version);
            if (b1!==a1) return b1-a1; if (b2!==a2) return b2-a2; return b3-a3;
          })[0] || null;
        };

        let meta = null;
        if (slug) meta = reg.variants?.find(bySlugOrAlias(slug)) || null;
        if (!meta && reg.default) meta = reg.variants?.find(bySlugOrAlias(reg.default)) || null;
        if (!meta) meta = newest(reg.variants);
        if (!meta) throw new Error('No variants defined in index.json');
        const json = await loadResumeJson(meta.slug, meta.version);
        const m = normalize(json);
        setState({ loading: false, error: null, model: m });
      } catch (e) {
        setState({ loading: false, error: String(e), model: null });
      }
    })();
  }, [slug]);

  const toggleSection = section => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (state.loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (state.error) return <div style={{ padding: 24, color: '#b00' }}>Error: {state.error}</div>;

  const m = state.model;
  const { kpis, mail, li } = m;
  const experienceItems = m.experience.map(e => ({
    title: e.dates,
    cardTitle: `${e.title}`,
    cardSubtitle: [e.company, e.location].filter(Boolean).join(' • '),
    cardDetailedText: [
      ...(e.duties?.length ? ['Duties:', ...e.duties] : []),
      ...(e.achievements?.length ? ['Achievements:', ...e.achievements] : [])
    ]
  }));

  return (
    <div className="page">
      <header className="hdr">
        <div className="hdr-top">
          <h1>{m.name}</h1>
          <div className="actions">
            {mail && <a className="btn" href={safeUrl(mail)} rel="noopener noreferrer">Email</a>}
            {li && <a className="btn" href={safeUrl(li)} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          </div>
        </div>
        <div className="role">{m.role} • {m.location}</div>
        <div className="meta">v{m.version}</div>
        {kpis?.length > 0 && (
          <div className="kpis">
            {kpis.map((t, i) => <span key={i} className="kpi">{t}</span>)}
          </div>
        )}
      </header>

      {m.summary && (
        <section className="sec">
          <h2 onClick={() => toggleSection('summary')}>Summary {expandedSections.summary ? '-' : '+'}</h2>
          {expandedSections.summary && <p>{m.summary}</p>}
        </section>
      )}

      <section className="sec">
        <h2 onClick={() => toggleSection('skills')}>Skills {expandedSections.skills ? '-' : '+'}</h2>
        {expandedSections.skills && (
          <div>
            {m.skills_kv && <div className="hint">Click a category to view details.</div>}
            {m.skills_kv && (
              <div className="chip-grid">
                {m.skills_kv.map(({ k, v }) => {
                  const items = Array.isArray(v) ? v : String(v).split(/;\s*|,\s*|\s•\s|\|/).filter(Boolean);
                  const count = items.length;
                  return (
                    <span
                      key={k}
                      className="chip"
                      onClick={() => setActiveSkill({ title: k, items })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveSkill({ title: k, items }); }}
                    >
                      {k} ({count})
                    </span>
                  );
                })}
              </div>
            )}
            {activeSkill && (
              <>
                <div className="modal-backdrop" onClick={() => setActiveSkill(null)} />
                <div className="modal" role="dialog" aria-modal="true">
                  <div className="modal-h">
                    <strong>{activeSkill.title}</strong>
                    <button className="btn btn-sm" onClick={() => setActiveSkill(null)}>Close</button>
                  </div>
                  <ul className="skill-list">
                    {activeSkill.items.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </>
            )}
            {!m.skills_kv && m.skills_list && <p>{m.skills_list}</p>}
          </div>
        )}
      </section>

      {m.experience?.length > 0 && (
        <section className="sec">
          <h2 onClick={() => toggleSection('experience')}>Experience {expandedSections.experience ? '-' : '+'}</h2>
          {expandedSections.experience && (
            <div>
              {m.experience.map((e, i) => (
                <div key={i} className="exp-card">
                  <h3 className="exp-head"><strong>{e.title}</strong>, {e.company}</h3>
                  <div className="exp-date">{[e.location, e.dates].filter(Boolean).join(' • ')}</div>
                  {e.duties?.length > 0 && (
                    <>
                      <div className="subhead">Duties</div>
                      <ul className="duties">{e.duties.map((d, j) => <li key={j}>{d}</li>)}</ul>
                    </>
                  )}
                  {e.achievements?.length > 0 && (
                    <div className="ach">
                      <div className="ach-h">Achievements</div>
                      <ul className="ach-list">{e.achievements.map((a, j) => <li key={j}>{a}</li>)}</ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {m.education?.length > 0 && (
        <section className="sec">
          <h2 onClick={() => toggleSection('education')}>Education {expandedSections.education ? '-' : '+'}</h2>
          {expandedSections.education && m.education.map((e, i) => {
            const query = encodeURIComponent(`${e.degree} ${e.school}`);
            const searchUrl = `https://www.google.com/search?q=${query}`;
            return (
              <div key={i} className="edu-row">
                <strong>{e.degree}</strong>, {e.school}{e.year ? ` (${e.year})` : ''}{e.gpa ? ` – GPA: ${e.gpa}` : ''}{e.details ? ` — ${e.details}` : ''}
                <a className="edu-link" href={searchUrl} target="_blank" rel="noopener noreferrer" title="Search this program">🔎</a>
              </div>
            );
          })}
        </section>
      )}

      {m.certifications?.length > 0 && (
        <section className="sec">
          <h2 onClick={() => toggleSection('certifications')}>Certifications {expandedSections.certifications ? '-' : '+'}</h2>
          {expandedSections.certifications && m.certifications.map((c, i) => {
            const name = c.name || '';
            const isCS50AI = /CS50/i.test(name) && /Artificial\s+Intelligence\s+with\s+Python/i.test(name);
            const isCS50Series = /CS50/i.test(name) && /(Computer\s+Science).*Programming|Series/i.test(name);
            return (
              <div key={i} className="cert-row">
                <strong>{c.name}</strong> – {c.issuer}
                {isCS50AI && (
                  <div className="cert-desc">Harvard’s CS50 AI with Python: search/graph algorithms, machine learning (classification, optimization), probability, and hands‑on Python with scikit‑learn.</div>
                )}
                {isCS50Series && (
                  <div className="cert-desc">Harvard’s CS50 Computer Science & Programming Series: core CS (C, memory, data structures, algorithms), Python, web (Flask/JS), and SQL fundamentals.</div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function normalize(doc) {
  const m = doc.meta || {};
  const name = doc.name || m.name || 'John Cornelius';
  const role = doc.title || m.role || 'Program Manager';
  const location = (doc.contact && doc.contact.location) || m.location || '';
  let skills_kv = null, skills_list = null;
  // Normalize skills: split on common separators so every item shows individually
  if (doc.skills && !Array.isArray(doc.skills) && typeof doc.skills === 'object') {
    const split = (str) => String(str)
      .split(/\n|;\s*|,\s*|\s•\s|•|\|/)
      .map(s => s.trim())
      .filter(Boolean);
    skills_kv = Object.entries(doc.skills).map(([k, arr]) => ({
      k,
      v: Array.isArray(arr)
        ? arr.flatMap(x => split(x))
        : split(arr)
    }));
  } else if (Array.isArray(doc.skills)) {
    skills_list = doc.skills.join(', ');
  }
  const exp = Array.isArray(doc.experience) ? doc.experience.map(e => ({
    title: e.title || '',
    company: e.company || '',
    location: e.location || '',
    dates: e.dates || [e.start, e.end].filter(Boolean).join(' — '),
    duties: Array.isArray(e.duties) ? e.duties : Array.isArray(e.bullets) ? e.bullets : [],
    achievements: Array.isArray(e.achievements) ? e.achievements : []
  })) : [];
  const edu = Array.isArray(doc.education) ? doc.education.map(e => ({ ...e, details: e.details || '' })) : [];
  const certs = Array.isArray(doc.certifications) ? doc.certifications : [];
  const kpis = Array.isArray(m.kpis) ? m.kpis : [];
  const mail = doc.contact?.email ? `mailto:${doc.contact.email}` : null;
  const li = doc.contact?.linkedin || null;
  return { name, role, location, summary: doc.summary || '', skills_kv, skills_list, experience: exp, education: edu, certifications: certs, kpis, mail, li, slug: m.slug, version: m.version };
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/view" replace />} />
        <Route path="/view" element={<View />} />
        <Route path="/view/:slug" element={<View />} />
      </Routes>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
