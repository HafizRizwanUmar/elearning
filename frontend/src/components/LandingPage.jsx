import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdAutoAwesome, MdArrowForward, MdSchool, MdLibraryBooks, MdAssignment,
    MdPlayCircle, MdStar, MdCheckCircle, MdGroup, MdTrendingUp, MdEmojiEvents,
    MdBolt, MdWorkspacePremium, MdArrowOutward, MdDashboard, MdEventNote
} from 'react-icons/md';

const MdCalendar = MdEventNote; // alias for schedule icon

/* ─── DESIGN DIRECTION ──────────────────────────────────────────────────────
   Dark editorial luxury. Black base with ivory & amber accents.
   Fonts: "Playfair Display" (display) + "DM Sans" (body).
   Heavy typographic hierarchy. Geometric accent lines.
   Animated counter stats. Bento-grid features section.
   Subtle grain texture overlay. Split asymmetric hero.
   ────────────────────────────────────────────────────────────────────────── */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Montserrat:wght@300;400;500;600;700&display=swap');
`;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black: #F4F7FE;
    --surface: #FFFFFF;
    --surface2: #F8FAFC;
    --border: #E2E8F0;
    --border2: #CBD5E1;
    --white: #1E293B;
    --amber: #4B6BFB;
    --amber-dim: rgba(75, 107, 251, 0.10);
    --amber-glow: rgba(75, 107, 251, 0.06);
    --text-muted: #94A3B8;
    --text-secondary: #475569;
    --radius: 20px;
    --radius-sm: 12px;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--black);
    color: var(--white);
    font-family: 'Montserrat', sans-serif;
    overflow-x: hidden;
  }

  /* ── Grain Overlay ── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.025;
    pointer-events: none;
    z-index: 999;
  }

  /* ── Nav ── */
  .nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 64px;
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(244, 247, 254, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: all 0.3s ease;
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; }
  .nav-logo-icon {
    width: 34px; height: 34px; background: var(--amber);
    border-radius: 9px; display: flex; align-items: center;
    justify-content: center; color: #FFFFFF; flex-shrink: 0;
  }
  .nav-logo-text { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--white); }
  .nav-links { display: flex; gap: 40px; align-items: center; }
  .nav-link { font-size: 14px; color: var(--text-secondary); cursor: pointer; transition: color 0.2s; font-weight: 500; }
  .nav-link:hover { color: var(--white); }
  .nav-cta {
    background: var(--amber); color: #FFFFFF; border: none;
    padding: 10px 26px; border-radius: 100px; font-weight: 600;
    font-size: 14px; cursor: pointer; font-family: 'Montserrat', sans-serif;
    transition: background 0.2s, transform 0.15s;
  }
  .nav-cta:hover { background: var(--amber); transform: translateY(-1px); }

  /* ── Hero ── */
  .hero {
    min-height: 100vh; padding: 140px 64px 80px;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
    max-width: 1400px; margin: 0 auto;
    position: relative;
  }
  .hero-glow {
    position: absolute; top: 20%; right: 5%;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(75,107,251,0.08) 0%, transparent 65%);
    pointer-events: none;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 7px 16px; border-radius: 100px;
    border: 1px solid rgba(75,107,251,0.3);
    background: rgba(75,107,251,0.07);
    font-size: 13px; font-weight: 600; color: var(--amber);
    margin-bottom: 28px; letter-spacing: 0.02em;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 68px; line-height: 1.08;
    font-weight: 900; letter-spacing: -0.02em;
    margin-bottom: 28px;
  }
  .hero-title em { font-style: italic; color: var(--amber); }
  .hero-desc {
    font-size: 17px; color: var(--text-secondary);
    line-height: 1.7; max-width: 480px; margin-bottom: 44px;
    font-weight: 400;
  }
  .hero-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--amber); color: #FFFFFF; border: none;
    padding: 15px 36px; border-radius: 100px; font-weight: 700;
    font-size: 16px; cursor: pointer; font-family: 'Montserrat', sans-serif;
    display: flex; align-items: center; gap: 10px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(75,107,251,0.25);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(75,107,251,0.35); }
  .btn-ghost {
    background: transparent; color: var(--white); border: 1px solid var(--border2);
    padding: 15px 36px; border-radius: 100px; font-weight: 500;
    font-size: 16px; cursor: pointer; font-family: 'Montserrat', sans-serif;
    display: flex; align-items: center; gap: 10px;
    transition: border-color 0.2s, background 0.2s;
  }
  .btn-ghost:hover { border-color: var(--amber); background: rgba(75,107,251,0.05); }
  .hero-social-proof {
    display: flex; align-items: center; gap: 12px; margin-top: 40px;
  }
  .hero-avatars { display: flex; }
  .hero-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    border: 2px solid var(--black);
    margin-left: -8px; background: var(--surface2);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; color: var(--amber);
  }
  .hero-avatar:first-child { margin-left: 0; }
  .hero-social-text { font-size: 13px; color: var(--text-secondary); }
  .hero-social-text strong { color: var(--white); }

  /* ── Hero Right: Dashboard Card ── */
  .hero-visual { position: relative; }
  .dashboard-card {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
    position: relative;
  }
  .dashboard-topbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
  }
  .dashboard-title { font-size: 14px; font-weight: 600; color: var(--white); }
  .dashboard-badge {
    font-size: 11px; font-weight: 600; padding: 4px 12px;
    background: rgba(75,107,251,0.15); color: var(--amber);
    border-radius: 100px; border: 1px solid rgba(75,107,251,0.25);
  }
  .dashboard-body { padding: 24px; }
  .course-row {
    display: flex; align-items: center; gap: 16px;
    padding: 14px 16px; border-radius: 14px;
    background: var(--surface2); margin-bottom: 10px;
    transition: background 0.2s;
  }
  .course-row:hover { background: rgba(75,107,251,0.06); }
  .course-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .course-info { flex: 1; }
  .course-name { font-size: 13px; font-weight: 600; color: var(--white); margin-bottom: 6px; }
  .progress-bar-track { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; }
  .progress-bar-fill { height: 4px; border-radius: 2px; transition: width 1s ease; }
  .course-pct { font-size: 12px; color: var(--text-secondary); font-weight: 600; flex-shrink: 0; }
  .dashboard-stats {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;
  }
  .stat-mini {
    background: var(--surface2); border-radius: 14px; padding: 16px;
    border: 1px solid var(--border);
  }
  .stat-mini-val { font-size: 22px; font-weight: 700; color: var(--amber); font-family: 'Playfair Display', serif; }
  .stat-mini-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }

  /* Floating badge */
  .float-badge {
    position: absolute; top: -20px; right: -20px;
    background: var(--amber); color: #FFFFFF;
    border-radius: 16px; padding: 14px 18px;
    box-shadow: 0 8px 30px rgba(75,107,251,0.4);
    font-size: 12px; font-weight: 700; text-align: center;
    animation: floatY 3s ease-in-out infinite;
  }
  .float-badge-val { font-size: 22px; font-family: 'Playfair Display', serif; display: block; }
  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .float-badge2 {
    position: absolute; bottom: 30px; left: -28px;
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 14px; padding: 12px 16px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    animation: floatY 3.5s ease-in-out infinite reverse;
  }
  .float-badge2-icon { color: var(--amber); }
  .float-badge2-text { font-size: 12px; font-weight: 600; color: var(--white); }
  .float-badge2-sub { font-size: 11px; color: var(--text-muted); }

  /* ── Stats Bar ── */
  .stats-bar {
    background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    padding: 40px 64px;
  }
  .stats-bar-inner {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 0; text-align: center;
  }
  .stat-item { padding: 0 20px; border-right: 1px solid var(--border); }
  .stat-item:last-child { border-right: none; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: var(--amber); }
  .stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }

  /* ── Section Shared ── */
  .section-label {
    font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--amber); margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 900;
    line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 20px;
  }
  .section-desc { font-size: 17px; color: var(--text-secondary); line-height: 1.7; max-width: 520px; }

  /* ── Features Bento ── */
  .features-section { padding: 100px 64px; max-width: 1400px; margin: 0 auto; }
  .features-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 60px; }
  .bento-grid { display: grid; grid-template-columns: repeat(6,1fr); grid-template-rows: auto; gap: 20px; }
  .bento-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 22px; padding: 32px; overflow: hidden; position: relative;
    transition: border-color 0.3s, transform 0.3s;
  }
  .bento-card:hover { border-color: var(--border2); transform: translateY(-3px); }
  .bento-card.span2 { grid-column: span 2; }
  .bento-card.span3 { grid-column: span 3; }
  .bento-card.span4 { grid-column: span 4; }
  .bento-card.dark { background: var(--surface2); }
  .bento-card.accent { background: var(--amber); color: #FFFFFF; border-color: var(--amber); }
  .bento-card.accent .bento-card-desc { color: rgba(255,255,255,0.85); }
  .bento-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--amber-dim); color: var(--amber);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .bento-card.accent .bento-icon { background: rgba(255,255,255,0.2); color: #FFFFFF; }
  .bento-card-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
  .bento-card.accent .bento-card-title { color: #FFFFFF; }
  .bento-card-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.65; }
  .bento-big-num { font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 900; color: var(--amber); line-height: 1; margin: 12px 0 8px; }
  .bento-tag { display: inline-flex; gap: 6px; align-items: center; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; }
  .tag-green { background: rgba(72,199,120,0.12); color: #48c778; }
  .check-list { list-style: none; margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
  .check-list li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text-secondary); }
  .check-list li svg { color: var(--amber); flex-shrink: 0; }

  /* ── Courses Carousel Preview ── */
  .courses-section { padding: 100px 64px; background: #F4F7FE; }
  .courses-header { max-width: 1400px; margin: 0 auto 50px; display: flex; justify-content: space-between; align-items: flex-end; }
  .courses-grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
  .course-card {
    border-radius: 20px; overflow: hidden;
    border: 1px solid var(--border); background: var(--surface);
    transition: transform 0.3s, border-color 0.3s;
  }
  .course-card:hover { transform: translateY(-4px); border-color: var(--border2); }
  .course-thumb {
    height: 180px; display: flex; align-items: center; justify-content: center;
    font-size: 52px; position: relative; overflow: hidden;
  }
  .course-body { padding: 24px; }
  .course-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .course-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; }
  .course-rating { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: var(--amber); }
  .course-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; line-height: 1.3; }
  .course-author { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
  .course-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border); }
  .course-students { font-size: 12px; color: var(--text-muted); font-weight: 500; display: flex; align-items: center; gap: 6px; }
  .course-enroll { font-size: 13px; font-weight: 700; color: var(--amber); cursor: pointer; display: flex; align-items: center; gap: 4px; }
  .course-enroll:hover { text-decoration: underline; }

  /* ── Testimonials ── */
  .testimonials-section { padding: 100px 64px; max-width: 1400px; margin: 0 auto; }
  .testimonials-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 60px; }
  .testimonial-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px;
    transition: border-color 0.3s;
  }
  .testimonial-card:hover { border-color: var(--border2); }
  .testimonial-stars { display: flex; gap: 4px; color: var(--amber); margin-bottom: 20px; }
  .testimonial-text { font-size: 15px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 28px; font-style: italic; }
  .testimonial-author { display: flex; align-items: center; gap: 14px; }
  .testimonial-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: var(--surface2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: var(--amber);
  }
  .testimonial-name { font-size: 14px; font-weight: 700; color: var(--white); }
  .testimonial-role { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  /* ── CTA Section ── */
  .cta-section {
    padding: 80px 64px;
    background: var(--black);
  }
  .cta-inner {
    max-width: 1100px; margin: 0 auto;
    background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, var(--surface) 100%);
    border: 1px solid rgba(75,107,251,0.2);
    border-radius: 32px; padding: 80px; text-align: center;
    position: relative; overflow: hidden;
  }
  .cta-inner::before {
    content: ''; position: absolute; top: -50%; left: 50%; transform: translateX(-50%);
    width: 500px; height: 300px;
    background: radial-gradient(circle, rgba(75,107,251,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .cta-title { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 900; margin-bottom: 20px; line-height: 1.1; }
  .cta-desc { font-size: 18px; color: var(--text-secondary); margin-bottom: 40px; max-width: 500px; margin-left: auto; margin-right: auto; }
  .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  /* ── Footer ── */
  .footer { padding: 60px 64px 40px; border-top: 1px solid var(--border); }
  .footer-inner { max-width: 1400px; margin: 0 auto; }
  .footer-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; gap: 40px; }
  .footer-brand { max-width: 300px; }
  .footer-brand-name { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .footer-brand-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.65; }
  .footer-cols { display: grid; grid-template-columns: repeat(3,1fr); gap: 40px; }
  .footer-col-title { font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--white); margin-bottom: 20px; }
  .footer-col-link { display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; cursor: pointer; transition: color 0.2s; }
  .footer-col-link:hover { color: var(--amber); }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 32px; border-top: 1px solid var(--border); }
  .footer-copy { font-size: 13px; color: var(--text-muted); }
  .footer-amber { color: var(--amber); }

  /* ── Divider line ── */
  .accent-line { width: 48px; height: 3px; background: var(--amber); border-radius: 2px; margin-bottom: 20px; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .hero { grid-template-columns: 1fr; padding: 130px 32px 60px; gap: 60px; }
    .hero-title { font-size: 48px; }
    .hero-glow { display: none; }
    .stats-bar-inner { grid-template-columns: repeat(2,1fr); gap: 32px; }
    .stat-item { border-right: none; }
    .bento-grid { grid-template-columns: 1fr 1fr; }
    .bento-card.span3, .bento-card.span4 { grid-column: span 2; }
    .courses-grid { grid-template-columns: 1fr 1fr; }
    .testimonials-grid { grid-template-columns: 1fr; }
    .nav { padding: 18px 32px; }
    .features-section, .courses-section, .cta-section, .testimonials-section { padding: 70px 32px; }
    .footer { padding: 48px 32px 32px; }
    .footer-top { flex-direction: column; }
    .cta-inner { padding: 48px 32px; }
    .cta-title { font-size: 36px; }
  }
  @media (max-width: 640px) {
    .hero-title { font-size: 36px; }
    .courses-grid { grid-template-columns: 1fr; }
    .bento-grid { grid-template-columns: 1fr; }
    .bento-card.span2, .bento-card.span3, .bento-card.span4 { grid-column: span 1; }
    .features-header { flex-direction: column; align-items: flex-start; gap: 20px; }
    .courses-header { flex-direction: column; align-items: flex-start; gap: 20px; }
    .nav-links .nav-link { display: none; }
    .stats-bar-inner { grid-template-columns: 1fr 1fr; }
    .footer-cols { grid-template-columns: 1fr; }
  }
`;

/* ─── COUNTER HOOK ─────────────────────────────────────────────────────────── */
function useCounter(target, duration = 1800) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                let start = 0;
                const step = () => {
                    start += target / (duration / 16);
                    if (start >= target) { setCount(target); return; }
                    setCount(Math.floor(start));
                    requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                obs.disconnect();
            }
        }, { threshold: 0.4 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [target, duration]);
    return [count, ref];
}

/* ─── STAT COMPONENT ───────────────────────────────────────────────────────── */
function AnimatedStat({ value, suffix, label }) {
    const [count, ref] = useCounter(value);
    return (
        <div className="stat-item" ref={ref}>
            <div className="stat-num">{count.toLocaleString()}{suffix}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

/* ─── COURSES DATA ─────────────────────────────────────────────────────────── */
const COURSES = [
    { emoji: '⚛️', bg: 'linear-gradient(135deg,#E0F2FE,#BAE6FD)', tag: 'Development', tagColor: 'rgba(99,179,237,0.15)', tagText: '#63B3ED', title: 'Modern React & Next.js Mastery', author: 'by Ahmad Hassan', rating: 4.9, students: '12.4k', level: 'Intermediate' },
    { emoji: '🎨', bg: 'linear-gradient(135deg,#F3E8FF,#E9D5FF)', tag: 'Design', tagColor: 'rgba(183,148,246,0.15)', tagText: '#8B5CF6', title: 'UI/UX Design Fundamentals', author: 'by Sara Malik', rating: 4.8, students: '9.1k', level: 'Beginner' },
    { emoji: '🤖', bg: 'linear-gradient(135deg,#DCFCE7,#BBF7D0)', tag: 'AI & ML', tagColor: 'rgba(72,199,120,0.15)', tagText: '#48c778', title: 'Machine Learning with Python', author: 'by Dr. Ali Raza', rating: 4.9, students: '18.7k', level: 'Advanced' },
];

const TESTIMONIALS = [
    { text: 'This platform completely changed how I approach learning. The structured content and real-time feedback is unmatched.', name: 'Omar Farooq', role: 'Software Engineer', initial: 'O' },
    { text: 'I landed my first design job 3 months after completing the UI/UX track. Worth every moment spent here.', name: 'Fatima Zahra', role: 'Product Designer', initial: 'F' },
    { text: 'The AI-assisted assignments and mentor feedback system is genuinely next-level. My skills grew 10x faster.', name: 'Bilal Chaudhry', role: 'ML Engineer', initial: 'B' },
];

/* ─── MAIN COMPONENT ───────────────────────────────────────────────────────── */
const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <style>{FONTS}{CSS}</style>

            {/* ── Nav ── */}
            <nav className="nav">
                <div className="nav-logo">
                    <img src="/logo.jpeg" alt="Classeta Logo" style={{ width: '34px', height: '34px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
                    <span className="nav-logo-text">Classeta</span>
                </div>
                <div className="nav-links">
                    <span className="nav-link">Features</span>
                    <span className="nav-link">For Teachers</span>
                    <span className="nav-link">For Students</span>
                    <span className="nav-link">Admin Portal</span>
                    <button className="nav-cta" onClick={() => navigate('/login')}>Login</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{ background: 'var(--black)', overflow: 'hidden' }}>
                <div className="hero">
                    <div className="hero-glow" />
                    {/* Left */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div className="hero-eyebrow">
                            <MdBolt size={14} /> A complete Learning Management System for schools &amp; institutions
                        </div>
                        <h1 className="hero-title">
                            Manage <em>Learning.</em><br />Empower Everyone.
                        </h1>
                        <p className="hero-desc">
                            Classeta is a full-featured LMS built for administrators, teachers, and students.
                            Attendance, grades, schedules, assignments — all in one place.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-primary" onClick={() => navigate('/login')}>
                                Sign In to Dashboard <MdArrowForward size={18} />
                            </button>
                            <button className="btn-ghost">
                                <MdPlayCircle size={18} /> See How It Works
                            </button>
                        </div>
                        <div className="hero-social-proof">
                            <div className="hero-avatars">
                                {['A','T','S','R'].map(l => (
                                    <div className="hero-avatar" key={l}>{l}</div>
                                ))}
                            </div>
                            <span className="hero-social-text">
                                <strong>3 roles</strong> — Admin, Teacher &amp; Student portals
                            </span>
                        </div>
                    </div>

                    {/* Right: Dashboard Preview */}
                    <div className="hero-visual">
                        <div className="float-badge">
                            <span className="float-badge-val">98%</span>
                            Completion Rate
                        </div>
                        <div className="dashboard-card">
                            <div className="dashboard-topbar">
                                <span className="dashboard-title">My Learning Dashboard</span>
                                <span className="dashboard-badge">Pro Plan</span>
                            </div>
                            <div className="dashboard-body">
                                {[
                                    { name: 'Attendance — CS101', pct: 92, color: '#4B6BFB' },
                                    { name: 'Grades — Math201', pct: 85, color: '#48c778' },
                                    { name: 'Assignments Due — 3', pct: 60, color: '#8B5CF6' },
                                ].map(c => (
                                    <div className="course-row" key={c.name}>
                                        <div className="course-icon" style={{ background: c.color + '18' }}>
                                            <MdSchool size={20} style={{ color: c.color }} />
                                        </div>
                                        <div className="course-info">
                                            <div className="course-name">{c.name}</div>
                                            <div className="progress-bar-track">
                                                <div className="progress-bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                                            </div>
                                        </div>
                                        <span className="course-pct">{c.pct}%</span>
                                    </div>
                                ))}
                                <div className="dashboard-stats">
                                    <div className="stat-mini">
                                        <div className="stat-mini-val">4</div>
                                        <div className="stat-mini-label">Active Courses</div>
                                    </div>
                                    <div className="stat-mini">
                                        <div className="stat-mini-val">A−</div>
                                        <div className="stat-mini-label">Overall GPA</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="float-badge2">
                            <MdEmojiEvents size={22} className="float-badge2-icon" style={{ color: 'var(--amber)' }} />
                            <div>
                                <div className="float-badge2-text">Certificate Earned</div>
                                <div className="float-badge2-sub">React Pro Track</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <div className="stats-bar">
                <div className="stats-bar-inner">
                    <AnimatedStat value={3} suffix=" roles" label="Admin · Teacher · Student" />
                    <AnimatedStat value={100} suffix="%" label="Role-Based Access" />
                    <AnimatedStat value={30} suffix="+" label="Feature Pages" />
                    <AnimatedStat value={1} suffix=" platform" label="All-in-One LMS" />
                </div>
            </div>

            {/* ── Features Bento ── */}
            <section className="features-section">
                <div className="features-header">
                    <div>
                        <div className="section-label">Platform Features</div>
                        <div className="accent-line" />
                        <h2 className="section-title">Everything you need<br />to run your institution.</h2>
                    </div>
                    <p className="section-desc">Purpose-built LMS tools covering the full lifecycle — from enrollment to graduation.</p>
                </div>
                <div className="bento-grid">
                    {/* 1: Role-Based Dashboards */}
                    <div className="bento-card span3">
                        <div className="bento-icon"><MdDashboard size={26} /></div>
                        <div className="bento-card-title">Role-Based Dashboards</div>
                        <div className="bento-card-desc">Separate, purpose-built dashboards for Admins, Teachers, and Students. Everyone sees exactly what they need — nothing more, nothing less.</div>
                        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {['Admin Portal', 'Teacher View', 'Student View', 'Shared Pages'].map(t => (
                                <span key={t} style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{t}</span>
                            ))}
                        </div>
                    </div>
                    {/* 2: Amber accent - Attendance */}
                    <div className="bento-card span3 accent">
                        <div className="bento-icon"><MdEventNote size={26} /></div>
                        <div className="bento-card-title">Real-Time Attendance</div>
                        <div className="bento-card-desc">Teachers mark attendance with a single click — Present, Absent, or Late. Students and admins see live summaries instantly.</div>
                        <div className="bento-big-num">1 click</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}>Mark attendance per student, per class</div>
                    </div>
                    {/* 3 - Grades */}
                    <div className="bento-card span2 dark">
                        <div className="bento-icon"><MdTrendingUp size={26} /></div>
                        <div className="bento-card-title">Grade Management</div>
                        <div className="bento-card-desc">Inline grade entry with automatic letter-grade calculation and class averages.</div>
                    </div>
                    {/* 4 - Schedule */}
                    <div className="bento-card span2">
                        <div className="bento-icon"><MdCalendar size={26} /></div>
                        <div className="bento-card-title">Weekly Schedule Builder</div>
                        <div className="bento-card-desc">Set class days and times with visual day-selectors. Teachers and students see their personal timetables.</div>
                    </div>
                    {/* 5 - Assignments */}
                    <div className="bento-card span2 dark">
                        <div className="bento-icon"><MdGroup size={26} /></div>
                        <div className="bento-card-title">Student Management</div>
                        <div className="bento-card-desc">Admins manage enrolments, roles, and course assignments. Full CRUD for all users.</div>
                    </div>
                    {/* 6 - Library */}
                    <div className="bento-card span2">
                        <div className="bento-icon"><MdLibraryBooks size={26} /></div>
                        <div className="bento-card-title">Assignments & Submissions</div>
                        <div className="bento-card-desc">Teachers create assignments with deadlines. Students submit inline. Teachers grade and leave feedback.</div>
                        <ul className="check-list">
                            {['Deadline tracking', 'Inline submission', 'Grading & feedback'].map(i => (
                                <li key={i}><MdCheckCircle size={16} />{i}</li>
                            ))}
                        </ul>
                    </div>
                    {/* 7 - Announcements */}
                    <div className="bento-card span2 dark">
                        <div className="bento-icon"><MdAssignment size={26} /></div>
                        <div className="bento-card-title">Announcements & Notices</div>
                        <div className="bento-card-desc">Teachers post course announcements. Students receive notifications and can view all notices in one place.</div>
                    </div>
                </div>
            </section>

            {/* ── Courses Preview ── */}
            <section className="courses-section">
                <div className="courses-header">
                    <div>
                        <div className="section-label">Featured Courses</div>
                        <div className="accent-line" />
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Built for every<br />role in your school.</h2>
                    </div>
                    <button className="btn-ghost" style={{ flexShrink: 0 }}>
                        Browse All Courses <MdArrowOutward size={18} />
                    </button>
                </div>
                <div className="courses-grid">
                    {[
                        { emoji: '🛡️', bg: 'linear-gradient(135deg,#FEE2E2,#FECACA)', tag: 'Admin', tagColor: 'rgba(252,165,165,0.15)', tagText: '#FCA5A5', title: 'Full System Control', desc: 'Manage students, teachers, courses, roles and view analytics reports all from one powerful admin panel.' },
                        { emoji: '👨‍🏫', bg: 'linear-gradient(135deg,#E0F2FE,#BAE6FD)', tag: 'Teacher', tagColor: 'rgba(167,216,222,0.15)', tagText: '#A7D8DE', title: 'Classroom Management', desc: 'Mark attendance, enter grades, create assignments, post announcements, and monitor your students.' },
                        { emoji: '🎓', bg: 'linear-gradient(135deg,#DCFCE7,#BBF7D0)', tag: 'Student', tagColor: 'rgba(218,255,150,0.15)', tagText: '#DAFF96', title: 'Personal Learning Hub', desc: 'View your schedule, track grades, submit assignments, and stay updated with teacher announcements.' },
                    ].map((c, i) => (
                        <div className="course-card" key={i}>
                            <div className="course-thumb" style={{ background: c.bg }}>
                                <span style={{ fontSize: 64 }}>{c.emoji}</span>
                            </div>
                            <div className="course-body">
                                <div className="course-meta">
                                    <span className="course-tag" style={{ background: c.tagColor, color: c.tagText }}>{c.tag} Role</span>
                                </div>
                                <div className="course-title">{c.title}</div>
                                <div className="course-author" style={{ lineHeight: 1.6 }}>{c.desc}</div>
                                <div className="course-footer">
                                    <span className="course-enroll" onClick={() => navigate('/login')}>Access Portal <MdArrowForward size={14} /></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="testimonials-section">
                <div style={{ textAlign: 'center' }}>
                    <div className="section-label" style={{ textAlign: 'center' }}>Student Stories</div>
                    <h2 className="section-title">Trusted by educators,<br /><em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>loved by students.</em></h2>
                </div>
                <div className="testimonials-grid">
                    {[
                        { text: 'As an admin, managing 200+ students across 20 courses used to take days. With Classeta I do it in minutes. The role management and reports are incredible.', name: 'Dr. Khalid Mehmood', role: 'Institution Administrator', initial: 'K' },
                        { text: 'Marking attendance and entering grades is so smooth. The weekly schedule builder makes it easy to set up courses and students always know when their classes are.', name: 'Ms. Ayesha Tariq', role: 'Senior Lecturer', initial: 'A' },
                        { text: 'I can check my grades, attendance, and upcoming assignments all in one place. The dashboard tells me exactly where I stand in every subject.', name: 'Zain ul Abideen', role: 'BS Computer Science, Year 2', initial: 'Z' },
                    ].map((t, i) => (
                        <div className="testimonial-card" key={i}>
                            <div className="testimonial-stars">{[1,2,3,4,5].map(s => <MdStar key={s} size={16} />)}</div>
                            <p className="testimonial-text">"{t.text}"</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">{t.initial}</div>
                                <div>
                                    <div className="testimonial-name">{t.name}</div>
                                    <div className="testimonial-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="cta-inner">
                    <div className="section-label" style={{ marginBottom: 16 }}>Your Institution, Digitized</div>
                    <h2 className="cta-title">Ready to transform<br /><em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>how you teach?</em></h2>
                    <p className="cta-desc">Classeta gives admins, teachers, and students everything they need — in one clean, powerful platform.</p>
                    <div className="cta-btns">
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            Sign In to Classeta <MdArrowForward size={18} />
                        </button>
                        <button className="btn-ghost">View Features</button>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-top">
                        <div className="footer-brand">
                            <div className="footer-brand-name">
                                <img src="/logo.jpeg" alt="Classeta Logo" style={{ width: '30px', height: '30px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                                <span className="nav-logo-text">Classeta</span>
                            </div>
                            <p className="footer-brand-desc">
                                Classeta is a complete learning management system built for schools and institutions — admin, teacher, and student portals included.
                            </p>
                        </div>
                        <div className="footer-cols">
                            <div>
                                <div className="footer-col-title">Platform</div>
                                {['Dashboard', 'Attendance', 'Grades', 'Assignments', 'Schedules', 'Announcements'].map(l => (
                                    <span key={l} className="footer-col-link">{l}</span>
                                ))}
                            </div>
                            <div>
                                <div className="footer-col-title">Company</div>
                                {['About Us', 'Blog', 'Careers', 'Press', 'Partners'].map(l => (
                                    <span key={l} className="footer-col-link">{l}</span>
                                ))}
                            </div>
                            <div>
                                <div className="footer-col-title">Support</div>
                                {['Help Center', 'Contact', 'Privacy Policy', 'Terms of Use', 'Refund Policy'].map(l => (
                                    <span key={l} className="footer-col-link">{l}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <span className="footer-copy">© 2026 <span className="footer-amber">Classeta LMS</span>. All rights reserved.</span>
                        <span className="footer-copy">Built with care for learners everywhere.</span>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default LandingPage;