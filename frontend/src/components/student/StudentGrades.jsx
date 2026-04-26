import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdStar } from 'react-icons/md';

const MiniBar = ({ value, color, max = 100 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: 90 }}>
        <div style={{ flex: 1, height: 4, background: 'var(--bg-elevated)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, ((value ?? 0) / max) * 100)}%`, height: '100%', background: color, borderRadius: 9999 }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 26, textAlign: 'right' }}>
            {value != null ? `${value}` : '—'}
        </span>
    </div>
);

const StudentGrades = () => {
    const { api } = useContext(AuthContext);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/student/grades')
            .then(r => { setGrades(r.data); setLoading(false); })
            .catch(console.error);
    }, []);

    const semesterGroups = grades.reduce((g, r) => {
        (g[r.semester] || (g[r.semester] = [])).push(r);
        return g;
    }, {});

    const gradedGrades = grades.filter(g => g.composite != null || g.score != null);
    const avg = gradedGrades.length
        ? gradedGrades.reduce((a, g) => a + (g.composite ?? g.score ?? 0), 0) / gradedGrades.length
        : 0;

    const scoreColor = (s) => {
        if (s == null) return 'var(--text-muted)';
        if (s >= 80) return '#86EFAC';
        if (s >= 60) return '#FFE5C6';
        return '#FCA5A5';
    };

    if (loading) return (
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
    );

    return (
        <div className="page-content animate-fade">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>My Grades</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Academic performance across all semesters</p>
                </div>
                {gradedGrades.length > 0 && (
                    <span className="badge badge-success" style={{ fontSize: 14, padding: '6px 16px' }}>
                        GPA Average: {avg.toFixed(1)}%
                    </span>
                )}
            </div>

            {/* Formula legend */}
            <div style={{
                display: 'flex', gap: 16, padding: '10px 14px', borderRadius: 'var(--r-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                marginBottom: 20, flexWrap: 'wrap'
            }}>
                {[
                    { label: 'Attendance', pct: '10%', color: '#818cf8' },
                    { label: 'Assignments', pct: '40%', color: '#f59e0b' },
                    { label: 'Exam', pct: '50%', color: '#86EFAC' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ fontWeight: 700, color: item.color }}>{item.pct}</span>
                    </div>
                ))}
            </div>

            {Object.entries(semesterGroups).length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon"><MdStar size={20} /></div>
                    <div className="empty-title">No grades recorded yet</div>
                </div>
            )}

            {Object.entries(semesterGroups).map(([sem, items]) => (
                <div key={sem} style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                        {sem}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {items.map((g, i) => {
                            const displayScore = g.composite ?? g.score;
                            const col = scoreColor(displayScore);
                            const att = g.attendance_pct ?? 0;
                            const asgn = g.assignment_avg;

                            return (
                                <div key={i} className="stat-card" style={{ padding: '14px 18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                                        {/* Course info */}
                                        <div style={{ flex: '1 1 140px', minWidth: 140 }}>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                                                {g.course_name}
                                            </div>
                                            <span className="badge badge-primary">{g.code}</span>
                                        </div>

                                        {/* Attendance */}
                                        <div style={{ flex: '1 1 100px', minWidth: 100 }}>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                                                Attendance 10%
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(att), marginBottom: 3 }}>{att}%</div>
                                            <MiniBar value={att} color="#818cf8" />
                                        </div>

                                        {/* Assignments */}
                                        <div style={{ flex: '1 1 110px', minWidth: 110 }}>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                                                Assignments 40%
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(asgn), marginBottom: 3 }}>
                                                {asgn != null ? `${asgn}/100` : '—'}
                                            </div>
                                            <MiniBar value={asgn} color="#f59e0b" />
                                        </div>

                                        {/* Exam */}
                                        <div style={{ flex: '1 1 90px', minWidth: 90 }}>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: '#86EFAC', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                                                Exam 50%
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(g.exam_score), marginBottom: 3 }}>
                                                {g.exam_score != null ? `${g.exam_score}/100` : '—'}
                                            </div>
                                            <MiniBar value={g.exam_score} color="#86EFAC" />
                                        </div>

                                        {/* Composite + letter */}
                                        <div style={{ flex: '0 0 auto', textAlign: 'right', minWidth: 90 }}>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                                                Total
                                            </div>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: col, lineHeight: 1 }}>
                                                {displayScore != null ? displayScore : '—'}
                                            </div>
                                            {g.grade_letter && (
                                                <span className="badge" style={{
                                                    marginTop: 6,
                                                    background: col + '22', color: col,
                                                    border: `1px solid ${col}44`, fontSize: 14, fontWeight: 700
                                                }}>
                                                    {g.grade_letter}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Overall bar */}
                                    {displayScore != null && (
                                        <div style={{ marginTop: 12 }}>
                                            <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${displayScore}%`, height: '100%',
                                                    background: `linear-gradient(90deg, #818cf8 0%, #f59e0b 50%, #86EFAC 100%)`,
                                                    borderRadius: 9999, transition: 'width 0.5s'
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentGrades;
