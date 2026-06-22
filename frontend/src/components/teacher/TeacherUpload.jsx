import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import {
    MdOutlineSlideshow, MdSave, MdCheckCircle, MdChevronLeft, MdChevronRight,
    MdCircle, MdShare, MdInfo, MdGridView, MdViewSidebar
} from 'react-icons/md';

/* ─── Bloom's Taxonomy Levels ─────────────────────────────────────── */
const BLOOM_LEVELS = [
    { id: 'remember',   label: 'Remember',   color: '#6366F1', bg: 'rgba(99,102,241,0.13)',   emoji: '🧠', verbs: 'Recall, List, Name, Define' },
    { id: 'understand', label: 'Understand',  color: '#3B82F6', bg: 'rgba(59,130,246,0.13)',   emoji: '💡', verbs: 'Explain, Summarize, Classify' },
    { id: 'apply',      label: 'Apply',       color: '#10B981', bg: 'rgba(16,185,129,0.13)',   emoji: '🔧', verbs: 'Demonstrate, Solve, Execute' },
    { id: 'analyze',    label: 'Analyze',     color: '#F59E0B', bg: 'rgba(245,158,11,0.13)',   emoji: '🔍', verbs: 'Differentiate, Compare, Examine' },
    { id: 'evaluate',   label: 'Evaluate',    color: '#EF4444', bg: 'rgba(239,68,68,0.13)',    emoji: '⚖️', verbs: 'Judge, Critique, Justify' },
    { id: 'create',     label: 'Create',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.13)',   emoji: '✨', verbs: 'Design, Build, Construct' },
];

/* ─── PPTX Parser ─────────────────────────────────────────────────── */
const parseSlides = async () => {
    const res = await fetch('/FlutterWebEmulator.pptx');
    if (!res.ok) throw new Error('Could not fetch presentation file.');
    const buf = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);

    const slideKeys = Object.keys(zip.files)
        .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
        .sort((a, b) => {
            const na = parseInt(a.match(/slide(\d+)\.xml$/)[1]);
            const nb = parseInt(b.match(/slide(\d+)\.xml$/)[1]);
            return na - nb;
        });

    const slides = [];
    for (let i = 0; i < slideKeys.length; i++) {
        const xml = await zip.files[slideKeys[i]].async('string');
        const textMatches = [...xml.matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g)];
        const texts = textMatches
            .map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#xA;/g, ' ').trim())
            .filter(t => t.length > 1);

        const title = texts.find(t => t.length > 2) || `Slide ${i + 1}`;
        const bullets = [...new Set(texts.filter(t => t !== title))].slice(0, 6);

        slides.push({ id: i + 1, number: i + 1, title, bullets, taxonomyLevel: null });
    }
    return slides;
};

/* ─── Component ───────────────────────────────────────────────────── */
const TeacherUpload = () => {
    const [slides, setSlides]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [selected, setSelected]       = useState(0);
    const [saving, setSaving]           = useState(false);
    const [saved, setSaved]             = useState(false);
    const [viewMode, setViewMode]       = useState('split'); // 'split' | 'grid'
    const filmstripRef                  = useRef(null);

    /* load PPTX */
    useEffect(() => {
        const cfg = localStorage.getItem('classeta_taxonomy_config');
        parseSlides()
            .then(parsed => {
                if (cfg) {
                    const map = JSON.parse(cfg);
                    setSlides(parsed.map(s => ({ ...s, taxonomyLevel: map[s.id] || null })));
                } else {
                    setSlides(parsed);
                }
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    /* scroll filmstrip to selected slide */
    useEffect(() => {
        if (!filmstripRef.current) return;
        const item = filmstripRef.current.querySelector(`[data-idx="${selected}"]`);
        if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [selected]);

    const setTaxonomy = (slideId, levelId) => {
        setSlides(prev => prev.map(s => s.id === slideId ? { ...s, taxonomyLevel: levelId } : s));
    };

    const navigate = (dir) => {
        setSelected(prev => Math.max(0, Math.min(slides.length - 1, prev + dir)));
    };

    const shareWithStudents = async () => {
        setSaving(true);
        const cfg = {}; slides.forEach(s => { cfg[s.id] = s.taxonomyLevel; });
        localStorage.setItem('classeta_taxonomy_config', JSON.stringify(cfg));
        localStorage.setItem('classeta_taxonomy_slides', JSON.stringify(slides));
        localStorage.setItem('classeta_taxonomy_shared', 'true');
        localStorage.setItem('classeta_taxonomy_shared_at', new Date().toISOString());
        await new Promise(r => setTimeout(r, 900));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
    };

    const labeled    = slides.filter(s => s.taxonomyLevel).length;
    const pct        = slides.length ? Math.round((labeled / slides.length) * 100) : 0;
    const current    = slides[selected];
    const currLevel  = BLOOM_LEVELS.find(l => l.id === current?.taxonomyLevel);

    /* ── loading / error ── */
    if (loading) return (
        <div className="page-content animate-fade">
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:16 }}>
                <div className="spinner" style={{ width:44, height:44, borderWidth:4 }} />
                <p style={{ color:'var(--text-muted)', fontSize:14 }}>Parsing presentation slides…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="page-content animate-fade">
            <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>
                Ensure <strong>FlutterWebEmulator.pptx</strong> exists in the <code>/public</code> folder.
            </p>
        </div>
    );

    return (
        <div className="page-content animate-fade" style={{ paddingBottom: 0 }}>

            {/* ─── Header ─── */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                <div>
                    <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>
                        Taxonomy Slide Labeler
                    </h1>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>
                        Assign Bloom's Taxonomy levels to each slide, then share with students.
                    </p>
                </div>

                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    {/* view toggle */}
                    <div style={{ display:'flex', background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', overflow:'hidden' }}>
                        {[['split', MdViewSidebar], ['grid', MdGridView]].map(([m, Icon]) => (
                            <button key={m} onClick={() => setViewMode(m)}
                                style={{ padding:'7px 12px', border:'none', cursor:'pointer', background: viewMode===m ? 'var(--primary)' : 'transparent', color: viewMode===m ? '#fff' : 'var(--text-muted)', transition:'var(--t-fast)', display:'flex', alignItems:'center' }}>
                                <Icon size={16} />
                            </button>
                        ))}
                    </div>

                    <button className="btn btn-primary" onClick={shareWithStudents} disabled={saving || saved}>
                        {saving ? <><div className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Saving…</>
                         : saved ? <><MdCheckCircle size={16} /> Shared!</>
                         : <><MdShare size={16} /> Share with Students</>}
                    </button>
                </div>
            </div>

            {/* ─── Progress bar ─── */}
            <div style={{ marginBottom:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'14px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>
                        <MdOutlineSlideshow size={15} style={{ verticalAlign:'middle', marginRight:6 }} />
                        FlutterWebEmulator.pptx — {slides.length} slides
                    </span>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{labeled} / {slides.length} labeled ({pct}%)</span>
                </div>
                <div style={{ height:6, background:'var(--bg-input)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#4B6BFB,#8B5CF6)', borderRadius:99, transition:'width 0.5s ease' }} />
                </div>

                {/* level counters */}
                <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                    {BLOOM_LEVELS.map(l => {
                        const cnt = slides.filter(s => s.taxonomyLevel === l.id).length;
                        if (!cnt) return null;
                        return (
                            <span key={l.id} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99, background:l.bg, color:l.color, border:`1px solid ${l.color}33` }}>
                                {l.emoji} {l.label}: {cnt}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* ─── Grid view ─── */}
            {viewMode === 'grid' && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, paddingBottom:24 }}>
                    {slides.map((s, i) => {
                        const lv = BLOOM_LEVELS.find(l => l.id === s.taxonomyLevel);
                        return (
                            <div key={s.id} onClick={() => { setSelected(i); setViewMode('split'); }}
                                style={{ background:'var(--bg-card)', border:`2px solid ${lv ? lv.color+'55' : 'var(--border)'}`, borderRadius:'var(--r-md)', padding:14, cursor:'pointer', transition:'var(--t-fast)' }}
                                className="slide-grid-card">
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                                    <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>Slide {s.number}</span>
                                    {lv && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background:lv.bg, color:lv.color, fontWeight:700 }}>{lv.emoji} {lv.label}</span>}
                                </div>
                                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)', lineHeight:1.4, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{s.title}</div>
                                {!s.taxonomyLevel && <div style={{ fontSize:11, color:'var(--warning)', fontWeight:500 }}>⚠ Not labeled</div>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Split view ─── */}
            {viewMode === 'split' && (
                <div style={{ display:'flex', gap:16, height:'calc(100vh - 310px)', minHeight:480, paddingBottom:24 }}>

                    {/* Filmstrip */}
                    <div ref={filmstripRef} style={{ width:180, flexShrink:0, overflowY:'auto', display:'flex', flexDirection:'column', gap:6, paddingRight:4 }} className="thin-scroll">
                        {slides.map((s, i) => {
                            const lv = BLOOM_LEVELS.find(l => l.id === s.taxonomyLevel);
                            const isActive = i === selected;
                            return (
                                <button key={s.id} data-idx={i} onClick={() => setSelected(i)}
                                    style={{
                                        textAlign:'left', padding:'10px 12px', borderRadius:'var(--r-md)', border:`2px solid ${isActive ? 'var(--primary)' : lv ? lv.color+'44' : 'var(--border)'}`,
                                        background: isActive ? 'var(--primary-muted)' : 'var(--bg-card)', cursor:'pointer', transition:'var(--t-fast)', flexShrink:0
                                    }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                                        <span style={{ fontSize:10, fontWeight:700, color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>#{s.number}</span>
                                        {lv && <MdCircle size={8} color={lv.color} />}
                                    </div>
                                    <div style={{ fontSize:11, fontWeight:600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                        {s.title}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Slide detail */}
                    {current && (
                        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14, overflow:'hidden' }}>

                            {/* Slide preview card */}
                            <div style={{
                                flex:1, background: currLevel ? currLevel.bg : 'var(--bg-card)',
                                border:`2px solid ${currLevel ? currLevel.color+'44' : 'var(--border)'}`,
                                borderRadius:'var(--r-xl)', padding:32, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'center'
                            }}>
                                {/* Taxonomy badge */}
                                {currLevel && (
                                    <div style={{
                                        position:'absolute', top:20, right:20,
                                        display:'flex', alignItems:'center', gap:8, padding:'8px 16px',
                                        background: currLevel.color, borderRadius:99, color:'#fff',
                                        fontSize:13, fontWeight:700, boxShadow:`0 4px 16px ${currLevel.color}55`
                                    }}>
                                        <span style={{ fontSize:16 }}>{currLevel.emoji}</span>
                                        {currLevel.label}
                                    </div>
                                )}

                                {!currLevel && (
                                    <div style={{ position:'absolute', top:20, right:20, display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'var(--warning-bg)', border:'1px solid var(--warning-border)', borderRadius:99, color:'var(--warning-text)', fontSize:12, fontWeight:600 }}>
                                        <MdInfo size={14} /> Not labeled
                                    </div>
                                )}

                                {/* Slide number */}
                                <div style={{ fontSize:12, fontWeight:600, color: currLevel ? currLevel.color : 'var(--text-muted)', marginBottom:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>
                                    Slide {current.number} of {slides.length}
                                </div>

                                {/* Title */}
                                <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:16, lineHeight:1.3 }}>
                                    {current.title}
                                </h2>

                                {/* Bullets */}
                                {current.bullets.length > 0 && (
                                    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:6 }}>
                                        {current.bullets.map((b, i) => (
                                            <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>
                                                <span style={{ flexShrink:0, width:6, height:6, borderRadius:'50%', background: currLevel ? currLevel.color : 'var(--text-muted)', marginTop:6 }} />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Navigation */}
                            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                                <button className="btn btn-ghost" onClick={() => navigate(-1)} disabled={selected === 0}>
                                    <MdChevronLeft size={18} /> Previous
                                </button>
                                <span style={{ padding:'8px 16px', fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>
                                    {selected + 1} / {slides.length}
                                </span>
                                <button className="btn btn-ghost" onClick={() => navigate(1)} disabled={selected === slides.length - 1}>
                                    Next <MdChevronRight size={18} />
                                </button>
                            </div>

                            {/* Taxonomy Selector */}
                            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:18 }}>
                                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-secondary)', marginBottom:12 }}>
                                    Set Bloom's Taxonomy Level for this slide:
                                </div>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                                    {BLOOM_LEVELS.map(l => {
                                        const isSel = current.taxonomyLevel === l.id;
                                        return (
                                            <button key={l.id} onClick={() => setTaxonomy(current.id, isSel ? null : l.id)}
                                                style={{
                                                    padding:'10px 12px', borderRadius:'var(--r-md)', border:`2px solid ${isSel ? l.color : 'var(--border)'}`,
                                                    background: isSel ? l.bg : 'transparent', cursor:'pointer', transition:'var(--t-fast)',
                                                    textAlign:'left', display:'flex', flexDirection:'column', gap:2
                                                }}>
                                                <span style={{ fontSize:16 }}>{l.emoji}</span>
                                                <span style={{ fontSize:12, fontWeight:700, color: isSel ? l.color : 'var(--text-secondary)' }}>{l.label}</span>
                                                <span style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.3 }}>{l.verbs}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherUpload;
