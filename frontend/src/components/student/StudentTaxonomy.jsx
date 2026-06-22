import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MdChevronLeft, MdChevronRight, MdFullscreen, MdFullscreenExit,
    MdMenuBook, MdCircle, MdClose, MdOutlineSlideshow, MdMenu
} from 'react-icons/md';

/* ─── Bloom's Taxonomy Config ────────────────────────────────────── */
const BLOOM_LEVELS = [
    { id: 'remember',   label: 'Remember',   color: '#6366F1', bg: 'rgba(99,102,241,0.10)',  emoji: '🧠',
      description: 'Recall facts and basic concepts from memory.', verbs: 'Recall · List · Name · Define · Recognize' },
    { id: 'understand', label: 'Understand',  color: '#3B82F6', bg: 'rgba(59,130,246,0.10)',  emoji: '💡',
      description: 'Explain ideas and concepts in your own words.', verbs: 'Explain · Summarize · Classify · Paraphrase' },
    { id: 'apply',      label: 'Apply',       color: '#10B981', bg: 'rgba(16,185,129,0.10)',  emoji: '🔧',
      description: 'Use information in new situations to solve problems.', verbs: 'Demonstrate · Solve · Execute · Implement' },
    { id: 'analyze',    label: 'Analyze',     color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  emoji: '🔍',
      description: 'Draw connections and break information into components.', verbs: 'Differentiate · Compare · Examine · Deconstruct' },
    { id: 'evaluate',   label: 'Evaluate',    color: '#EF4444', bg: 'rgba(239,68,68,0.10)',   emoji: '⚖️',
      description: 'Justify decisions or positions using evidence.', verbs: 'Judge · Critique · Justify · Defend · Argue' },
    { id: 'create',     label: 'Create',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',  emoji: '✨',
      description: 'Produce new or original work using learned knowledge.', verbs: 'Design · Build · Construct · Compose · Devise' },
];

const getLevelById = id => BLOOM_LEVELS.find(l => l.id === id);

/* ─── Default Presentation Data ────────────────────────────────── */
const DEFAULT_SLIDES = [
    {
        id: 's1', number: 1, taxonomyLevel: 'remember',
        title: 'EMULATOR FLUTTER WEB',
        bullets: [
            'The Subtitle: The ultimate VS Code extension to streamline Flutter web development.',
            'The Problem: Context switching kills productivity.',
            'The Solution: Bring the test device directly into your IDE workspace.'
        ],
        imageUrl: '/slides/image1.png'
    },
    {
        id: 's2', number: 2, taxonomyLevel: 'understand',
        title: 'The Flutter Workflow',
        bullets: [
            'Rapid Prototyping: Instantly see how your application responds on mobile web without leaving your code editor.'
        ],
        imageUrl: '/slides/image2.jpeg'
    },
    {
        id: 's3', number: 3, taxonomyLevel: 'understand',
        title: 'In-IDE Experience',
        bullets: [
            'Resource Friendly: Significantly lighter on system resources compared to running full Android Virtual Devices (AVDs).',
            'Zero Context Switching: Preview UI changes without constantly tabbing over to external browsers or heavy emulators.',
            'Integrated Environment: Run and test your Flutter web apps inside a simulated phone interface right next to your code.'
        ],
        imageUrl: '/slides/image3.png'
    },
    {
        id: 's4', number: 4, taxonomyLevel: 'apply',
        title: 'Powerful Features',
        bullets: [
            'Hot Reload Support (01): Instantly reflect your code changes in the emulator. Enable auto-reload on Dart file save for a seamless and continuous development loop.',
            'Device Presets (02): Ensure your application\'s responsive design holds up using integrated presets.',
            'Device Rotation (03): Test your app\'s layout constraints in both portrait and landscape modes with a single click.'
        ],
        imageUrl: '/slides/image4.png'
    },
    {
        id: 's5', number: 5, taxonomyLevel: 'analyze',
        title: 'Community Adoption',
        bullets: [
            'Market Metrics: Gaining rapid traction in the developer community as a lightweight, reliable, and powerful alternative to traditional emulation setups.',
            'VS Code Marketplace Installs: 7,500+',
            'Open VSX Downloads: 6,000+',
            'Target Framework: Trusted by Developers, mapping to Developer Workflow and Customer Value.'
        ],
        imageUrl: '/slides/image5.png'
    },
    {
        id: 's6', number: 6, taxonomyLevel: 'apply',
        title: 'Power User Shortcuts',
        bullets: [
            'Speed Up Workflow: Use built-in keyboard shortcuts to eliminate manual clicks:',
            'Reload Emulator',
            'Rotate Device',
            'Quick Open Command'
        ],
        imageUrl: '/slides/image6.png'
    },
    {
        id: 's7', number: 7, taxonomyLevel: 'evaluate',
        title: 'Advanced Mirroring',
        bullets: [
            'Android ADB Integration: Go beyond web emulation. The extension allows you to mirror your physical Android device screen directly into your VS Code environment.',
            'Hardware Connection: Utilize the bundled Android Debug Bridge (ADB) or configure a custom ADB path to interact with real hardware without ever looking away from your code editor.'
        ],
        imageUrl: '/slides/image7.png'
    },
    {
        id: 's8', number: 8, taxonomyLevel: 'create',
        title: 'Deployment & Next Steps',
        bullets: [
            'Installation Framework:',
            'Install Flutter Web Emulator from the VS Code Extensions panel.',
            'Open any valid Flutter project in VS Code.',
            'Click the play icon in the editor title bar or run the launch command.',
            'Save your Dart files to see UI changes instantly.',
            'Closing Call to Action: Ready to supercharge your Flutter development? Visit flutterwebemulator.site.',
            'Final Note: THANK\'S'
        ],
        imageUrl: '/slides/image8.png'
    }
];

/* ─── Component ─────────────────────────────────────────────────── */
const StudentTaxonomy = () => {
    const [slides, setSlides]         = useState(DEFAULT_SLIDES);
    const [current, setCurrent]       = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [animKey, setAnimKey]       = useState(0);
    const containerRef                = useRef(null);

    /* keyboard nav */
    const goTo = useCallback((idx) => {
        if (idx < 0 || idx >= slides.length) return;
        setCurrent(idx);
        setAnimKey(k => k + 1);
    }, [slides.length]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowLeft')  goTo(current - 1);
            if (e.key === 'ArrowRight') goTo(current + 1);
            if (e.key === 'Escape' && fullscreen) {
                if (document.fullscreenElement) {
                    document.exitFullscreen?.();
                } else {
                    setFullscreen(false);
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [current, goTo, fullscreen]);

    useEffect(() => {
        const onFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setFullscreen(false);
            }
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    /* fullscreen / reading mode */
    const toggleFullscreen = () => {
        if (!fullscreen) {
            containerRef.current?.requestFullscreen?.();
            setFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setFullscreen(false);
        }
    };

    const slide     = slides[current];
    const level     = getLevelById(slide?.taxonomyLevel);
    const progress  = slides.length > 1 ? ((current) / (slides.length - 1)) * 100 : 100;

    // Inside Fullscreen layout
    if (fullscreen) {
        return (
            <div className="reading-mode-container" ref={containerRef} style={{ 
                background: 'var(--bg-base)', width: '100vw', height: '100vh', 
                display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', overflow: 'hidden'
            }}>
                {/* Reading Mode Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{slide.title}</h2>
                        {level && (
                            <span style={{ background: level.color, color: '#fff', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                                {level.emoji} {level.label}
                            </span>
                        )}
                    </div>
                    <button className="btn btn-ghost" onClick={toggleFullscreen} style={{ padding: '6px 12px' }}>
                        <MdFullscreenExit size={20} style={{ marginRight: 6 }} /> Exit Reading Mode
                    </button>
                </div>

                {/* Reading Mode Progress */}
                <div style={{ height: 4, background: 'var(--bg-input)', width: '100%' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: level?.color || 'var(--primary)', transition: 'width 0.3s' }} />
                </div>

                {/* Reading Mode Content Split */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    
                    {/* Slide Image Area */}
                    <div style={{ flex: '6', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', padding: 24 }}>
                        <img 
                            src={slide.imageUrl} 
                            alt={`Slide ${slide.number}`} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--r-md)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} 
                        />
                    </div>

                    {/* Taxonomy Analysis Area */}
                    <div key={animKey} className="animate-fade" style={{ flex: '4', display: 'flex', flexDirection: 'column', padding: '40px 48px', overflowY: 'auto', background: level?.bg || 'var(--bg-card)', borderLeft: `4px solid ${level?.color || 'transparent'}` }}>
                        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: level ? level.color : 'var(--text-muted)', marginBottom: 8 }}>
                            Slide {slide.number} of {slides.length}
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>{slide.title}</h1>
                        
                        {slide.bullets && slide.bullets.length > 0 && (
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16, padding: 0, marginBottom: 40 }}>
                                {slide.bullets.map((b, i) => (
                                    <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: level ? level.color : 'var(--text-muted)', marginTop: 8 }} />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div style={{ marginTop: 'auto', padding: 20, background: 'var(--bg-base)', borderRadius: 'var(--r-lg)', border: `1px solid ${level?.color}44`, boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: level?.color }}>
                                <span style={{ fontSize: 18 }}>{level?.emoji}</span> Bloom's: {level?.label}
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>{level?.description}</p>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 'var(--r-md)' }}>
                                {level?.verbs}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Nav controls in reading mode */}
                <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, background: 'var(--bg-card)', padding: '8px 16px', borderRadius: 99, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid var(--border)', zIndex: 20 }}>
                    <button className="btn btn-ghost" onClick={() => goTo(current - 1)} disabled={current === 0} style={{ padding: '8px 16px' }}>
                        <MdChevronLeft size={20} /> Prev
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
                        {slides.map((_, i) => (
                            <button key={i} onClick={() => goTo(i)} style={{ width: 10, height: 10, borderRadius: '50%', background: i === current ? (level?.color || 'var(--primary)') : 'var(--border)', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.3s' }} />
                        ))}
                    </div>
                    <button className="btn btn-ghost" onClick={() => goTo(current + 1)} disabled={current === slides.length - 1} style={{ padding: '8px 16px' }}>
                        Next <MdChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade" ref={containerRef} style={{ paddingBottom: 0 }}>
            {/* ─── Header ─── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Taxonomy Slide Viewer</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        FlutterWebEmulator.pptx · {slides.length} slides
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(o => !o)}>
                        <MdMenu size={16} /> {sidebarOpen ? 'Hide' : 'Show'} Filmstrip
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={toggleFullscreen}>
                        <MdFullscreen size={16} /> Reading Mode
                    </button>
                </div>
            </div>

            {/* ─── Progress bar ─── */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Progress</span>
                    <span>{current + 1} / {slides.length}</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: level ? `linear-gradient(90deg, ${level.color}, ${level.color}bb)` : 'var(--primary)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                </div>
            </div>

            {/* ─── Main area ─── */}
            <div style={{ display: 'flex', gap: 14, height: 'calc(100vh - 320px)', minHeight: 480 }}>

                {/* Filmstrip sidebar */}
                {sidebarOpen && (
                    <div style={{ width: 220, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }} className="thin-scroll">
                        {slides.map((s, i) => {
                            const lv = getLevelById(s.taxonomyLevel);
                            const isActive = i === current;
                            return (
                                <button key={s.id} onClick={() => goTo(i)}
                                    style={{
                                        textAlign: 'left', padding: 0, borderRadius: 'var(--r-md)',
                                        border: `2px solid ${isActive ? (lv?.color || 'var(--primary)') : 'var(--border)'}`,
                                        background: isActive ? (lv?.bg || 'var(--primary-muted)') : 'var(--bg-card)',
                                        cursor: 'pointer', transition: 'var(--t-fast)', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                                    }}>
                                    <div style={{ height: 70, background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                         <img src={s.imageUrl} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isActive ? 1 : 0.7 }} />
                                    </div>
                                    <div style={{ padding: '8px 12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: isActive && lv ? lv.color : 'var(--text-muted)' }}>#{s.number}</span>
                                            {lv && <span style={{ fontSize: 12 }}>{lv.emoji}</span>}
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {s.title}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Slide viewer - Inline Mode */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', background: 'var(--bg-card)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                        
                        {/* Slide Image */}
                        <div style={{ flex: '5', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                             <img src={slide.imageUrl} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>

                        {/* Analysis Box */}
                        <div key={animKey} className="animate-fade" style={{ flex: '4', padding: '32px', overflowY: 'auto', background: level?.bg || 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <span style={{ background: level?.color, color: '#fff', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>{level?.emoji}</span> {level?.label}
                                </span>
                            </div>
                            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>{slide.title}</h2>
                            
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                                {slide.bullets?.map((b, i) => (
                                    <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: level?.color || 'var(--text-muted)', marginTop: 6, flexShrink: 0 }} />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    {/* Nav controls */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', padding: '12px', borderTop: '1px solid var(--border)' }}>
                        <button className="btn btn-ghost" onClick={() => goTo(current - 1)} disabled={current === 0} style={{ minWidth: 100 }}>
                            <MdChevronLeft size={18} /> Prev
                        </button>
                        <button className="btn btn-primary" onClick={toggleFullscreen} style={{ padding: '0 24px' }}>
                            <MdFullscreen size={18} style={{ marginRight: 6 }}/> Read Mode
                        </button>
                        <button className="btn btn-ghost" onClick={() => goTo(current + 1)} disabled={current === slides.length - 1} style={{ minWidth: 100 }}>
                            Next <MdChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Bloom's Legend ─── */}
            <div style={{ marginTop: 14, marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Bloom's Taxonomy — Learning Levels
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {BLOOM_LEVELS.map(l => {
                        const count = slides.filter(s => s.taxonomyLevel === l.id).length;
                        const isActive = slide?.taxonomyLevel === l.id;
                        return (
                            <div key={l.id} style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99,
                                background: isActive ? l.bg : 'transparent',
                                border: `1px solid ${isActive ? l.color + '55' : 'var(--border)'}`,
                                transition: 'var(--t-fast)'
                            }}>
                                <span style={{ fontSize: 14 }}>{l.emoji}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? l.color : 'var(--text-secondary)' }}>{l.label}</span>
                                {count > 0 && <span style={{ fontSize: 10, background: l.color + '22', color: l.color, padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>{count}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudentTaxonomy;
