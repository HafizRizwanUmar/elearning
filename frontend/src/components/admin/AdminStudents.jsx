import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPerson } from 'react-icons/md';

const AdminStudents = () => {
    const { api } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '', major: '', student_id: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try {
            const { data } = await api.get('/api/admin/students', { q: search });
            setStudents(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [search]);

    const openAdd = () => { setEditing(null); setForm({ name: '', email: '', password: '', department: '', phone: '', major: '', student_id: '' }); setModal(true); };
    const openEdit = (s) => { setEditing(s); setForm({ name: s.name, email: s.email, password: '', department: s.department || '', phone: s.phone || '', major: s.major || '', student_id: s.student_id || '' }); setModal(true); };

    const save = async () => {
        if (!form.name || !form.email) return setMsg({ text: 'Name and email required', type: 'error' });
        setSaving(true);
        try {
            if (editing) await api.put(`/api/admin/students/${editing.id}`, form);
            else { if (!form.password) return setMsg({ text: 'Password required', type: 'error' }); await api.post('/api/admin/students', form); }
            setModal(false); setMsg({ text: editing ? 'Student updated' : 'Student added', type: 'success' });
            load();
        } catch (e) { setMsg({ text: e.response?.data?.message || 'Error saving', type: 'error' }); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        try { await api.delete(`/api/admin/students/${id}`); setMsg({ text: 'Student deleted', type: 'success' }); load(); }
        catch { setMsg({ text: 'Delete failed', type: 'error' }); }
        setDeleteConfirm(null);
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.student_id || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-content animate-fade">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Students</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{students.length} registered students</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={16} /> Add Student</button>
            </div>

            {msg.text && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

            <div className="search-bar">
                <div className="search-input-wrap">
                    <span className="search-icon"><MdSearch /></span>
                    <input className="form-input" placeholder="Search by name, email, or ID…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr><th>Student</th><th>ID</th><th>Major</th><th>Department</th><th>Phone</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon"><MdPerson size={20} /></div><div className="empty-title">No students found</div></div></td></tr>
                        ) : filtered.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="avatar avatar-sm" style={{ background: '#DAFF96', color: 'black' }}>{s.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{s.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-neutral">{s.student_id || '—'}</span></td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.major || '—'}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.department || '—'}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.phone || '—'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(s)} title="Edit"><MdEdit size={14} /></button>
                                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm(s.id)} title="Delete"><MdDelete size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{editing ? 'Edit Student' : 'Add Student'}</span>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Smith" /></div>
                                <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@school.edu" /></div>
                            </div>
                            {!editing && <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>}
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} placeholder="S001" /></div>
                                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 0000000" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Major</label><input className="form-input" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} placeholder="Computer Science" /></div>
                                <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="CS" /></div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <><div className="spinner" /> Saving…</> : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="confirm-overlay">
                    <div className="confirm-box">
                        <div className="confirm-icon" style={{ background: 'var(--danger-bg)' }}><MdDelete size={22} color="var(--danger)" /></div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Delete Student?</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>This will permanently remove the student and all their records.</div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => remove(deleteConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
