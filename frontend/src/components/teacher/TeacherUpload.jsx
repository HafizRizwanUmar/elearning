import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import {
    MdCloudUpload, MdAutoAwesome, MdShare, MdCheckCircle,
    MdChevronLeft, MdChevronRight, MdLightbulb, MdSchool,
    MdClose, MdInfo, MdOutlineSlideshow, MdRefresh
} from 'react-icons/md';
import { AuthContext } from '../../context/AuthContext';

/* ─── Bloom's Taxonomy Levels ─────────────────────────────────────── */
const BLOOM_LEVELS = [
    { id: 'remember',   label: 'Remember',   color: '#6366F1', bg: 'rgba(99,102,241,0.12)',  emoji: '🧠', verbs: 'Recall · List · Name · Define',          pyramid: 1 },
    { id: 'understand', label: 'Understand',  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  emoji: '💡', verbs: 'Explain · Summarize · Classify',           pyramid: 2 },
    { id: 'apply',      label: 'Apply',       color: '#10B981', bg: 'rgba(16,185,129,0.12)',  emoji: '🔧', verbs: 'Demonstrate · Solve · Execute',            pyramid: 3 },
    { id: 'analyze',    label: 'Analyze',     color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  emoji: '🔍', verbs: 'Differentiate · Compare · Examine',        pyramid: 4 },
    { id: 'evaluate',   label: 'Evaluate',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   emoji: '⚖️', verbs: 'Judge · Critique · Justify',              pyramid: 5 },
    { id: 'create',     label: 'Create',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  emoji: '✨', verbs: 'Design · Build · Construct',              pyramid: 6 },
];

const getLevel = (id) => BLOOM_LEVELS.find(l => l.id === id);

/* ─── PDF Upload (Backend) ────────────────────────────────────────── */
const uploadPdf = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/teacher/taxonomy/upload-pdf', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
    }
    return await res.json();
};

/* ─── Animated loading dots ───────────────────────────────────────── */
const AnalyzingScreen = ({ message }) => (
    <div className="page-content animate-fade">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65vh', gap: 28 }}>
            {/* Pulsing robot */}
            <div style={{ position: 'relative', width: 88, height: 88 }}>
                <div className="spinner" style={{ width: 88, height: 88, borderWidth: 5, borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🤖</div>
            </div>

            <div style={{ textAlign: 'center', maxWidth: 380 }}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
                    AI is Analyzing Your Slides
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, minHeight: 22 }}>
                    {message}
                </div>
            </div>

            {/* Bloom's pulsing dots */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {BLOOM_LEVELS.map((l, i) => (
                    <div key={l.id} title={l.label} style={{
                        width: 12, height: 12, borderRadius: '50%',
                        background: l.color,
                        animation: `pulse 1.8s ease-in-out ${i * 0.25}s infinite`,
                    }} />
                ))}
            </div>
        </div>
    </div>
);

/* ─── Upload Drop Zone ────────────────────────────────────────────── */
const UploadZone = ({ onFile, error, presentations, onOpen, onAnalyze, onShare }) => {
    const [drag, setDrag] = useState(false);
    const inputRef = useRef(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
    }, [onFile]);

    return (
        <div className="page-content animate-fade">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Taxonomy Slide Analyzer
                    </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 520 }}>
                    Upload your PDF presentation. You can share it directly or ask AI to analyze and generate taxonomy improvement suggestions.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 'var(--r-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span> {error}
                </div>
            )}

            {/* Two Column Layout for Drop Zone & Recent */}
            <div style={{ display: 'grid', gridTemplateColumns: presentations?.length > 0 ? 'minmax(0, 1fr) 340px' : '1fr', gap: 28, alignItems: 'start' }}>
                
                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    style={{
                        border: `2px dashed ${drag ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--r-xl)',
                        padding: '72px 40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: drag ? 'rgba(99,102,241,0.06)' : 'var(--bg-card)',
                        transition: 'all 0.25s ease',
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => onFile(e.target.files[0])}
                    />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(99,102,241,0.2)'
                        }}>
                            <MdCloudUpload size={36} style={{ color: 'var(--primary)', opacity: drag ? 1 : 0.7 }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: drag ? 'var(--primary)' : 'var(--text-primary)' }}>
                                {drag ? 'Drop your file here!' : 'Upload Presentation'}
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                                Drag & drop your <strong>.pdf</strong> file or click to browse
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['PDF Document', 'Max 20 MB'].map(t => (
                                <span key={t} style={{ padding: '4px 12px', background: 'var(--bg-input)', borderRadius: 99, fontSize: 11, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Presentations List */}
                {presentations && presentations.length > 0 && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <MdOutlineSlideshow size={18} style={{ color: 'var(--primary)' }} />
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                                Your Presentations
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }} className="thin-scroll">
                            {presentations.map((p, i) => (
                                <div 
                                    key={p.id || i}
                                    style={{
                                        display: 'flex', flexDirection: 'column', gap: 10,
                                        padding: '14px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--r-md)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ minWidth: 0, paddingRight: 10 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {p.filename}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                                {p.slides?.length || 0} slides · Uploaded {new Date(p.uploadedAt || p.sharedAt || Date.now()).toLocaleDateString()}
                                                {p.analyzed && <span style={{ color: '#10B981', marginLeft: 8 }}>✓ Analyzed</span>}
                                                {p.shared && <span style={{ color: '#3B82F6', marginLeft: 8 }}>✓ Shared</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => onOpen(p)} style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: 12 }}>
                                            Open Slide
                                        </button>
                                        {!p.analyzed && (
                                            <button className="btn btn-ghost btn-sm" onClick={() => onAnalyze(p)} style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: 12 }}>
                                                <MdAutoAwesome size={14} /> Analyze
                                            </button>
                                        )}
                                        <button className="btn btn-ghost btn-sm" onClick={() => onShare(p)} style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: 12 }} disabled={p.shared}>
                                            <MdShare size={14} /> {p.shared ? 'Shared' : 'Share'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bloom's legend cards */}
            <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
                    What AI will classify per slide
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
                    {BLOOM_LEVELS.map(l => (
                        <div key={l.id} style={{ background: l.bg, border: `1px solid ${l.color}33`, borderRadius: 'var(--r-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 22 }}>{l.emoji}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.label}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{l.verbs}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─── Main Component ──────────────────────────────────────────────── */
const TeacherUpload = () => {
    const { user } = useContext(AuthContext);
    const [phase, setPhase]         = useState('upload');   // 'upload' | 'analyzing' | 'results'
    const [slides, setSlides]       = useState([]);
    const [selected, setSelected]   = useState(0);
    const [file, setFile]           = useState(null);
    const [pdfUrl, setPdfUrl]       = useState(null);
    const [sharing, setSharing]     = useState(false);
    const [shared, setShared]       = useState(false);
    const [error, setError]         = useState('');
    const [progress, setProgress]   = useState('');
    const [presentations, setPresentations] = useState([]);
    const [activeId, setActiveId]   = useState(null);
    const filmstripRef              = useRef(null);

    // load on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem('classeta_teacher_presentations');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setPresentations(parsed);
            } else {
                const rawShared = localStorage.getItem('classeta_taxonomy_presentations');
                if (rawShared) {
                    const parsed = JSON.parse(rawShared);
                    if (Array.isArray(parsed)) {
                        const migrated = parsed.map(p => ({...p, shared: true, analyzed: true})).reverse();
                        setPresentations(migrated);
                        localStorage.setItem('classeta_teacher_presentations', JSON.stringify(migrated));
                    }
                }
            }
        } catch(e){}
    }, []);

    const openSlide = (pres) => {
        setSlides(pres.slides || []);
        setPdfUrl(pres.pdfUrl || null);
        setSelected(0);
        setPhase('results');
        setFile({ name: pres.filename });
        setActiveId(pres.id);
    };

    const MESSAGES = [
        'Uploading presentation text…',
        'Classifying Bloom\'s Taxonomy levels…',
        'Generating improvement suggestions…',
        'Creating student learning questions…',
        'Finalizing analysis…',
    ];

    const handleFile = async (f) => {
        if (!f) return;
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            setError('Only .pdf files are supported. Please upload a PDF file.');
            return;
        }
        if (f.size > 20 * 1024 * 1024) {
            setError('File is too large. Maximum size is 20 MB.');
            return;
        }
        setError('');
        setFile(f);
        setPhase('analyzing');
        setProgress('Uploading PDF and extracting text...');
        
        try {
            const parsed = await uploadPdf(f, user?.token);
            if (!parsed.slides || parsed.slides.length === 0) {
                setError('No text could be extracted from this presentation.');
                setPhase('upload');
                setFile(null);
                return;
            }
            
            const newPres = {
                id: Date.now(),
                filename: f.name,
                pdfUrl: parsed.pdfUrl,
                slides: parsed.slides,
                uploadedAt: new Date().toISOString(),
                shared: false,
                analyzed: false
            };
            
            const updated = [newPres, ...presentations];
            setPresentations(updated);
            localStorage.setItem('classeta_teacher_presentations', JSON.stringify(updated));
            
            setPhase('upload'); // Stay on upload screen
            setFile(null); // Clear currently uploading file
        } catch (e) {
            setError('Failed to upload the presentation: ' + e.message);
            setPhase('upload');
            setFile(null);
        }
    };

    const analyzeWithAI = async (presToAnalyze) => {
        const targetPres = presToAnalyze?.id ? presToAnalyze : presentations.find(p => p.id === activeId);
        const slidesToUse = targetPres?.slides || slides;
        if (!slidesToUse || !slidesToUse.length) return;
        
        if (targetPres) {
            setActiveId(targetPres.id);
            setSlides(targetPres.slides);
            setPdfUrl(targetPres.pdfUrl);
            setFile({ name: targetPres.filename });
        }

        setPhase('analyzing');
        setError('');
        setProgress(MESSAGES[0]);

        let msgIdx = 0;
        const interval = setInterval(() => {
            msgIdx = Math.min(msgIdx + 1, MESSAGES.length - 1);
            setProgress(MESSAGES[msgIdx]);
        }, 1800);

        try {
            const res = await fetch('/api/teacher/taxonomy/analyze-text', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ slides: slidesToUse }),
            });

            clearInterval(interval);

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Analysis failed. Please try again.');
            }

            const data = await res.json();
            
            const aiMap = {};
            (data.slides || []).forEach(s => { aiMap[s.id] = s; });
            
            let newSlides = slidesToUse.map(s => {
                const aiData = aiMap[s.id];
                if (!aiData) return s;
                return {
                    ...s,
                    taxonomyLevel: aiData.taxonomyLevel,
                    aiNotes: aiData.aiNotes,
                    suggestions: aiData.suggestions,
                    studentQuestions: aiData.studentQuestions,
                    studentExplanation: aiData.studentExplanation
                };
            });
            
            setSlides(newSlides);
            
            if (targetPres) {
                setPresentations(prev => {
                    const updated = prev.map(p => p.id === targetPres.id ? { ...p, slides: newSlides, analyzed: true } : p);
                    localStorage.setItem('classeta_teacher_presentations', JSON.stringify(updated));
                    return updated;
                });
            }
            
            setPhase('results');
        } catch (e) {
            clearInterval(interval);
            setError(e.message);
            setPhase('results');
        }
    };

    const resetUpload = () => {
        setFile(null);
        setSlides([]);
        setPhase('upload');
        setError('');
        setShared(false);
    };

    const shareWithStudents = async (presToShare) => {
        const pres = presToShare?.id ? presToShare : presentations.find(p => p.id === activeId);
        if (!pres) return;
        
        setSharing(true);
        
        const sharedPres = {
            ...pres,
            sharedAt: new Date().toISOString(),
            shared: true
        };
        
        // update teacher
        setPresentations(prev => {
            const updated = prev.map(p => p.id === pres.id ? sharedPres : p);
            localStorage.setItem('classeta_teacher_presentations', JSON.stringify(updated));
            return updated;
        });

        // update student view
        let existingShared = [];
        try {
            const raw = localStorage.getItem('classeta_taxonomy_presentations');
            if (raw) existingShared = JSON.parse(raw);
        } catch(e){}
        
        existingShared = existingShared.filter(p => p.id !== pres.id);
        existingShared.push(sharedPres);
        localStorage.setItem('classeta_taxonomy_presentations', JSON.stringify(existingShared));

        // keep legacy keys just in case
        const cfg = {};
        sharedPres.slides.forEach(s => { cfg[s.id] = s.taxonomyLevel; });
        localStorage.setItem('classeta_taxonomy_config', JSON.stringify(cfg));
        localStorage.setItem('classeta_taxonomy_slides', JSON.stringify(sharedPres.slides));
        if (sharedPres.pdfUrl) localStorage.setItem('classeta_taxonomy_pdfUrl', sharedPres.pdfUrl);
        localStorage.setItem('classeta_taxonomy_shared', 'true');
        localStorage.setItem('classeta_taxonomy_shared_at', sharedPres.sharedAt);

        await new Promise(r => setTimeout(r, 700));
        setSharing(false);
        setShared(true);
        setTimeout(() => {
            setShared(false);
        }, 2000);
    };

    /* ── Phases: upload / analyzing ── */
    if (phase === 'upload') return (
        <UploadZone error={error} onFile={handleFile} presentations={presentations} onOpen={openSlide} onAnalyze={analyzeWithAI} onShare={shareWithStudents} />
    );

    if (phase === 'analyzing') return <AnalyzingScreen message={progress} />;

    /* ── Results Phase ── */

    const current   = slides[selected];
    const currLevel = getLevel(current?.taxonomyLevel);

    return (
        <div className="page-content animate-fade" style={{ paddingBottom: 0 }}>

            {/* ─── Header ─── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
                        🤖 AI Analysis Complete
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        <MdOutlineSlideshow size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {file?.name} · {slides.length} slides analyzed
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost" onClick={resetUpload}>
                        <MdRefresh size={15} /> Upload New File
                    </button>
                    {!slides.some(s => s.taxonomyLevel) && (
                        <button className="btn btn-primary" onClick={analyzeWithAI} style={{ gap: 6 }}>
                            <MdAutoAwesome size={15} /> Analyze with AI
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={shareWithStudents} disabled={sharing || shared}>
                        {sharing
                            ? <><div className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Sharing…</>
                            : shared
                                ? <><MdCheckCircle size={15} /> Shared with Students!</>
                                : <><MdShare size={15} /> Share with Students</>
                        }
                    </button>
                </div>
            </div>

            {/* ─── Taxonomy distribution chips ─── */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {BLOOM_LEVELS.map(l => {
                    const cnt = slides.filter(s => s.taxonomyLevel === l.id).length;
                    if (!cnt) return null;
                    return (
                        <button key={l.id}
                            onClick={() => {
                                const idx = slides.findIndex(s => s.taxonomyLevel === l.id);
                                if (idx >= 0) setSelected(idx);
                            }}
                            style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: l.bg, color: l.color, border: `1px solid ${l.color}33`, cursor: 'pointer', transition: 'var(--t-fast)' }}
                        >
                            {l.emoji} {l.label} <span style={{ opacity: 0.7 }}>×{cnt}</span>
                        </button>
                    );
                })}
            </div>

            {/* ─── 3-column layout: filmstrip | slide preview | AI panel ─── */}
            <div style={{ display: 'flex', gap: 14, height: 'calc(100vh - 278px)', minHeight: 520, paddingBottom: 24 }}>

                {/* ── Filmstrip ── */}
                <div ref={filmstripRef} style={{ width: 168, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }} className="thin-scroll">
                    {slides.map((s, i) => {
                        const lv = getLevel(s.taxonomyLevel);
                        const isActive = i === selected;
                        return (
                            <button key={s.id} onClick={() => setSelected(i)}
                                style={{
                                    textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--r-md)', border: 'none',
                                    outline: `2px solid ${isActive ? (lv?.color || 'var(--primary)') : lv ? lv.color + '40' : 'var(--border)'}`,
                                    background: isActive ? (lv?.bg || 'var(--primary-muted)') : 'var(--bg-card)',
                                    cursor: 'pointer', transition: 'var(--t-fast)', flexShrink: 0,
                                    boxShadow: isActive ? `0 4px 16px ${lv?.color || 'var(--primary)'}33` : 'none'
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: isActive && lv ? lv.color : 'var(--text-muted)' }}>#{s.number}</span>
                                    {lv && <span style={{ fontSize: 13 }}>{lv.emoji}</span>}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>
                                    {s.title}
                                </div>
                                {lv && (
                                    <span style={{ fontSize: 10, fontWeight: 700, color: lv.color, background: lv.bg, padding: '2px 6px', borderRadius: 99 }}>
                                        {lv.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Slide Preview ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', minWidth: 0 }}>
                    {current && (
                        <>
                            {/* PDF Slide card */}
                            <div style={{
                                flex: 1,
                                background: currLevel ? `linear-gradient(135deg, ${currLevel.bg}, var(--bg-card))` : 'var(--bg-card)',
                                border: `2px solid ${currLevel ? currLevel.color + '50' : 'var(--border)'}`,
                                borderRadius: 'var(--r-xl)', 
                                overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
                                boxShadow: currLevel ? `0 8px 32px ${currLevel.color}22` : 'none',
                                transition: 'all 0.3s ease',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Document file={pdfUrl} loading={<div className="spinner" style={{ width: 30, height: 30, borderWidth: 3 }} />}>
                                    <Page pageNumber={selected + 1} renderTextLayer={false} renderAnnotationLayer={false} width={500} />
                                </Document>

                                {/* Taxonomy badge */}
                                {currLevel && (
                                    <div style={{
                                        position: 'absolute', top: 18, right: 18,
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 16px', background: currLevel.color, borderRadius: 99,
                                        color: '#fff', fontSize: 13, fontWeight: 700,
                                        boxShadow: `0 4px 20px ${currLevel.color}66`
                                    }}>
                                        <span style={{ fontSize: 15 }}>{currLevel.emoji}</span> {currLevel.label}
                                    </div>
                                )}

                                {/* Slide number */}
                                <div style={{ position: 'absolute', top: 18, left: 18, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: 99, color: currLevel?.color || 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    Slide {current.number} of {slides.length}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                                <button className="btn btn-ghost" onClick={() => setSelected(p => Math.max(0, p - 1))} disabled={selected === 0}>
                                    <MdChevronLeft size={18} /> Prev
                                </button>
                                <span style={{ padding: '6px 14px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-card)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                                    {selected + 1} / {slides.length}
                                </span>
                                <button className="btn btn-ghost" onClick={() => setSelected(p => Math.min(slides.length - 1, p + 1))} disabled={selected === slides.length - 1}>
                                    Next <MdChevronRight size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* ── AI Suggestions Panel ── */}
                <div style={{ width: 298, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }} className="thin-scroll">

                    {/* AI Classification Note */}
                    {current?.aiNotes && (
                        <div style={{ background: 'var(--bg-card)', border: `1px solid ${currLevel?.color || 'var(--border)'}44`, borderRadius: 'var(--r-lg)', padding: 16, borderLeft: `4px solid ${currLevel?.color || 'var(--primary)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                <MdInfo size={14} style={{ color: currLevel?.color || 'var(--primary)', flexShrink: 0 }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    AI Classification
                                </span>
                            </div>
                            {currLevel && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '6px 10px', background: currLevel.bg, borderRadius: 'var(--r-sm)' }}>
                                    <span style={{ fontSize: 18 }}>{currLevel.emoji}</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: currLevel.color }}>{currLevel.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{currLevel.verbs}</div>
                                    </div>
                                </div>
                            )}
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                {current.aiNotes}
                            </p>
                        </div>
                    )}

                    {/* Improvement Suggestions */}
                    {current?.suggestions?.length > 0 && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                                <MdLightbulb size={14} style={{ color: '#F59E0B', flexShrink: 0 }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Improvement Suggestions
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {current.suggestions.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <div style={{
                                            flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                                            background: currLevel?.bg || 'var(--bg-input)',
                                            border: `1.5px solid ${currLevel?.color || 'var(--border)'}66`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 800, color: currLevel?.color || 'var(--text-muted)'
                                        }}>
                                            {i + 1}
                                        </div>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                                            {s}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Student Questions Preview */}
                    {current?.studentQuestions?.length > 0 && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <MdSchool size={14} style={{ color: '#3B82F6', flexShrink: 0 }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Student Questions (preview)
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {current.studentQuestions.map((q, i) => (
                                    <div key={i} style={{
                                        padding: '9px 11px',
                                        background: 'var(--bg-input)',
                                        borderRadius: 'var(--r-sm)',
                                        borderLeft: `3px solid ${currLevel?.color || 'var(--primary)'}`,
                                        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5
                                    }}>
                                        Q{i + 1}: {q.question}
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, marginBottom: 0 }}>
                                ℹ️ Share with students to reveal answers in their dashboard.
                            </p>
                        </div>
                    )}

                    {/* Share tip */}
                    {shared && (
                        <div style={{ padding: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--r-md)', fontSize: 13, color: '#10B981', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MdCheckCircle size={16} /> Slides shared! Students can now view taxonomy analysis and questions.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TeacherUpload;
