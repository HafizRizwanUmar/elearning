import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdSchool } from 'react-icons/md';

const DEPARTMENTS = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'Business Administration',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Education',
    'Psychology',
];

const CUSTOM = '__custom__';

const AdminTeachers = () => {
    const { api } = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', department: DEPARTMENTS[0], phone: '', teacher_id: '' });
    const [deptMode, setDeptMode] = useState('select'); // 'select' | 'custom'
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const setDept = (val) => {
        if (val === CUSTOM) { setDeptMode('custom'); setForm(f => ({ ...f, department: '' })); }
        else { setDeptMode('select'); setForm(f => ({ ...f, department: val })); }
    };

    const load = async () => {
        try { const { data } = await api.get('/api/admin/teachers', { q: search }); setTeachers(data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [search]);

    const openAdd = () => {
        const nextId = `T${String(teachers.length + 1).padStart(3, '0')}`;
        setEditing(null);
        setDeptMode('select');
        setForm({ name: '', email: '', password: '', department: DEPARTMENTS[0], phone: '', teacher_id: nextId });
        setModal(true);
    };
    const openEdit = (t) => {
        const isKnown = DEPARTMENTS.includes(t.department);
        setDeptMode(isKnown ? 'select' : 'custom');
        setEditing(t);
        setForm({ name: t.name, email: t.email, password: '', department: t.department || DEPARTMENTS[0], phone: t.phone || '', teacher_id: t.teacher_id || '' });
        setModal(true);
    };

    const save = async () => {
        if (!form.name || !form.email) return setMsg({ text: 'Name and email required', type: 'error' });
        setSaving(true);
        try {
            if (editing) await api.put(`/api/admin/teachers/${editing.id}`, form);
            else { if (!form.password) return setMsg({ text: 'Password required', type: 'error' }); await api.post('/api/admin/teachers', form); }
            setModal(false); setMsg({ text: editing ? 'Teacher updated' : 'Teacher added', type: 'success' }); load();
        } catch (e) { setMsg({ text: e.response?.data?.message || 'Error saving', type: 'error' }); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        try { await api.delete(`/api/admin/teachers/${id}`); setMsg({ text: 'Teacher deleted', type: 'success' }); load(); }
        catch { setMsg({ text: 'Delete failed', type: 'error' }); }
        setDeleteConfirm(null);
    };

    const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="page-content animate-fade">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Teachers</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{teachers.length} faculty members</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={16} /> Add Teacher</button>
            </div>

            {msg.text && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

            <div className="search-bar">
                <div className="search-input-wrap">
                    <span className="search-icon"><MdSearch /></span>
                    <input className="form-input" placeholder="Search teachers…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>Teacher</th><th>ID</th><th>Department</th><th>Phone</th><th>Courses</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? (<tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>)
                        : filtered.length === 0 ? (<tr><td colSpan={6}><div className="empty-state"><div className="empty-icon"><MdSchool size={20} /></div><div className="empty-title">No teachers found</div></div></td></tr>)
                        : filtered.map(t => (
                            <tr key={t.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="avatar avatar-sm" style={{ background: '#A7D8DE', color: 'black' }}>{t.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{t.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-neutral">{t.teacher_id || '—'}</span></td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.department || '—'}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.phone || '—'}</td>
                                <td><span className="badge badge-info">{t.course_count} courses</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(t)}><MdEdit size={14} /></button>
                                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm(t.id)}><MdDelete size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><span className="modal-title">{editing ? 'Edit Teacher' : 'Add Teacher'}</span><button className="modal-close" onClick={() => setModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                            </div>
                            {!editing && <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Teacher ID <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(auto-assigned)</span></label>
                                    <input className="form-input" value={form.teacher_id} readOnly
                                        style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-elevated)' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-select" value={deptMode === 'custom' ? CUSTOM : form.department} onChange={e => setDept(e.target.value)}>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        <option value={CUSTOM}>Other (custom)…</option>
                                    </select>
                                    {deptMode === 'custom' && (
                                        <input className="form-input" style={{ marginTop: 8 }}
                                            placeholder="Type department name…"
                                            value={form.department}
                                            onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                                    )}
                                </div>
                            </div>
                            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <><div className="spinner" /> Saving…</> : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="confirm-overlay"><div className="confirm-box">
                    <div className="confirm-icon" style={{ background: 'var(--danger-bg)' }}><MdDelete size={22} color="var(--danger)" /></div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Delete Teacher?</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Their courses will be unassigned but not deleted.</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={() => remove(deleteConfirm)}>Delete</button>
                    </div>
                </div></div>
            )}
        </div>
    );
};

export default AdminTeachers;
