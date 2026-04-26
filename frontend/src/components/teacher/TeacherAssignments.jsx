import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdAssignment, MdExpandMore, MdExpandLess, MdDownload, MdGrade, MdAttachFile } from 'react-icons/md';

const API_BASE = 'http://localhost:5000';

const TeacherAssignments = () => {
    const { api } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', course_id: '', description: '', deadline: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [expanded, setExpanded] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [gradeInputs, setGradeInputs] = useState({});  // { submissionKey: score }
    const [gradingSaving, setGradingSaving] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    const load = async () => {
        try {
            const [a, c] = await Promise.all([api.get('/api/teacher/assignments'), api.get('/api/teacher/courses')]);
            setAssignments(a.data); setCourses(c.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ title: '', course_id: courses[0]?.id || '', description: '', deadline: '' });
        setSelectedFile(null);
        setModal(true);
    };
    const openEdit = (a) => {
        setEditing(a);
        setForm({ title: a.title, course_id: a.course_id, description: a.description || '', deadline: a.deadline || '' });
        setModal(true);
    };

    const save = async () => {
        if (!form.title || !form.course_id) return setMsg({ text: 'Title and course required', type: 'error' });
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/api/teacher/assignments/${editing.id}`, form);
            } else {
                const fd = new FormData();
                fd.append('title', form.title);
                fd.append('course_id', form.course_id);
                fd.append('description', form.description);
                fd.append('deadline', form.deadline);
                if (selectedFile) fd.append('file', selectedFile);
                
                await api.post('/api/teacher/assignments', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setModal(false); 
            setSelectedFile(null);
            setMsg({ text: editing ? 'Updated' : 'Assignment created', type: 'success' }); 
            load();
        } catch (e) { setMsg({ text: e.response?.data?.message || 'Error', type: 'error' }); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        try { await api.delete(`/api/teacher/assignments/${id}`); setMsg({ text: 'Deleted', type: 'success' }); load(); }
        catch { setMsg({ text: 'Delete failed', type: 'error' }); }
        setDeleteConfirm(null);
    };

    const gradeKey = (aid, sid) => `${aid}_${sid}`;

    const saveGrade = async (aid, studentId) => {
        const key = gradeKey(aid, studentId);
        const score = gradeInputs[key];
        if (score === undefined || score === '') return;
        setGradingSaving(p => ({ ...p, [key]: true }));
        try {
            await api.post(`/api/teacher/assignments/${aid}/grade`, { student_id: studentId, score: parseFloat(score) });
            setMsg({ text: `Grade saved: ${score}/100`, type: 'success' });
            load();
        } catch { setMsg({ text: 'Failed to save grade', type: 'error' }); }
        finally { setGradingSaving(p => ({ ...p, [key]: false })); }
    };

    const isOverdue = (d) => d && new Date(d) < new Date();
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline';

    return (
        <div className="page-content animate-fade">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Assignments</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{assignments.length} assignments across your courses</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={16} /> New Assignment</button>
            </div>

            {msg.text && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
            ) : assignments.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><MdAssignment size={20} /></div><div className="empty-title">No assignments yet</div></div>
            ) : assignments.map(a => (
                <div key={a.id} className="stat-card" style={{
                    marginBottom: 12, padding: 0,
                    borderLeft: isOverdue(a.deadline) ? '3px solid var(--danger)' : '3px solid var(--primary)'
                }}>
                    {/* Row header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
                        onClick={() => setExpanded(p => ({ ...p, [a.id]: !p[a.id] }))}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</span>
                                <span className="badge badge-primary">{a.code}</span>
                                {isOverdue(a.deadline) && <span className="badge badge-danger">Overdue</span>}
                                <span className="badge badge-neutral">{a.submission_count} submitted</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {a.course_name} · Due: {formatDate(a.deadline)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {a.file_name && (
                                <a 
                                    href={`${API_BASE}${a.file_path}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    onClick={e => e.stopPropagation()}
                                    title={`Attachment: ${a.file_name}`}
                                    style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                                >
                                    <MdAttachFile size={16} />
                                </a>
                            )}
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={e => { e.stopPropagation(); openEdit(a); }}><MdEdit size={14} /></button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={e => { e.stopPropagation(); setDeleteConfirm(a.id); }}><MdDelete size={14} /></button>
                            {expanded[a.id] ? <MdExpandLess size={18} color="var(--text-muted)" /> : <MdExpandMore size={18} color="var(--text-muted)" />}
                        </div>
                    </div>

                    {/* Expanded: submissions */}
                    {expanded[a.id] && (
                        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                            {a.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '12px 0' }}>{a.description}</p>}
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                Submissions ({a.submissions?.length || 0})
                            </div>
                            {!a.submissions?.length ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No submissions yet</div>
                            ) : a.submissions.map(s => {
                                const key = gradeKey(a.id, s.student_id);
                                const currentScore = gradeInputs[key] !== undefined ? gradeInputs[key] : (s.score != null ? String(s.score) : '');
                                return (
                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div className="avatar avatar-sm" style={{ background: '#DAFF96', color: 'black' }}>{s.student_name[0]}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.student_name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : ''}
                                            </div>
                                            {s.content && (
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 420, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {s.content}
                                                </div>
                                            )}
                                            {s.file_name && (
                                                <a
                                                    href={`${API_BASE}/api/uploads/${s.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        fontSize: 11, color: 'var(--primary)', marginTop: 4,
                                                        textDecoration: 'none', fontWeight: 600,
                                                        background: 'var(--bg-elevated)', padding: '3px 8px',
                                                        borderRadius: 'var(--r-sm)', border: '1px solid var(--border)'
                                                    }}
                                                >
                                                    <MdDownload size={12} /> {s.file_name}
                                                </a>
                                            )}
                                        </div>

                                        {/* Inline grade input */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <input
                                                type="number"
                                                min={0} max={100} step={0.5}
                                                placeholder="—"
                                                value={currentScore}
                                                onChange={e => setGradeInputs(p => ({ ...p, [key]: e.target.value }))}
                                                style={{
                                                    width: 70, textAlign: 'right',
                                                    background: 'var(--bg-elevated)', border: '1px solid var(--border-md)',
                                                    borderRadius: 'var(--r-sm)', color: 'var(--text-primary)',
                                                    padding: '5px 8px', fontSize: 13, fontWeight: 600
                                                }}
                                            />
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</span>
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon"
                                                title="Save grade"
                                                disabled={gradingSaving[key]}
                                                onClick={() => saveGrade(a.id, s.student_id)}
                                                style={{ color: 'var(--primary)' }}
                                            >
                                                {gradingSaving[key] ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <MdGrade size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* Add/Edit modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{editing ? 'Edit' : 'New'} Assignment</span>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" /></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Course *</label>
                                    <select className="form-select" value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}>
                                        <option value="">— Course —</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Deadline</label><input type="date" className="form-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Instructions…" /></div>
                            {!editing && (
                                <div className="form-group">
                                    <label className="form-label">Attach File (Optional)</label>
                                    <input 
                                        type="file" 
                                        className="form-input" 
                                        onChange={e => setSelectedFile(e.target.files[0])}
                                        style={{ padding: '4px 8px' }}
                                    />
                                    {selectedFile && <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 4 }}>Selected: {selectedFile.name}</div>}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <><div className="spinner" />Saving…</> : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="confirm-overlay"><div className="confirm-box">
                    <div className="confirm-icon" style={{ background: 'var(--danger-bg)' }}><MdDelete size={22} color="var(--danger)" /></div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Delete Assignment?</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>All student submissions will also be deleted.</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={() => remove(deleteConfirm)}>Delete</button>
                    </div>
                </div></div>
            )}
        </div>
    );
};

export default TeacherAssignments;
