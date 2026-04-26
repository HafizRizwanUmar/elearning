import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAssignment, MdSend, MdAttachFile, MdDownload, MdClose, MdCheckCircle } from 'react-icons/md';

const API_BASE = 'http://localhost:5000';

const StudentAssignments = () => {
    const { api } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState({});
    const [content, setContent] = useState({});
    const [files, setFiles] = useState({});
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [expanded, setExpanded] = useState({});
    const fileRefs = useRef({});

    const load = () => {
        api.get('/api/student/assignments')
            .then(r => { setAssignments(r.data); setLoading(false); })
            .catch(console.error);
    };
    useEffect(() => { load(); }, []);

    const submit = async (aid) => {
        if (!content[aid]?.trim() && !files[aid]) return;
        setSubmitting(p => ({ ...p, [aid]: true }));
        try {
            const fd = new FormData();
            fd.append('content', content[aid] || '');
            if (files[aid]) fd.append('file', files[aid]);

            await api.post(`/api/student/assignments/${aid}/submit`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg({ text: 'Assignment submitted successfully!', type: 'success' });
            setFiles(p => { const n = { ...p }; delete n[aid]; return n; });
            setContent(p => { const n = { ...p }; delete n[aid]; return n; });
            load();
        } catch { setMsg({ text: 'Submission failed', type: 'error' }); }
        finally { setSubmitting(p => ({ ...p, [aid]: false })); }
    };

    const isOverdue = (d) => d && new Date(d) < new Date();
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline';
    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (loading) return (
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
    );

    const pending = assignments.filter(a => !a.submission_id);
    const submitted = assignments.filter(a => a.submission_id);

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Assignments</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {pending.length} pending · {submitted.length} submitted
                </p>
            </div>

            {msg.text && (
                <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>
                    {msg.text}
                </div>
            )}

            {assignments.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon"><MdAssignment size={20} /></div>
                    <div className="empty-title">No assignments yet</div>
                </div>
            )}

            {assignments.map(a => {
                const isSubmitted = !!a.submission_id;
                const overdue = isOverdue(a.deadline) && !isSubmitted;
                const hasFile = files[a.id];
                const canSubmit = !!(content[a.id]?.trim() || hasFile);

                return (
                    <div key={a.id} className="stat-card" style={{
                        marginBottom: 12, padding: 0,
                        borderLeft: isSubmitted ? '3px solid #86EFAC' : overdue ? '3px solid var(--danger)' : '3px solid var(--primary)'
                    }}>
                        {/* Header */}
                        <div style={{ padding: '14px 16px', cursor: 'pointer' }}
                            onClick={() => setExpanded(p => ({ ...p, [a.id]: !p[a.id] }))}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</span>
                                        <span className="badge badge-primary">{a.code}</span>
                                        {isSubmitted && <span className="badge badge-success">Submitted</span>}
                                        {overdue && <span className="badge badge-danger">Overdue</span>}
                                        {!isSubmitted && !overdue && <span className="badge badge-warning">Pending</span>}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {a.course_name} · Due: {formatDate(a.deadline)}
                                        {a.submission_score != null && ` · Score: ${a.submission_score}/100`}
                                    </div>
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{expanded[a.id] ? '▲' : '▼'}</span>
                            </div>
                        </div>

                        {/* Expanded body */}
                        {expanded[a.id] && (
                            <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                                {a.description && (
                                    </p>
                                )}

                                {a.file_name && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                            Teacher's Attachment
                                        </div>
                                        <a
                                            href={`${API_BASE}${a.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '8px 12px', borderRadius: 'var(--r-md)',
                                                background: 'var(--primary-bg)', border: '1px solid var(--primary-border)',
                                                fontSize: 12, color: 'var(--primary)', fontWeight: 600,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <MdAttachFile size={14} /> {a.file_name}
                                        </a>
                                    </div>
                                )}

                                {isSubmitted ? (
                                    /* ── Already submitted view ── */
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                                            Your Submission
                                        </div>
                                        {a.submission_content && (
                                            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-md)', padding: '12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                                                {a.submission_content}
                                            </div>
                                        )}
                                        {a.submission_file_name && (
                                            <a
                                                href={`${API_BASE}/api/uploads/${a.submission_file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    padding: '7px 14px', borderRadius: 'var(--r-md)',
                                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                                    fontSize: 12, color: 'var(--primary)', fontWeight: 600,
                                                    textDecoration: 'none', cursor: 'pointer'
                                                }}
                                            >
                                                <MdDownload size={14} /> {a.submission_file_name}
                                            </a>
                                        )}
                                        <div style={{ marginTop: 10, fontSize: 12, color: a.submission_score != null ? '#86EFAC' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {a.submission_score != null
                                                ? <><MdCheckCircle size={14} /> Graded: {a.submission_score}/100</>
                                                : '⏳ Awaiting grade'}
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Submit form ── */
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                                            Your Submission
                                        </div>
                                        <textarea
                                            className="form-textarea"
                                            style={{ marginBottom: 10 }}
                                            placeholder="Write your answer or paste submission text here…"
                                            value={content[a.id] || ''}
                                            onChange={e => setContent(p => ({ ...p, [a.id]: e.target.value }))}
                                        />

                                        {/* File upload area */}
                                        <div
                                            onClick={() => fileRefs.current[a.id]?.click()}
                                            style={{
                                                border: '1.5px dashed var(--border-md)',
                                                borderRadius: 'var(--r-md)',
                                                padding: '14px 16px',
                                                marginBottom: 12,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                transition: 'var(--t-fast)',
                                                background: hasFile ? 'rgba(134,239,172,0.05)' : 'transparent',
                                                borderColor: hasFile ? '#86EFAC66' : 'var(--border-md)'
                                            }}
                                        >
                                            <MdAttachFile size={18} color={hasFile ? '#86EFAC' : 'var(--text-muted)'} />
                                            <div style={{ flex: 1 }}>
                                                {hasFile ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#86EFAC' }}>{hasFile.name}</div>
                                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatSize(hasFile.size)}</div>
                                                        </div>
                                                        <button
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                                                            onClick={e => { e.stopPropagation(); setFiles(p => { const n = { ...p }; delete n[a.id]; return n; }); }}
                                                        >
                                                            <MdClose size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Attach a file <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>(PDF, Word, images, zip — max 20 MB)</span></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            ref={el => fileRefs.current[a.id] = el}
                                            type="file"
                                            style={{ display: 'none' }}
                                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.pptx,.xlsx"
                                            onChange={e => {
                                                const f = e.target.files[0];
                                                if (f) setFiles(p => ({ ...p, [a.id]: f }));
                                            }}
                                        />

                                        <button
                                            className="btn btn-primary"
                                            onClick={() => submit(a.id)}
                                            disabled={submitting[a.id] || !canSubmit}
                                        >
                                            {submitting[a.id]
                                                ? <><div className="spinner" />Submitting…</>
                                                : <><MdSend size={14} />Submit Assignment</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StudentAssignments;
