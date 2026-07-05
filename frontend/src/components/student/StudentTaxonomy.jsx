import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
    MdChevronLeft, MdChevronRight,
    MdMenuBook, MdMenu, MdClose, MdExpandMore, MdExpandLess,
    MdOutlineSlideshow, MdAutoAwesome, MdSchool, MdCheckCircle,
    MdPlayArrow, MdGridView, MdViewStream, MdStar, MdLightbulb
} from 'react-icons/md';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { AuthContext } from '../../context/AuthContext';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/* ─── Bloom's Taxonomy Config ────────────────────────────────────── */
const BLOOM_LEVELS = [
    {
        id: 'remember',   label: 'Remember',   color: '#6366F1', bg: 'rgba(99,102,241,0.10)',
        gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        emoji: '🧠', verbs: 'Recall · List · Name · Define',
        description: 'Recall facts and basic concepts from memory.',
        pyramid: 1, tip: 'Focus on memorizing key terms and facts from this slide.'
    },
    {
        id: 'understand', label: 'Understand',  color: '#3B82F6', bg: 'rgba(59,130,246,0.10)',
        gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
        emoji: '💡', verbs: 'Explain · Summarize · Classify',
        description: 'Explain ideas and concepts in your own words.',
        pyramid: 2, tip: 'Try to explain this content to someone else in simple terms.'
    },
    {
        id: 'apply',      label: 'Apply',       color: '#10B981', bg: 'rgba(16,185,129,0.10)',
        gradient: 'linear-gradient(135deg, #10B981, #3B82F6)',
        emoji: '🔧', verbs: 'Demonstrate · Solve · Execute',
        description: 'Use information in new situations to solve problems.',
        pyramid: 3, tip: 'Think of a real-world scenario where you would use this.'
    },
    {
        id: 'analyze',    label: 'Analyze',     color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',
        gradient: 'linear-gradient(135deg, #F59E0B, #10B981)',
        emoji: '🔍', verbs: 'Differentiate · Compare · Examine',
        description: 'Draw connections and break information into components.',
        pyramid: 4, tip: 'Break down this content and find relationships between ideas.'
    },
    {
        id: 'evaluate',   label: 'Evaluate',    color: '#EF4444', bg: 'rgba(239,68,68,0.10)',
        gradient: 'linear-gradient(135deg, #EF4444, #F59E0B)',
        emoji: '⚖️', verbs: 'Judge · Critique · Justify',
        description: 'Justify decisions or positions using evidence.',
        pyramid: 5, tip: 'Form a judgment about the content and support it with reasoning.'
    },
    {
        id: 'create',     label: 'Create',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',
        gradient: 'linear-gradient(135deg, #8B5CF6, #EF4444)',
        emoji: '✨', verbs: 'Design · Build · Construct',
        description: 'Produce new or original work using learned knowledge.',
        pyramid: 6, tip: "Use what you've learned to create or propose something new."
    },
];

const getLevel = id => BLOOM_LEVELS.find(l => l.id === id);

/* ─── Bloom Pill Badge ──────────────────────────────────────────── */
const BloomBadge = ({ level, size = 'sm' }) => {
    if (!level) return null;
    const pad = size === 'lg' ? '6px 16px' : '3px 10px';
    const fs  = size === 'lg' ? 13 : 11;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: pad, borderRadius: 99, fontSize: fs, fontWeight: 700,
            background: level.bg, color: level.color,
            border: `1px solid ${level.color}44`,
            backdropFilter: 'blur(4px)'
        }}>
            {level.emoji} {level.label}
        </span>
    );
};

/* ─── Bloom Pyramid Viz ─────────────────────────────────────────── */
const BloomPyramid = ({ activeId }) => (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
        {BLOOM_LEVELS.map(l => {
            const isActive = l.id === activeId;
            return (
                <div key={l.id} title={l.label} style={{
                    flex: 1, height: isActive ? 28 : 10,
                    borderRadius: 3,
                    background: isActive ? l.gradient : `${l.color}30`,
                    transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: isActive ? `0 0 14px ${l.color}88` : 'none'
                }} />
            );
        })}
    </div>
);

/* ─── Q&A Accordion Item ────────────────────────────────────────── */
const QuestionCard = ({ q, idx, level }) => {
    const [open, setOpen] = useState(false);
    const [answered, setAnswered] = useState(false);
    const lc = level?.color || 'var(--primary)';
    const lb = level?.bg || 'var(--bg-input)';

    return (
        <div style={{
            border: `1.5px solid ${open ? lc + '55' : 'var(--border)'}`,
            borderRadius: 14,
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            background: open ? lb : 'var(--bg-card)',
            boxShadow: open ? `0 4px 20px ${lc}15` : 'none'
        }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', textAlign: 'left', padding: '14px 16px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 12
                }}
            >
                <div style={{
                    flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                    background: answered ? lc : open ? lc : lb,
                    border: `2px solid ${lc}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                    color: (answered || open) ? '#fff' : lc,
                    transition: 'all 0.25s'
                }}>
                    {answered ? '✓' : idx + 1}
                </div>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55, paddingTop: 2 }}>
                    {q.question}
                </span>
                <div style={{ flexShrink: 0, color: 'var(--text-muted)', marginTop: 3, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
                    <MdExpandMore size={18} />
                </div>
            </button>

            {open && q.answer && (
                <div style={{ padding: '0 16px 16px 54px' }}>
                    <div style={{
                        padding: '12px 16px', background: 'var(--bg-base)', borderRadius: 10,
                        border: `1px solid ${lc}33`, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: lc, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            💡 Hint / Answer
                        </div>
                        {q.answer}
                    </div>
                    {!answered && (
                        <button
                            onClick={() => setAnswered(true)}
                            style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: lc, background: lb, border: `1px solid ${lc}44`, borderRadius: 99, padding: '4px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                            <MdCheckCircle size={13} /> Mark as understood
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Quiz Modal ────────────────────────────────────────────────── */
const QuizModal = ({ slide, level, onClose }) => {
    const [qi, setQi] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const questions = slide?.studentQuestions || [];
    if (!questions.length) return null;
    const q = questions[qi];
    const lc = level?.color || 'var(--primary)';
    const lb = level?.bg || 'rgba(99,102,241,0.1)';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.2s ease'
        }}>
            <div style={{
                background: 'var(--bg-card)', borderRadius: 24, padding: '32px 36px',
                maxWidth: 540, width: '92%',
                border: `2px solid ${lc}33`,
                boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${lc}22`,
            }}>
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: level?.gradient || lc,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                        }}>
                            {level?.emoji}
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: lc }}>{level?.label} Level Quiz</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{slide.title}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <MdClose size={16} />
                    </button>
                </div>

                {/* Progress segments */}
                <div style={{ display: 'flex', gap: 5, marginBottom: 28 }}>
                    {questions.map((_, i) => (
                        <div key={i} style={{
                            flex: 1, height: 5, borderRadius: 99,
                            background: i <= qi ? (level?.gradient || lc) : 'var(--border)',
                            transition: 'background 0.3s'
                        }} />
                    ))}
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                    Question {qi + 1} of {questions.length}
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.5, marginBottom: 28, color: 'var(--text-primary)' }}>
                    {q.question}
                </div>

                {!revealed ? (
                    <button
                        onClick={() => setRevealed(true)}
                        style={{
                            width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                            background: level?.gradient || lc, color: '#fff',
                            fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        <MdLightbulb size={16} /> Reveal Answer
                    </button>
                ) : (
                    <>
                        <div style={{ padding: '14px 18px', background: lb, borderRadius: 12, border: `1.5px solid ${lc}44`, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                            {q.answer}
                        </div>
                        <button
                            onClick={() => { setRevealed(false); if (qi < questions.length - 1) setQi(q => q + 1); else onClose(); }}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: level?.gradient || lc, color: '#fff',
                                fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                            }}
                        >
                            {qi < questions.length - 1 ? 'Next Question →' : '✓ Finish Quiz'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

/* ─── Dashboard Presentation Card ──────────────────────────────── */
const PresentationCard = ({ pres, index, onOpen }) => {
    const [hovered, setHovered] = useState(false);
    const slideCount = pres.slides?.length || 0;
    const analyzedCount = pres.slides?.filter(s => s.taxonomyLevel).length || 0;
    const isAnalyzed = analyzedCount > 0;

    const levelDist = {};
    (pres.slides || []).forEach(s => {
        if (s.taxonomyLevel) levelDist[s.taxonomyLevel] = (levelDist[s.taxonomyLevel] || 0) + 1;
    });
    const topLevels = Object.entries(levelDist).sort((a,b) => b[1]-a[1]).slice(0,3);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'var(--bg-input)' : 'var(--bg-card)',
                border: `1.5px solid ${hovered ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 18,
                padding: '20px 22px',
                transition: 'all 0.25s ease',
                boxShadow: hovered ? '0 8px 32px rgba(99,102,241,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 18
            }}
            onClick={onOpen}
        >
            {/* Icon */}
            <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: isAnalyzed
                    ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                    : 'linear-gradient(135deg, #64748B, #94A3B8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                boxShadow: isAnalyzed ? '0 4px 16px rgba(99,102,241,0.4)' : 'none'
            }}>
                📑
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                    {pres.filename}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {slideCount} slides
                    </span>
                    {isAnalyzed && (
                        <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MdStar size={11} /> AI Analyzed
                        </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(pres.sharedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                {/* Bloom level pills */}
                {topLevels.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                        {topLevels.map(([lvId, cnt]) => {
                            const lv = getLevel(lvId);
                            if (!lv) return null;
                            return (
                                <span key={lvId} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                                    background: lv.bg, color: lv.color, border: `1px solid ${lv.color}33`
                                }}>
                                    {lv.emoji} {lv.label} · {cnt}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CTA Arrow */}
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: hovered ? 'var(--primary)' : 'var(--bg-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s ease',
                color: hovered ? '#fff' : 'var(--text-muted)'
            }}>
                <MdPlayArrow size={18} />
            </div>
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────────────── */
const StudentTaxonomy = () => {
    const { user }                              = useContext(AuthContext);
    const [phase, setPhase]                     = useState('dashboard');
    const [current, setCurrent]                 = useState(0);
    const [sidebarOpen, setSidebarOpen]         = useState(true);
    const [animKey, setAnimKey]                 = useState(0);
    const [quizSlide, setQuizSlide]             = useState(null);
    const [noData, setNoData]                   = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [loadingExplanation, setLoadingExplanation] = useState(false);
    const [explanationData, setExplanationData]   = useState(null); // { overview, questions }
    const [revealedHints, setRevealedHints]       = useState({});
    const [presentations, setPresentations]     = useState([]);
    const [activePresIndex, setActivePresIndex] = useState(0);
    const containerRef                          = useRef(null);

    /* ── Load presentations from localStorage ── */
    useEffect(() => {
        let loaded = [];
        const raw = localStorage.getItem('classeta_taxonomy_presentations');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) loaded = parsed;
            } catch (_) {}
        }

        if (loaded.length === 0) {
            const legacySlides = localStorage.getItem('classeta_taxonomy_slides');
            const legacyUrl    = localStorage.getItem('classeta_taxonomy_pdfUrl');
            const legacyDate   = localStorage.getItem('classeta_taxonomy_shared_at');
            if (legacySlides) {
                try {
                    const parsed = JSON.parse(legacySlides);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        loaded = [{ id: 'legacy', filename: 'Shared Presentation', slides: parsed, pdfUrl: legacyUrl, sharedAt: legacyDate }];
                    }
                } catch(_) {}
            }
        }

        if (loaded.length > 0) setPresentations(loaded);
        else setNoData(true);
    }, []);

    const activePres = presentations[activePresIndex];
    const slides     = activePres?.slides || [];
    const pdfUrl     = activePres?.pdfUrl;
    const sharedAt   = activePres?.sharedAt;

    const openPresentation = (idx) => {
        setActivePresIndex(idx);
        setCurrent(0);
        setShowExplanation(false);
        setExplanationData(null);
        setRevealedHints({});
        setAnimKey(k => k + 1);
        setPhase('viewer');
    };

    const goTo = useCallback((idx) => {
        if (idx < 0 || idx >= slides.length) return;
        setCurrent(idx);
        setShowExplanation(false);
        setExplanationData(null);
        setRevealedHints({});
        setAnimKey(k => k + 1);
    }, [slides.length]);

    useEffect(() => {
        const handler = (e) => {
            if (phase !== 'viewer') return;
            if (e.key === 'ArrowLeft')  goTo(current - 1);
            if (e.key === 'ArrowRight') goTo(current + 1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [current, goTo, phase]);

    const slide    = slides[current];
    const level    = getLevel(slide?.taxonomyLevel) || getLevel('remember');
    const progress = slides.length > 1 ? (current / (slides.length - 1)) * 100 : 100;

    const handleExplainMe = async () => {
        if (showExplanation) { setShowExplanation(false); return; }
        setShowExplanation(true);
        if (explanationData) return; // already loaded for this slide
        setLoadingExplanation(true);
        setRevealedHints({});
        try {
            const res = await fetch('/api/student/taxonomy/explain-slide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                body: JSON.stringify({ slide, level: level?.id || 'remember' })
            });
            const data = await res.json();
            if (res.ok) {
                setExplanationData({ overview: data.overview, questions: data.questions || [] });
            } else {
                setExplanationData({ overview: 'Failed to generate explanation. Please try again.', questions: [] });
            }
        } catch (e) {
            setExplanationData({ overview: 'Network error. Please try again.', questions: [] });
        } finally {
            setLoadingExplanation(false);
        }
    };

    /* ── Empty state ── */
    if (noData || (phase !== 'dashboard' && slides.length === 0)) {
        return (
            <div className="page-content animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 24, textAlign: 'center' }}>
                <div style={{
                    width: 90, height: 90, borderRadius: 24,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42,
                    border: '1px solid rgba(99,102,241,0.2)'
                }}>
                    📚
                </div>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.03em' }}>No Slides Shared Yet</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 380, lineHeight: 1.7 }}>
                        Your teacher hasn't shared any presentations yet. Once they upload and analyze a presentation, it will appear here.
                    </p>
                </div>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', background: 'rgba(99,102,241,0.08)',
                    borderRadius: 99, border: '1px solid rgba(99,102,241,0.2)',
                    fontSize: 12, color: 'var(--primary)', fontWeight: 600
                }}>
                    💡 Check back after your teacher shares their presentation
                </div>
            </div>
        );
    }

    /* ── Dashboard View ── */
    if (phase === 'dashboard') {
        return (
            <div className="page-content animate-fade">
                {/* Hero header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(59,130,246,0.04) 100%)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    borderRadius: 24, padding: '28px 32px',
                    marginBottom: 24, position: 'relative', overflow: 'hidden'
                }}>
                    {/* Decorative blobs */}
                    <div style={{
                        position: 'absolute', top: -20, right: -20, width: 160, height: 160,
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -30, left: 100, width: 120, height: 120,
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 26, boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
                        }}>
                            🎓
                        </div>
                        <div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 4, color: 'var(--text-primary)' }}>
                                My Learning Hub
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                                Presentations shared by your teacher, powered by Bloom's Taxonomy AI
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexShrink: 0 }}>
                            <div style={{
                                textAlign: 'center', padding: '8px 16px',
                                background: 'var(--bg-card)', borderRadius: 12,
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{presentations.length}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Presentations</div>
                            </div>
                            <div style={{
                                textAlign: 'center', padding: '8px 16px',
                                background: 'var(--bg-card)', borderRadius: 12,
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                                    {presentations.reduce((a, p) => a + (p.slides?.length || 0), 0)}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Total Slides</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Presentations grid */}
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Shared Presentations
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {presentations.map((p, i) => (
                        <PresentationCard
                            key={p.id || i}
                            pres={p}
                            index={i}
                            onOpen={() => openPresentation(i)}
                        />
                    ))}
                </div>

                {/* Bloom Legend */}
                <div style={{
                    marginTop: 28, padding: '18px 22px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 18
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                        Bloom's Taxonomy — Six Learning Levels
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {BLOOM_LEVELS.map(l => (
                            <div key={l.id} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '5px 12px', borderRadius: 99,
                                background: l.bg, border: `1px solid ${l.color}33`,
                                fontSize: 12, fontWeight: 600, color: l.color
                            }}>
                                {l.emoji} {l.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* ── Viewer ── */
    return (
        <>
            {quizSlide && (
                <QuizModal
                    slide={quizSlide}
                    level={getLevel(quizSlide.taxonomyLevel)}
                    onClose={() => setQuizSlide(null)}
                />
            )}

            <div className="page-content animate-fade" ref={containerRef} style={{ paddingBottom: 0 }}>

                {/* ─── Top bar ─── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
                    {/* Left: back + title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <button
                            onClick={() => setPhase('dashboard')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '7px 14px', borderRadius: 99, border: '1.5px solid var(--border)',
                                background: 'var(--bg-card)', cursor: 'pointer',
                                fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                                transition: 'all 0.2s', flexShrink: 0,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <MdChevronLeft size={16} /> Back
                        </button>
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                                {activePres?.filename}
                            </h1>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                                {slides.length} slides · AI-powered · Shared {sharedAt ? new Date(sharedAt).toLocaleDateString() : ''}
                            </div>
                        </div>
                    </div>

                    {/* Right: actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                        {/* Bloom badge */}
                        <BloomBadge level={level} size="sm" />

                        <button
                            onClick={() => setSidebarOpen(o => !o)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '7px 12px', borderRadius: 99, border: '1.5px solid var(--border)',
                                background: 'var(--bg-card)', cursor: 'pointer',
                                fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', transition: 'all 0.2s'
                            }}
                        >
                            <MdMenu size={14} /> {sidebarOpen ? 'Hide' : 'Show'} Slides
                        </button>

                        {slide?.studentQuestions?.length > 0 && (
                            <button
                                onClick={() => setQuizSlide(slide)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '7px 14px', borderRadius: 99, border: 'none',
                                    background: level?.gradient || 'var(--primary)',
                                    cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff',
                                    boxShadow: `0 4px 14px ${level?.color || 'var(--primary)'}55`
                                }}
                            >
                                <MdSchool size={14} /> Quiz This Slide
                            </button>
                        )}
                    </div>
                </div>

                {/* ─── Progress bar ─── */}
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                        <span>Progress through slides</span>
                        <span style={{ fontWeight: 700 }}>{current + 1} / {slides.length}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', width: `${progress}%`,
                            background: level?.gradient || 'var(--primary)',
                            borderRadius: 99, transition: 'width 0.4s ease',
                            boxShadow: `0 0 10px ${level?.color || 'var(--primary)'}77`
                        }} />
                    </div>
                </div>

                {/* ─── Main layout ─── */}
                <div style={{ display: 'flex', gap: 12, height: 'calc(100vh - 290px)', minHeight: 520 }}>

                    {/* ── Filmstrip sidebar ── */}
                    {sidebarOpen && (
                        <div style={{
                            width: 195, flexShrink: 0, overflowY: 'auto',
                            display: 'flex', flexDirection: 'column', gap: 5,
                            paddingRight: 2,
                            background: 'linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(15,15,28,0.97) 100%)',
                            borderRadius: 16,
                            border: '1px solid rgba(255,255,255,0.07)',
                            padding: '10px 8px',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)'
                        }} className="thin-scroll">
                            {/* Sidebar header */}
                            <div style={{ padding: '4px 8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    All Slides · {slides.length}
                                </div>
                            </div>
                            {slides.map((s, i) => {
                                const lv = getLevel(s.taxonomyLevel);
                                const isActive = i === current;
                                const qCount = s.studentQuestions?.length || 0;
                                return (
                                    <button key={s.id || i} onClick={() => goTo(i)}
                                        style={{
                                            textAlign: 'left', padding: 0, borderRadius: 10, border: 'none',
                                            outline: isActive ? `1.5px solid ${lv?.color || '#6366F1'}` : '1.5px solid transparent',
                                            background: isActive
                                                ? `linear-gradient(135deg, ${lv?.color || '#6366F1'}22, ${lv?.color || '#6366F1'}0a)`
                                                : 'rgba(255,255,255,0.03)',
                                            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, overflow: 'hidden',
                                            boxShadow: isActive && lv ? `0 0 20px ${lv.color}30, inset 0 1px 0 ${lv.color}20` : 'none'
                                        }}>
                                        {/* Top gradient accent bar */}
                                        <div style={{ height: 2, background: lv ? lv.gradient : 'rgba(255,255,255,0.08)', opacity: isActive ? 1 : 0.4 }} />
                                        <div style={{ padding: '9px 11px' }}>
                                            {/* Slide number + emoji row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                                <div style={{
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    width: 20, height: 20, borderRadius: 6,
                                                    background: isActive && lv ? lv.gradient : 'rgba(255,255,255,0.08)',
                                                    fontSize: 9, fontWeight: 800,
                                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                                                    boxShadow: isActive && lv ? `0 2px 8px ${lv.color}55` : 'none'
                                                }}>
                                                    {s.number || i+1}
                                                </div>
                                                <span style={{ fontSize: 13 }}>{lv?.emoji || '📄'}</span>
                                            </div>
                                            {/* Title */}
                                            <div style={{
                                                fontSize: 11, fontWeight: isActive ? 700 : 500,
                                                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                                                lineHeight: 1.35,
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                marginBottom: 6
                                            }}>
                                                {s.title || `Slide ${i+1}`}
                                            </div>
                                            {/* Footer: level label + question badge */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {lv && (
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 700,
                                                        color: isActive ? lv.color : 'rgba(255,255,255,0.25)',
                                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                                    }}>{lv.label}</span>
                                                )}
                                                {qCount > 0 && (
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 800,
                                                        background: isActive && lv ? lv.color + '33' : 'rgba(255,255,255,0.08)',
                                                        color: isActive && lv ? lv.color : 'rgba(255,255,255,0.3)',
                                                        padding: '1px 6px', borderRadius: 99,
                                                        border: `1px solid ${isActive && lv ? lv.color + '44' : 'rgba(255,255,255,0.06)'}`
                                                    }}>
                                                        {qCount}Q
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Main Slide Viewer ── */}
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        border: `2px solid ${level ? level.color + '40' : 'var(--border)'}`,
                        borderRadius: 20,
                        background: 'var(--bg-card)',
                        transition: 'border-color 0.4s',
                        boxShadow: level ? `0 12px 48px ${level.color}18` : 'none'
                    }}>

                        {/* Taxonomy strip */}
                        {level && (
                            <div style={{
                                padding: '10px 22px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: `linear-gradient(90deg, ${level.color}18, ${level.color}06)`,
                                borderBottom: `1px solid ${level.color}30`,
                                flexWrap: 'wrap', gap: 8
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 9,
                                        background: level.gradient,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 16, boxShadow: `0 4px 10px ${level.color}44`
                                    }}>{level.emoji}</div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: level.color }}>{level.label} Level</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{level.verbs}</div>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: 11, fontWeight: 600, color: level.color,
                                    background: level.bg, padding: '4px 12px', borderRadius: 99,
                                    border: `1px solid ${level.color}30`, maxWidth: 300, textAlign: 'right'
                                }}>
                                    💡 {level.tip}
                                </div>
                            </div>
                        )}

                        {/* Scrollable slide content */}
                        <div style={{ flex: 1, overflowY: 'auto' }} className="thin-scroll">
                            <div key={animKey} className="animate-fade" style={{ display: 'flex', flexDirection: 'column', padding: '22px 26px' }}>

                                {/* Slide header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <div style={{
                                        fontSize: 11, fontWeight: 700,
                                        color: level?.color || 'var(--text-muted)',
                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                        background: level?.bg, padding: '3px 10px', borderRadius: 99,
                                        border: `1px solid ${level?.color || 'var(--border)'}33`
                                    }}>
                                        Slide {slide?.number || current + 1} of {slides.length}
                                    </div>
                                    {/* Explain Me button */}
                                    <button
                                        onClick={handleExplainMe}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 7,
                                            padding: '8px 16px', borderRadius: 99, border: 'none',
                                            background: showExplanation
                                                ? (level?.gradient || 'var(--primary)')
                                                : (level?.bg || 'var(--bg-input)'),
                                            color: showExplanation ? '#fff' : (level?.color || 'var(--primary)'),
                                            cursor: 'pointer', fontSize: 12, fontWeight: 700,
                                            transition: 'all 0.25s ease',
                                            boxShadow: showExplanation ? `0 4px 14px ${level?.color}55` : 'none'
                                        }}
                                    >
                                        <MdAutoAwesome size={14} />
                                        {showExplanation ? 'Hide Explanation' : 'Explain Me'}
                                    </button>
                                </div>

                                {/* Explanation panel — question-based */}
                                {showExplanation && (
                                    <div className="animate-fade" style={{
                                        borderRadius: 16,
                                        border: `1.5px solid ${level?.color || 'var(--primary)'}44`,
                                        overflow: 'hidden',
                                        marginBottom: 18,
                                        background: 'linear-gradient(135deg, rgba(10,10,20,0.96) 0%, rgba(18,18,32,0.98) 100%)',
                                        boxShadow: `0 8px 32px ${level?.color || 'var(--primary)'}22, inset 0 1px 0 rgba(255,255,255,0.06)`
                                    }}>
                                        {/* Panel header */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '14px 18px',
                                            background: `linear-gradient(90deg, ${level?.color || '#6366F1'}22, ${level?.color || '#6366F1'}06)`,
                                            borderBottom: `1px solid ${level?.color || 'var(--primary)'}22`
                                        }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 9,
                                                background: level?.gradient || 'var(--primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 16, flexShrink: 0,
                                                boxShadow: `0 4px 12px ${level?.color || 'var(--primary)'}55`
                                            }}>{level?.emoji}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 800, color: level?.color || '#818CF8' }}>
                                                    {level?.label} Level · AI Explanation
                                                </div>
                                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                                                    Powered by ChatGPT · {level?.verbs}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowExplanation(false)}
                                                style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}
                                            >
                                                <MdClose size={13} />
                                            </button>
                                        </div>

                                        {loadingExplanation ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 18px', color: 'rgba(255,255,255,0.5)' }}>
                                                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2.5, borderColor: level?.color || '#6366F1', borderRightColor: 'transparent' }} />
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>ChatGPT is thinking...</div>
                                                    <div style={{ fontSize: 11, marginTop: 2 }}>Generating {level?.label}-level questions for this slide</div>
                                                </div>
                                            </div>
                                        ) : explanationData ? (
                                            <div style={{ padding: '16px 18px' }}>
                                                {/* Overview */}
                                                <div style={{
                                                    fontSize: 13.5, lineHeight: 1.7,
                                                    color: 'rgba(255,255,255,0.75)',
                                                    marginBottom: 16,
                                                    padding: '12px 14px',
                                                    background: 'rgba(255,255,255,0.04)',
                                                    borderRadius: 10,
                                                    borderLeft: `3px solid ${level?.color || '#6366F1'}`
                                                }}>
                                                    {explanationData.overview}
                                                </div>

                                                {/* Question-based section */}
                                                {explanationData.questions?.length > 0 && (
                                                    <div>
                                                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                                                            🎯 Guiding Questions — Think deeply
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                            {explanationData.questions.map((item, qi) => (
                                                                <div key={qi} style={{
                                                                    borderRadius: 10,
                                                                    border: `1px solid ${revealedHints[qi] ? (level?.color || '#6366F1') + '55' : 'rgba(255,255,255,0.07)'}`,
                                                                    overflow: 'hidden',
                                                                    transition: 'all 0.2s',
                                                                    background: revealedHints[qi] ? `${level?.color || '#6366F1'}12` : 'rgba(255,255,255,0.03)'
                                                                }}>
                                                                    {/* Question row */}
                                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px' }}>
                                                                        <div style={{
                                                                            flexShrink: 0, width: 22, height: 22, borderRadius: 7,
                                                                            background: revealedHints[qi] ? (level?.gradient || '#6366F1') : 'rgba(255,255,255,0.08)',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            fontSize: 10, fontWeight: 800,
                                                                            color: revealedHints[qi] ? '#fff' : 'rgba(255,255,255,0.35)',
                                                                            boxShadow: revealedHints[qi] ? `0 2px 8px ${level?.color}55` : 'none',
                                                                            transition: 'all 0.25s'
                                                                        }}>
                                                                            {revealedHints[qi] ? '✓' : qi + 1}
                                                                        </div>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.82)', lineHeight: 1.5 }}>
                                                                                {item.q}
                                                                            </div>
                                                                            {revealedHints[qi] && (
                                                                                <div className="animate-fade" style={{
                                                                                    marginTop: 8, fontSize: 12, lineHeight: 1.6,
                                                                                    color: 'rgba(255,255,255,0.55)',
                                                                                    padding: '8px 10px',
                                                                                    background: 'rgba(255,255,255,0.04)',
                                                                                    borderRadius: 8,
                                                                                    borderLeft: `2px solid ${level?.color || '#6366F1'}88`
                                                                                }}>
                                                                                    💡 {item.hint}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => setRevealedHints(prev => ({ ...prev, [qi]: !prev[qi] }))}
                                                                            style={{
                                                                                flexShrink: 0, padding: '4px 10px', borderRadius: 99, border: 'none', cursor: 'pointer',
                                                                                background: revealedHints[qi] ? 'rgba(255,255,255,0.06)' : (level?.gradient || '#6366F1'),
                                                                                color: revealedHints[qi] ? 'rgba(255,255,255,0.4)' : '#fff',
                                                                                fontSize: 10, fontWeight: 700, transition: 'all 0.2s',
                                                                                alignSelf: 'flex-start', marginTop: 2,
                                                                                boxShadow: revealedHints[qi] ? 'none' : `0 2px 8px ${level?.color}55`
                                                                            }}
                                                                        >
                                                                            {revealedHints[qi] ? 'Hide' : 'Reveal'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {/* Slide PDF or text */}
                                {pdfUrl ? (
                                    <div style={{
                                        border: `1px solid ${level ? level.color + '30' : 'var(--border)'}`,
                                        borderRadius: 14, overflow: 'hidden',
                                        boxShadow: level ? `0 6px 28px ${level.color}12` : 'none',
                                        marginBottom: 18, display: 'flex', justifyContent: 'center', background: '#fff'
                                    }}>
                                        <Document file={pdfUrl} loading={<div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}><div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> Loading slide...</div>}>
                                            <Page pageNumber={current + 1} renderTextLayer={false} renderAnnotationLayer={false} width={Math.min(520, window.innerWidth - 300)} />
                                        </Document>
                                    </div>
                                ) : (
                                    <>
                                        <h2 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.35, marginBottom: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                            {slide?.title}
                                        </h2>
                                        {slide?.bullets?.length > 0 && (
                                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: '0 0 18px 0' }}>
                                                {slide.bullets.map((b, i) => (
                                                    <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                                        <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: level?.gradient || level?.color || 'var(--text-muted)', marginTop: 7, boxShadow: level ? `0 0 8px ${level.color}88` : 'none' }} />
                                                        {b}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                )}

                                {/* Bloom Pyramid */}
                                <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Taxonomy Level
                                    </div>
                                    <BloomPyramid activeId={slide?.taxonomyLevel} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Remember</span>
                                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Create</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Questions */}
                            {slide?.studentQuestions?.length > 0 && (
                                <div style={{
                                    borderTop: `1px solid ${level?.color || 'var(--border)'}25`,
                                    padding: '20px 26px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 10,
                                                background: level?.gradient || 'var(--primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 4px 12px ${level?.color || 'var(--primary)'}44`
                                            }}>
                                                <MdAutoAwesome size={16} style={{ color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>AI Learning Questions</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap to reveal answers · {slide.studentQuestions.length} questions</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setQuizSlide(slide)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                fontSize: 12, fontWeight: 700, padding: '7px 14px',
                                                borderRadius: 99, cursor: 'pointer',
                                                background: level?.bg || 'var(--bg-input)',
                                                color: level?.color || 'var(--primary)',
                                                border: `1.5px solid ${level?.color || 'var(--border)'}44`
                                            }}
                                        >
                                            🎯 Quiz Mode
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {slide.studentQuestions.map((q, i) => (
                                            <QuestionCard key={i} idx={i} q={q} level={level} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Navigation bar ── */}
                        <div style={{
                            display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center',
                            padding: '10px 16px',
                            borderTop: `1px solid ${level?.color || 'var(--border)'}25`,
                            background: level ? `${level.color}0A` : 'var(--bg-card)',
                        }}>
                            <button
                                onClick={() => goTo(current - 1)}
                                disabled={current === 0}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '7px 16px', borderRadius: 99,
                                    border: '1.5px solid var(--border)',
                                    background: 'var(--bg-card)', cursor: current === 0 ? 'not-allowed' : 'pointer',
                                    fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                                    opacity: current === 0 ? 0.4 : 1, transition: 'all 0.2s',
                                    minWidth: 90
                                }}
                            >
                                <MdChevronLeft size={16} /> Prev
                            </button>

                            {/* Dot indicators */}
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 280 }}>
                                {slides.map((s, i) => {
                                    const lv = getLevel(s.taxonomyLevel);
                                    return (
                                        <button key={i} onClick={() => goTo(i)} title={`Slide ${i+1}`} style={{
                                            width: i === current ? 22 : 7, height: 7,
                                            borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
                                            background: i === current
                                                ? (level?.color || 'var(--primary)')
                                                : (lv?.color + '44' || 'var(--border)'),
                                            transition: 'all 0.3s ease'
                                        }} />
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => goTo(current + 1)}
                                disabled={current === slides.length - 1}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '7px 16px', borderRadius: 99,
                                    border: 'none',
                                    background: current === slides.length - 1 ? 'var(--bg-input)' : (level?.gradient || 'var(--primary)'),
                                    cursor: current === slides.length - 1 ? 'not-allowed' : 'pointer',
                                    fontSize: 12, fontWeight: 700,
                                    color: current === slides.length - 1 ? 'var(--text-muted)' : '#fff',
                                    opacity: current === slides.length - 1 ? 0.4 : 1,
                                    transition: 'all 0.2s', minWidth: 90, justifyContent: 'center',
                                    boxShadow: current < slides.length - 1 ? `0 4px 14px ${level?.color}55` : 'none'
                                }}
                            >
                                Next <MdChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Bloom Level Filter Bar ─── */}
                <div style={{
                    marginTop: 12, marginBottom: 20,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '10px 16px',
                    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
                }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                        Jump to
                    </span>
                    {BLOOM_LEVELS.map(l => {
                        const count = slides.filter(s => s.taxonomyLevel === l.id).length;
                        const isActive = slide?.taxonomyLevel === l.id;
                        if (!count) return null;
                        return (
                            <button key={l.id}
                                onClick={() => { const idx = slides.findIndex(s => s.taxonomyLevel === l.id); if (idx >= 0) goTo(idx); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '5px 12px', borderRadius: 99,
                                    background: isActive ? l.bg : 'transparent',
                                    border: `1.5px solid ${isActive ? l.color + '66' : 'var(--border)'}`,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: isActive ? `0 0 14px ${l.color}33` : 'none'
                                }}>
                                <span style={{ fontSize: 13 }}>{l.emoji}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? l.color : 'var(--text-secondary)' }}>{l.label}</span>
                                <span style={{ fontSize: 10, background: l.color + '22', color: l.color, padding: '1px 6px', borderRadius: 99, fontWeight: 800 }}>{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default StudentTaxonomy;
