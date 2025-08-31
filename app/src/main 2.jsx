import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, useParams, Navigate } from 'react-router-dom'
import { loadRegistry, loadResumeJson } from './useResumeData.js'
import './index.css'

function View() {
  const { slug } = useParams()
  const [state, setState] = useState({ loading:true, error:null, model:null })

  useEffect(() => {
    (async () => {
      try {
        const reg = await loadRegistry()
        const targetSlug = slug || reg.default
        const meta = reg.variants.find(v => v.slug === targetSlug)
        if (!meta) throw new Error('Slug not found in index.json')
        const json = await loadResumeJson(meta.slug, meta.version)
        const m = normalize(json)
        setState({ loading:false, error:null, model:m })
      } catch (e) {
        setState({ loading:false, error:String(e), model:null })
      }
    })()
  }, [slug])

  if (state.loading) return <div style={{padding:24}}>Loading…</div>
  if (state.error) return <div style={{padding:24,color:'#b00'}}>Error: {state.error}</div>

  const m = state.model
  return (
    <div className="page">
      <header className="hdr">
        <h1>{m.name}</h1>
        <div className="role">{m.role} • {m.location}</div>
        <div className="meta">Slug {m.slug} · v{m.version}</div>
      </header>

      {m.summary && (
        <section className="sec">
          <h2>Summary</h2>
          <p>{m.summary}</p>
        </section>
      )}

      <section className="sec">
        <h2>Skills</h2>
        {m.skills_kv?.map(({k,v}) => (
          <div key={k} className="kv"><div className="k">{k}</div><div className="v">{v}</div></div>
        ))}
        {m.skills_list && <p>{m.skills_list}</p>}
      </section>

      {m.experience?.length > 0 && (
        <section className="sec">
          <h2>Experience</h2>
          {m.experience.map((e,i)=&gt;(
            <div key={i} className="job">
              <div className="head"><strong>{e.title}</strong>, {e.company} {e.location_sep} {e.dates}</div>
              {e.duties?.length>0 && <ul>{e.duties.map((b,bi)=&gt;<li key={bi}>{b}</li>)}</ul>}
              {e.achievements?.length>0 && (<div className="ach"><h4>Achievements</h4><ul>{e.achievements.map((b,bi)=&gt;<li key={bi}>{b}</li>)}</ul></div>)}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

function normalize(doc){
  const m = doc.meta || {}
  const name = doc.name || m.name || 'John Cornelius'
  const role = doc.title || m.role || 'Program Manager'
  const location = (doc.contact && doc.contact.location) || m.location || ''
  let skills_kv = null, skills_list = null
  if (doc.skills && !Array.isArray(doc.skills) && typeof doc.skills === 'object'){
    skills_kv = Object.entries(doc.skills).map(([k,arr])=>({k, v: Array.isArray(arr)? arr.join('; ') : String(arr)}))
  } else if (Array.isArray(doc.skills)) {
    skills_list = doc.skills.join(', ')
  }
  const exp = Array.isArray(doc.experience) ? doc.experience.map(e=>({    title: e.title || '',
    company: e.company || '',
    location_sep: e.location ? '— '+e.location : '',
    dates: e.dates || [e.start, e.end].filter(Boolean).join(' — '),
    duties: Array.isArray(e.duties)? e.duties : Array.isArray(e.bullets)? e.bullets : [],
    achievements: Array.isArray(e.achievements)? e.achievements : []
  })) : []
  return { name, role, location, summary: doc.summary || '', skills_kv, skills_list, experience: exp, slug:m.slug, version:m.version }
}

function App(){
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/view" replace />} />
        <Route path="/view" element={<View/>} />
        <Route path="/view/:slug" element={<View/>} />
      </Routes>
    </HashRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>)
