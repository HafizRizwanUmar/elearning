import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdSave, MdInfo } from 'react-icons/md';

const SEMESTERS = ['Spring 2026', 'Fall 2025', 'Spring 2025'];

const ScoreBar = ({ value, max = 100, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 5, background: 'var(--bg-elevated)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', background: color, borderRadius: 9999, transition: 'width 0.4s' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28 }}>{value ?? '—'}</span>
    </div>
);

const TeacherGrades = () => {
    const { api } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [selCourse, setSelCourse] = useState('');
    const [semester, setSemester] = useState(SEMESTERS[0]);
    const [records, setRecords] = useState([]);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/api/teacher/courses').then(r => {
            setCourses(r.data);
            if (r.data.length > 0) setSelCourse(String(r.data[0].id));
        }).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selCourse) return;
        setLoading(true);
        api.get('/api/teacher/grades', { params: { course_id: selCourse, semester } })
            .then(r => setRecords(r.data.map(s => ({
                ...s,
                exam_score: s.exam_score === '' || s.exam_score === null ? '' : String(s.exam_score)
            }))))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selCourse, semester]);

    const setExamScore = (i, val) => {
        const v = val === '' ? '' : String(Math.min(100, Math.max(0, Number(val))));
        setRecords(prev => { const n = [...prev]; n[i] = { ...n[i], exam_score: val === '' ? '' : v }; return n; });
    };

    const letterGrade = (s) => {
        if (s === '' || s === null || s === undefined) return '—';
        const n = parseFloat(s);
        if (n >= 95) return 'A+'; if (n >= 90) return 'A'; if (n >= 85) return 'B+';
        if (n >= 80) return 'B'; if (n >= 75) return 'C+'; if (n >= 70) return 'C';
        if (n >= 60) return 'D'; return 'F';
    };

    const gradeColor = (s) => {
        if (s === '' || s == null) return 'var(--text-muted)';
        const n = parseFloat(s);
        if (n >= 80) return '#86EFAC';
        if (n >= 60) return '#FFE5C6';
        return '#FCA5A5';
    };

    const computeComposite = (r) => {
        const exam = r.exam_score !== '' && r.exam_score != null ? parseFloat(r.exam_score) : null;
        if (exam === null) return r.composite ?? null;
        const att = parseFloat(r.attendance_pct) || 0;
        const asgn = parseFloat(r.assignment_avg) || 0;
        return Math.round((att * 0.10 + asgn * 0.40 + exam * 0.50) * 10) / 10;
    };

    const save = async () => {
        setSaving(true);
        try {
            await api.post('/api/teacher/grades', {
                course_id: selCourse, semester,
                records: records.map(r => ({
                    student_id: r.student_id,
                    exam_score: r.exam_score === '' ? null : parseFloat(r.exam_score)
                }))
            });
            setMsg({ text: 'Grades saved!', type: 'success' });
            // Reload to get updated composites
            api.get('/api/teacher/grades', { params: { course_id: selCourse, semester } })
                .then(res => setRecords(res.data.map(s => ({
                    ...s,
                    exam_score: s.exam_score === '' || s.exam_score === null ? '' : String(s.exam_score)
                }))));
        } catch { setMsg({ text: 'Failed to save grades', type: 'error' }); }
        finally { setSaving(false); }
    };

    const gradedRecords = records.filter(r => r.exam_score !== '');
    const avgComposite = gradedRecords.length
        ? gradedRecords.reduce((sum, r) => sum + (computeComposite(r) ?? 0), 0) / gradedRecords.length
        : null;

    return (
        <div className="page-content animate-fade">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Grade Entry</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        Enter exam scores — composite is calculated automatically
                    </p>
                </div>
                <button className="btn btn-primary" onClick={save} disabled={saving || records.length === 0}>
                    {saving ? <><div className="spinner" />Saving…</> : <><MdSave size={16} />Save Grades</>}
                </button>
            </div>

            {msg.text && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

            {/* Weight info banner */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', marginBottom: 16,
                border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)'
            }}>
                <MdInfo size={15} color="var(--primary)" />
                <span><b style={{ color: 'var(--text-primary)' }}>Grade Formula:</b> Attendance (10%) + Assignments (40%) + Exam (50%)</span>
            </div>

            {/* Filters */}
            <div className="search-bar" style={{ marginBottom: 20 }}>
                <select className="form-select" style={{ maxWidth: 260 }} value={selCourse} onChange={e => setSelCourse(e.target.value)}>
                    <option value="">— Course —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
                <select className="form-select" style={{ maxWidth: 180 }} value={semester} onChange={e => setSemester(e.target.value)}>
                    {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                </select>
                {avgComposite !== null && (
                    <span className="badge badge-success">Class Avg: {avgComposite.toFixed(1)}</span>
                )}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>ID</th>
                                <th title="Attendance rate × 10">Attend. (10%)</th>
                                <th title="Average of graded assignments">Assignments (40%)</th>
                                <th title="Enter exam score 0–100">Exam Score (50%)</th>
                                <th>Composite</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r, i) => {
                                const composite = computeComposite(r);
                                const gl = letterGrade(composite);
                                const col = gradeColor(composite);
                                return (
                                    <tr key={r.student_id}>
                                        <td style={{ color: 'var(--text-muted)', width: 36 }}>{i + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar avatar-sm" style={{ background: '#DAFF96', color: 'black' }}>{r.name[0]}</div>
                                                <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-neutral">{r.sid || '—'}</span></td>

                                        {/* Attendance % */}
                                        <td style={{ minWidth: 120 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: r.attendance_pct >= 80 ? '#86EFAC' : r.attendance_pct >= 60 ? '#FFE5C6' : '#FCA5A5', marginBottom: 2 }}>
                                                {r.attendance_pct ?? 0}%
                                            </div>
                                            <ScoreBar value={r.attendance_pct ?? 0} color="#818cf8" />
                                        </td>

                                        {/* Assignment avg */}
                                        <td style={{ minWidth: 130 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: r.assignment_avg != null ? gradeColor(r.assignment_avg) : 'var(--text-muted)', marginBottom: 2 }}>
                                                {r.assignment_avg != null ? `${r.assignment_avg}/100` : '—'}
                                            </div>
                                            {r.assignment_avg != null && <ScoreBar value={r.assignment_avg} color="#f59e0b" />}
                                        </td>

                                        {/* Exam score input */}
                                        <td style={{ width: 130 }}>
                                            <input
                                                type="number"
                                                className="form-input"
                                                min={0} max={100} step={0.5}
                                                value={r.exam_score}
                                                onChange={e => setExamScore(i, e.target.value)}
                                                placeholder="—"
                                                style={{ width: 100, textAlign: 'right' }}
                                            />
                                        </td>

                                        {/* Composite */}
                                        <td style={{ minWidth: 110 }}>
                                            {composite != null ? (
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: col, marginBottom: 2 }}>
                                                        {composite}/100
                                                    </div>
                                                    <ScoreBar value={composite} color={col} />
                                                </div>
                                            ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                                        </td>

                                        {/* Grade letter */}
                                        <td>
                                            <span className="badge" style={{
                                                background: composite != null ? col + '22' : 'var(--bg-elevated)',
                                                color: composite != null ? col : 'var(--text-muted)',
                                                border: `1px solid ${composite != null ? col + '44' : 'var(--border)'}`,
                                                fontSize: 13, fontWeight: 700
                                            }}>{gl}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherGrades;
