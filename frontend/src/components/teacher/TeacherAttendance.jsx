import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdSave, MdEventAvailable } from 'react-icons/md';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late'];
const STATUS_COLORS = { Present: '#86EFAC', Absent: '#FCA5A5', Late: '#FFE5C6' };

const TeacherAttendance = () => {
    const { api } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [selCourse, setSelCourse] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState([]);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/api/teacher/courses').then(r => { setCourses(r.data); if (r.data.length > 0) setSelCourse(String(r.data[0].id)); }).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selCourse || !date) return;
        setLoading(true);
        api.get('/api/teacher/attendance', { course_id: selCourse, date })
            .then(r => { setRecords(r.data.map(s => ({ ...s, status: s.status || 'Present' }))); })
            .catch(console.error).finally(() => setLoading(false));
    }, [selCourse, date]);

    const toggle = (i) => setRecords(prev => {
        const next = [...prev];
        const idx = STATUS_OPTIONS.indexOf(next[i].status);
        next[i] = { ...next[i], status: STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length] };
        return next;
    });

    const setStatus = (i, s) => setRecords(prev => { const next = [...prev]; next[i] = { ...next[i], status: s }; return next; });

    const save = async () => {
        if (!selCourse || !date) return;
        setSaving(true);
        try {
            await api.post('/api/teacher/attendance', {
                course_id: selCourse, date,
                records: records.map(r => ({ student_id: r.student_id, status: r.status }))
            });
            setMsg({ text: 'Attendance saved successfully!', type: 'success' });
        } catch { setMsg({ text: 'Failed to save attendance', type: 'error' }); }
        finally { setSaving(false); }
    };

    const counts = records.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});

    return (
        <div className="page-content animate-fade">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Mark Attendance</h1>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>Click a status pill to cycle: Present → Absent → Late</p>
                </div>
                <button className="btn btn-primary" onClick={save} disabled={saving || records.length===0}>
                    {saving ? <><div className="spinner"/>Saving…</> : <><MdSave size={16}/>Save Attendance</>}
                </button>
            </div>

            {msg.text && <div className={`alert alert-${msg.type==='success'?'success':'error'}`} style={{ marginBottom:16 }}>{msg.text}</div>}

            <div className="search-bar" style={{ marginBottom:20 }}>
                <select className="form-select" style={{ maxWidth:260 }} value={selCourse} onChange={e => setSelCourse(e.target.value)}>
                    <option value="">— Select Course —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
                <input type="date" className="form-input" style={{ maxWidth:180 }} value={date} onChange={e => setDate(e.target.value)} />
                {records.length > 0 && (
                    <div style={{ display:'flex', gap:8 }}>
                        {Object.entries(counts).map(([s, n]) => (
                            <span key={s} className="badge" style={{ background:STATUS_COLORS[s]+'22', color:STATUS_COLORS[s], border:`1px solid ${STATUS_COLORS[s]}44` }}>{s}: {n}</span>
                        ))}
                    </div>
                )}
            </div>

            {!selCourse ? (
                <div className="empty-state"><div className="empty-icon"><MdEventAvailable size={20}/></div><div className="empty-title">Select a course to mark attendance</div></div>
            ) : loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner"/></div>
            ) : records.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><MdEventAvailable size={20}/></div><div className="empty-title">No students enrolled in this course</div></div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>#</th><th>Student</th><th>ID</th><th>Status</th><th>Quick Set</th></tr></thead>
                        <tbody>
                            {records.map((r, i) => (
                                <tr key={r.student_id}>
                                    <td style={{ color:'var(--text-muted)', width:40 }}>{i+1}</td>
                                    <td>
                                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                            <div className="avatar avatar-sm" style={{ background:'#DAFF96', color:'black' }}>{r.name[0]}</div>
                                            <span style={{ fontWeight:600, fontSize:13 }}>{r.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-neutral">{r.sid||'—'}</span></td>
                                    <td>
                                        <span className="badge" onClick={() => toggle(i)} style={{ background:STATUS_COLORS[r.status]+'22', color:STATUS_COLORS[r.status], border:`1px solid ${STATUS_COLORS[r.status]}44`, cursor:'pointer', fontSize:12, padding:'4px 12px' }}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display:'flex', gap:4 }}>
                                            {STATUS_OPTIONS.map(s => (
                                                <button key={s} className="btn btn-ghost btn-sm" onClick={() => setStatus(i,s)}
                                                    style={{ fontSize:11, color: r.status===s ? STATUS_COLORS[s] : 'var(--text-muted)', fontWeight: r.status===s ? 700 : 400 }}>
                                                    {s[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;
