import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdMenuBook, MdSchedule } from 'react-icons/md';

const DAY_COLORS = {
    Mon: '#818cf8', Tue: '#f59e0b', Wed: '#86EFAC',
    Thu: '#f87171', Fri: '#34d399', Sat: '#a78bfa', Sun: '#fb923c'
};

const TeacherCourses = () => {
    const { api } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/teacher/courses').then(r => { setCourses(r.data); setLoading(false); }).catch(console.error);
    }, []);

    if (loading) return (
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
    );

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>My Courses</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{courses.length} courses assigned to you</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 }}>
                {courses.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon"><MdMenuBook size={20} /></div>
                        <div className="empty-title">No courses assigned</div>
                    </div>
                )}
                {courses.map(c => (
                    <div key={c.id} className="stat-card" style={{ padding: 20, borderLeft: '3px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <span className="badge badge-primary">{c.code}</span>
                            <span className="badge badge-neutral">{c.credits} cr</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{c.name}</div>
                        {c.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{c.description}</div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: c.sessions?.length ? 14 : 0 }}>
                            <span className="badge badge-info">{c.enrolled_count} students</span>
                            {c.schedule && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {c.schedule}</span>}
                        </div>

                        {/* Class sessions */}
                        {c.sessions?.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MdSchedule size={11} /> Class Sessions
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {c.sessions.map(s => (
                                        <div key={s.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 7,
                                            background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)',
                                            padding: '5px 9px', border: '1px solid var(--border)'
                                        }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700,
                                                color: DAY_COLORS[s.day] || 'var(--primary)',
                                                minWidth: 28
                                            }}>{s.day}</span>
                                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>
                                                {s.start_time} – {s.end_time}
                                            </span>
                                            {s.room && (
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 }}>
                                                    Rm {s.room}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherCourses;
