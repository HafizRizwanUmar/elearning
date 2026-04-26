import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdMenuBook, MdExpandMore, MdExpandLess, MdSchedule } from 'react-icons/md';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = [
    '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
];

const buildSchedule = (days, start, end) => {
    if (!days.length) return '';
    return `${days.join('/')} ${start}–${end}`;
};

const parseSchedule = (str) => {
    if (!str) return { days: [], start: '9:00 AM', end: '10:30 AM' };
    const parts = str.split(' ');
    const rawDays = (parts[0] || '').split('/').filter(d => DAYS.includes(d));
    const rest = parts.slice(1).join(' ');
    const timeParts = rest.split('–');
    return { days: rawDays, start: timeParts[0]?.trim() || '9:00 AM', end: timeParts[1]?.trim() || '10:30 AM' };
};

const genCode = (name) => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    return words.map(w => w[0].toUpperCase()).join('').slice(0, 3);
};

// ─── Session Panel (per course) ───────────────────────────────────────────────
const SessionPanel = ({ course, api, onMsg }) => {
    const [sessions, setSessions] = useState(course.sessions || []);
    const [newSess, setNewSess] = useState({ day: 'Mon', start_time: '9:00 AM', end_time: '10:30 AM', room: '' });
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const addSession = async () => {
        setAdding(true);
        try {
            const res = await api.post(`/api/admin/courses/${course.id}/sessions`, newSess);
            const updated = [...sessions, { ...newSess, id: res.data.id, course_id: course.id }];
            setSessions(updated);
            setNewSess({ day: 'Mon', start_time: '9:00 AM', end_time: '10:30 AM', room: '' });
            setShowForm(false);
            onMsg('Session added', 'success');
        } catch (e) { onMsg(e.response?.data?.message || 'Error', 'error'); }
        finally { setAdding(false); }
    };

    const removeSession = async (sid) => {
        try {
            await api.delete(`/api/admin/courses/${course.id}/sessions/${sid}`);
            setSessions(p => p.filter(s => s.id !== sid));
            onMsg('Session removed', 'success');
        } catch { onMsg('Delete failed', 'error'); }
    };

    return (
        <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MdSchedule size={13} /> Class Sessions ({sessions.length})
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(p => !p)} style={{ fontSize: 12 }}>
                    <MdAdd size={13} /> Add Session
                </button>
            </div>

            {/* Existing sessions */}
            {sessions.length === 0 && !showForm && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No sessions yet. Click "Add Session" to create one.</div>
            )}
            {sessions.map(s => (
                <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                    background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)',
                    marginBottom: 6, border: '1px solid var(--border)'
                }}>
                    <span className="badge badge-primary" style={{ minWidth: 36, textAlign: 'center' }}>{s.day}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
                        {s.start_time} – {s.end_time}
                        {s.room && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· Room {s.room}</span>}
                    </span>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeSession(s.id)}>
                        <MdDelete size={12} />
                    </button>
                </div>
            ))}

            {/* Add session form */}
            {showForm && (
                <div style={{
                    background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)',
                    padding: '12px', marginTop: 8, border: '1px solid var(--border-md)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Day</div>
                            <select className="form-select" value={newSess.day}
                                onChange={e => setNewSess(p => ({ ...p, day: e.target.value }))}>
                                {DAYS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Start</div>
                            <select className="form-select" value={newSess.start_time}
                                onChange={e => setNewSess(p => ({ ...p, start_time: e.target.value }))}>
                                {TIMES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>End</div>
                            <select className="form-select" value={newSess.end_time}
                                onChange={e => setNewSess(p => ({ ...p, end_time: e.target.value }))}>
                                {TIMES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Room</div>
                            <input className="form-input" placeholder="e.g. 101"
                                value={newSess.room}
                                onChange={e => setNewSess(p => ({ ...p, room: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={addSession} disabled={adding}>
                                {adding ? <div className="spinner" style={{ width: 12, height: 12 }} /> : 'Add'}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminCourses = () => {
    const { api } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', credits: 3, teacher_id: '', description: '' });
    const [schedParts, setSchedParts] = useState({ days: [], start: '9:00 AM', end: '10:30 AM' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expandedSessions, setExpandedSessions] = useState({});
    // Enrollment modal
    const [enrollModal, setEnrollModal] = useState(null); // course
    const [enrollStudentId, setEnrollStudentId] = useState('');
    const [enrollSaving, setEnrollSaving] = useState(false);

    const load = async () => {
        try {
            const [c, t, s] = await Promise.all([
                api.get('/api/admin/courses'),
                api.get('/api/admin/teachers'),
                api.get('/api/admin/students'),
            ]);
            setCourses(c.data); setTeachers(t.data); setStudents(s.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const autoCode = (name, existingCourses = courses) => {
        const prefix = genCode(name);
        if (!prefix) return '';
        const taken = existingCourses.map(c => c.code);
        for (let i = 101; i <= 999; i++) {
            const candidate = `${prefix}${i}`;
            if (!taken.includes(candidate)) return candidate;
        }
        return prefix;
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', code: '', credits: 3, teacher_id: '', description: '' });
        setSchedParts({ days: [], start: '9:00 AM', end: '10:30 AM' });
        setModal(true);
    };
    const openEdit = (c) => {
        setEditing(c);
        setForm({ name: c.name, code: c.code, credits: c.credits, teacher_id: c.teacher_id || '', description: c.description || '' });
        setSchedParts(parseSchedule(c.schedule));
        setModal(true);
    };

    const handleNameChange = (name) => {
        const code = editing ? form.code : autoCode(name);
        setForm(f => ({ ...f, name, code }));
    };

    const toggleDay = (day) => {
        setSchedParts(p => ({
            ...p,
            days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
        }));
    };

    const save = async () => {
        if (!form.name || !form.code) return setMsg({ text: 'Name and code required', type: 'error' });
        const schedule = buildSchedule(schedParts.days, schedParts.start, schedParts.end);
        setSaving(true);
        try {
            const payload = { ...form, schedule };
            if (editing) await api.put(`/api/admin/courses/${editing.id}`, payload);
            else await api.post('/api/admin/courses', payload);
            setModal(false); setMsg({ text: editing ? 'Course updated' : 'Course added', type: 'success' }); load();
        } catch (e) { setMsg({ text: e.response?.data?.message || 'Error saving', type: 'error' }); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        try { await api.delete(`/api/admin/courses/${id}`); setMsg({ text: 'Course deleted', type: 'success' }); load(); }
        catch { setMsg({ text: 'Delete failed', type: 'error' }); }
        setDeleteConfirm(null);
    };

    const enrollStudent = async () => {
        if (!enrollStudentId) return;
        setEnrollSaving(true);
        try {
            await api.post('/api/admin/enrollments', { student_id: parseInt(enrollStudentId), course_id: enrollModal.id });
            setMsg({ text: 'Student enrolled!', type: 'success' });
            setEnrollModal(null); setEnrollStudentId('');
            load();
        } catch (e) { setMsg({ text: e.response?.data?.message || 'Already enrolled', type: 'error' }); }
        finally { setEnrollSaving(false); }
    };

    const filtered = courses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-content animate-fade">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Courses</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{courses.length} courses offered</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={16} /> Add Course</button>
            </div>

            {msg.text && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

            <div className="search-bar">
                <div className="search-input-wrap">
                    <span className="search-icon"><MdSearch /></span>
                    <input className="form-input" placeholder="Search by name or code…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Course cards (replaces table for session expand support) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
                    : filtered.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon"><MdMenuBook size={20} /></div><div className="empty-title">No courses found</div></div>
                    ) : filtered.map(c => (
                        <div key={c.id} className="stat-card" style={{ padding: 0 }}>
                            {/* Course row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</span>
                                        <span className="badge badge-primary">{c.code}</span>
                                        <span className="badge badge-neutral">{c.credits} cr</span>
                                        <span className="badge badge-info">{c.enrolled_count} students</span>
                                        {c.sessions?.length > 0 && (
                                            <span className="badge" style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}>
                                                {c.sessions.length} session{c.sessions.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {c.teacher_name || 'Unassigned'}{c.schedule ? ` · ${c.schedule}` : ''}
                                        {c.description && ` · ${c.description.slice(0, 60)}${c.description.length > 60 ? '…' : ''}`}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ fontSize: 12 }}
                                        onClick={() => setEnrollModal(c)}
                                    >
                                        <MdAdd size={13} /> Enroll
                                    </button>
                                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(c)}><MdEdit size={14} /></button>
                                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm(c.id)}><MdDelete size={14} /></button>
                                    <button
                                        className="btn btn-ghost btn-sm btn-icon"
                                        onClick={() => setExpandedSessions(p => ({ ...p, [c.id]: !p[c.id] }))}
                                        title="Manage class sessions"
                                    >
                                        {expandedSessions[c.id] ? <MdExpandLess size={16} /> : <MdSchedule size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* Sessions panel */}
                            {expandedSessions[c.id] && (
                                <SessionPanel
                                    course={c}
                                    api={api}
                                    onMsg={(text, type) => setMsg({ text, type })}
                                />
                            )}
                        </div>
                    ))}
            </div>

            {/* Add/Edit Course Modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
                        <div className="modal-header"><span className="modal-title">{editing ? 'Edit Course' : 'Add Course'}</span><button className="modal-close" onClick={() => setModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Course Name *</label>
                                    <input className="form-input" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Introduction to Programming" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Course Code * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(auto)</span></label>
                                    <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="CS101" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Credits</label>
                                    <select className="form-select" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))}>
                                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} credit{n > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Assigned Teacher</label>
                                    <select className="form-select" value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}>
                                        <option value="">— Unassigned —</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Weekly Schedule</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                    {DAYS.map(d => (
                                        <button key={d} type="button" onClick={() => toggleDay(d)}
                                            style={{
                                                padding: '5px 12px', borderRadius: 'var(--r-full)', fontSize: 12, fontWeight: 600,
                                                cursor: 'pointer', border: '1px solid',
                                                background: schedParts.days.includes(d) ? 'var(--primary)' : 'var(--bg-elevated)',
                                                color: schedParts.days.includes(d) ? 'black' : 'var(--text-muted)',
                                                borderColor: schedParts.days.includes(d) ? 'var(--primary)' : 'var(--border-md)',
                                                transition: 'var(--t-fast)'
                                            }}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Start Time</div>
                                        <select className="form-select" value={schedParts.start} onChange={e => setSchedParts(p => ({ ...p, start: e.target.value }))}>
                                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', marginTop: 14 }}>→</span>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>End Time</div>
                                        <select className="form-select" value={schedParts.end} onChange={e => setSchedParts(p => ({ ...p, end: e.target.value }))}>
                                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {schedParts.days.length > 0 && (
                                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                                        📅 {buildSchedule(schedParts.days, schedParts.start, schedParts.end)}
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Course description…" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <><div className="spinner" /> Saving…</> : 'Save Course'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enroll Student Modal */}
            {enrollModal && (
                <div className="modal-overlay" onClick={() => setEnrollModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <span className="modal-title">Enroll Student in {enrollModal.name}</span>
                            <button className="modal-close" onClick={() => setEnrollModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Select Student *</label>
                                <select className="form-select" value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)}>
                                    <option value="">— Choose student —</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.student_id || s.email})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setEnrollModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={enrollStudent} disabled={enrollSaving || !enrollStudentId}>
                                {enrollSaving ? <><div className="spinner" />Enrolling…</> : 'Enroll Student'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="confirm-overlay"><div className="confirm-box">
                    <div className="confirm-icon" style={{ background: 'var(--danger-bg)' }}><MdDelete size={22} color="var(--danger)" /></div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Delete Course?</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>All enrollments, grades and attendance for this course will be deleted.</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={() => remove(deleteConfirm)}>Delete</button>
                    </div>
                </div></div>
            )}
        </div>
    );
};

export default AdminCourses;
