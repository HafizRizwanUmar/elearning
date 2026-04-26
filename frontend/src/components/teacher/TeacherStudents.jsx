import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdSearch, MdPeople } from 'react-icons/md';

const TeacherStudents = () => {
    const { api } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selCourse, setSelCourse] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/api/teacher/students'), api.get('/api/teacher/courses')])
            .then(([s, c]) => { setStudents(s.data); setCourses(c.data); })
            .catch(console.error).finally(() => setLoading(false));
    }, []);

    const load = async (courseId) => {
        setLoading(true);
        setSelCourse(courseId);
        try { const { data } = await api.get('/api/teacher/students', courseId ? { course_id: courseId } : {}); setStudents(data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.student_id||'').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>My Students</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{students.length} students across your courses</p>
            </div>

            <div className="search-bar">
                <div className="search-input-wrap">
                    <span className="search-icon"><MdSearch /></span>
                    <input className="form-input" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" style={{ maxWidth: 220 }} value={selCourse} onChange={e => load(e.target.value)}>
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>Student</th><th>ID</th><th>Major</th><th>Phone</th></tr></thead>
                    <tbody>
                        {loading ? (<tr><td colSpan={4} style={{ textAlign:'center', padding:40 }}><div className="spinner" /></td></tr>)
                        : filtered.length === 0 ? (<tr><td colSpan={4}><div className="empty-state"><div className="empty-icon"><MdPeople size={20}/></div><div className="empty-title">No students found</div></div></td></tr>)
                        : filtered.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                        <div className="avatar avatar-sm" style={{ background:'#DAFF96', color:'black' }}>{s.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>{s.name}</div>
                                            <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-neutral">{s.student_id||'—'}</span></td>
                                <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{s.major||'—'}</td>
                                <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{s.phone||'—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherStudents;
