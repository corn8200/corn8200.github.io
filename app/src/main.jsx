import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { loadRegistry, loadResumeJson } from './useResumeData.js';
import './index.css';

function safeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const s = url.trim();
  if (/^mailto:|^tel:/i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return '#';
}

function prettyPhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith('1')) return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  return raw;
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch { return url; }
}

function splitSkill(v) {
  if (Array.isArray(v)) return v.flatMap(splitSkill).map(s => s.trim()).filter(Boolean);
  return String(v).split(/\n|;\s*|\s•\s|•|\s\|\s|,\s*/).map(s => s.trim()).filter(Boolean);
}

function View() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: null, model: null });

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
        setState({ loading: false, error: null, model: normalize(json) });
      } catch (e) {
        setState({ loading: false, error: String(e), model: null });
      }
    })();
  }, [slug]);

  if (state.loading) return <div className="load">Loading.</div>;
  if (state.error) return <div className="err">Couldn't load resume. {state.error}</div>;

  const m = state.model;
  const { kpis, mail, tel, li, gh, location, phonePretty } = m;

  return (
    <article className="page" aria-label={`Resume of ${m.name}`}>
      <header className="hdr">
        <div className="eyebrow">Curriculum vitae</div>
        <div className="hdr-top">
          <div>
            <h1>{m.name}</h1>
            {(m.role || location) && (
              <div className="role">
                {m.role}
                {m.role && location && <span className="sep">·</span>}
                {location && <span className="loc">{location}</span>}
              </div>
            )}
          </div>
          <nav className="actions" aria-label="Primary">
            {mail && <a className="btn" href={safeUrl(mail)} rel="noopener noreferrer">Email</a>}
            {tel && <a className="btn" href={safeUrl(tel)}>Call</a>}
            {li && <a className="btn" href={safeUrl(li)} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {gh && <a className="btn" href={safeUrl(gh)} target="_blank" rel="noopener noreferrer">GitHub</a>}
          </nav>
        </div>

        <div className="contact-row">
          {phonePretty && <span>{phonePretty}</span>}
          {phonePretty && mail && <span className="dot" aria-hidden />}
          {m.email && <a href={safeUrl(mail)}>{m.email}</a>}
          {m.email && li && <span className="dot" aria-hidden />}
          {li && <a href={safeUrl(li)} target="_blank" rel="noopener noreferrer">{hostFromUrl(li)}</a>}
          {li && gh && <span className="dot" aria-hidden />}
          {gh && <a href={safeUrl(gh)} target="_blank" rel="noopener noreferrer">{hostFromUrl(gh)}</a>}
        </div>

        {kpis?.length > 0 && (
          <div className="kpis">
            {kpis.map((t, i) => <span key={i} className="kpi">{t}</span>)}
          </div>
        )}
      </header>

      {m.summary && (
        <section className="sec">
          <h2>Summary</h2>
          <p className="summary">{m.summary}</p>
        </section>
      )}

      {m.skills_groups?.length > 0 && (
        <section className="sec">
          <h2>Core skills</h2>
          <div className="skills-groups">
            {m.skills_groups.map(({ category, items }) => (
              <div key={category} className="skill-group">
                <div className="cat">{category}</div>
                <ul>
                  {items.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {m.experience?.length > 0 && (
        <section className="sec">
          <h2>Experience</h2>
          <div className="xp">
            {m.experience.map((e, i) => (
              <div key={i} className="exp-card">
                <h3 className="exp-head">
                  {e.title}
                  {e.company && <span className="at"> · {e.company}</span>}
                </h3>
                <div className="exp-meta">
                  {e.dates && <span className="dates">{e.dates}</span>}
                  {e.location && <span>{e.location}</span>}
                </div>
                {e.duties?.length > 0 && (
                  <>
                    <div className="subhead">Responsibilities</div>
                    <ul>{e.duties.map((d, j) => <li key={j}>{d}</li>)}</ul>
                  </>
                )}
                {e.achievements?.length > 0 && (
                  <>
                    <div className="subhead">Impact</div>
                    <ul className="ach">{e.achievements.map((a, j) => <li key={j}>{a}</li>)}</ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {m.education?.length > 0 && (
        <section className="sec">
          <h2>Education</h2>
          {m.education.map((e, i) => (
            <div key={i} className="edu-row">
              <div className="degree">{e.degree}</div>
              <div className="school">
                {e.school}
                {e.year && <span className="year">{e.year}</span>}
                {e.gpa && <span className="year">GPA {e.gpa}</span>}
              </div>
              {e.details && <div className="detail">{e.details}</div>}
            </div>
          ))}
        </section>
      )}

      {m.certifications?.length > 0 && (
        <section className="sec">
          <h2>Certifications</h2>
          {m.certifications.map((c, i) => {
            const name = c.name || '';
            const isCS50AI = /CS50/i.test(name) && /Artificial\s+Intelligence\s+with\s+Python/i.test(name);
            const isCS50Series = /CS50/i.test(name) && /(Computer\s+Science).*Programming|Series/i.test(name);
            return (
              <div key={i} className="cert-row">
                <div className="name">{c.name}</div>
                <div className="issuer">
                  {c.issuer}
                  {c.year && <span className="year">{c.year}</span>}
                </div>
                {isCS50AI && (
                  <div className="cert-desc">Search and graph algorithms, machine learning (classification, optimization), probability, and hands-on Python with scikit-learn.</div>
                )}
                {isCS50Series && (
                  <div className="cert-desc">Core CS (C, memory, data structures, algorithms), Python, web (Flask, JS), and SQL fundamentals.</div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {m.training?.length > 0 && (
        <section className="sec">
          <h2>Training</h2>
          {m.training.map((t, i) => (
            <div key={i} className="cert-row">
              <div className="name">{t.name || t.title || t}</div>
              {(t.issuer || t.year) && (
                <div className="issuer">
                  {t.issuer}
                  {t.year && <span className="year">{t.year}</span>}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {m.awards?.length > 0 && (
        <section className="sec">
          <h2>Awards</h2>
          <div className="affil">
            <ul>{m.awards.map((a, i) => <li key={i}>{typeof a === 'string' ? a : (a.name || a.title)}</li>)}</ul>
          </div>
        </section>
      )}

      {m.affiliations?.length > 0 && (
        <section className="sec affil">
          <h2>Affiliations</h2>
          <ul>{m.affiliations.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </section>
      )}

      <footer className="ftr">
        <span className="mark">John Cornelius</span>
        <span>{m.slug} · v{m.version}</span>
      </footer>
    </article>
  );
}

function normalize(doc) {
  const meta = doc.meta || {};
  const name = doc.name || meta.name || 'John Cornelius';
  const role = doc.title || meta.role || '';
  const location = doc.contact?.location || meta.location || '';

  let skills_groups = null;
  if (doc.skills && !Array.isArray(doc.skills) && typeof doc.skills === 'object') {
    skills_groups = Object.entries(doc.skills).map(([category, v]) => ({
      category,
      items: splitSkill(v),
    }));
  } else if (Array.isArray(doc.skills)) {
    skills_groups = [{ category: 'Skills', items: doc.skills.flatMap(splitSkill) }];
  }

  const experience = Array.isArray(doc.experience) ? doc.experience.map(e => ({
    title: e.title || '',
    company: e.company || '',
    location: e.location || '',
    dates: e.dates || [e.start, e.end].filter(Boolean).join(' — '),
    duties: Array.isArray(e.duties) ? e.duties : Array.isArray(e.bullets) ? e.bullets : [],
    achievements: Array.isArray(e.achievements) ? e.achievements : [],
  })) : [];

  const education = Array.isArray(doc.education) ? doc.education.map(e => ({ ...e, details: e.details || '' })) : [];
  const certifications = Array.isArray(doc.certifications) ? doc.certifications : [];
  const training = Array.isArray(doc.training) ? doc.training : [];
  const awards = Array.isArray(doc.awards) ? doc.awards : [];
  const affiliations = Array.isArray(doc.affiliations) ? doc.affiliations : [];
  const kpis = Array.isArray(meta.kpis) ? meta.kpis : [];

  const email = doc.contact?.email || null;
  const phone = doc.contact?.phone || null;
  const mail = email ? `mailto:${email}` : null;
  const tel = phone ? `tel:${String(phone).replace(/[^\d+]/g, '')}` : null;
  const phonePretty = prettyPhone(phone);
  const li = doc.contact?.linkedin || null;
  const gh = doc.contact?.github || null;

  return {
    name, role, location,
    summary: doc.summary || '',
    skills_groups,
    experience, education, certifications, training, awards, affiliations,
    kpis,
    email, phone, phonePretty, mail, tel, li, gh,
    slug: meta.slug, version: meta.version,
  };
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
