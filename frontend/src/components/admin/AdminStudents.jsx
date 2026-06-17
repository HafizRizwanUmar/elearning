import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPerson, MdClose, MdEmail, MdPhone, MdBadge, MdSchool, MdBusiness } from 'react-icons/md';

const MAJORS = [
    'Computer Science', 'Software Engineering', 'Information Technology',
    'Mathematics', 'Physics', 'Chemistry', 'English Literature',
    'Business Administration', 'Electrical Engineering',
    'Mechanical Engineering', 'Civil Engineering', 'Psychology', 'Economics',
];

const MAJOR_COLORS = {
    'Computer Science': '#6366F1', 'Software Engineering': '#8B5CF6',
    'Information Technology': '#3B82F6', 'Mathematics': '#F59E0B',
    'Physics': '#EF4444', 'Chemistry': '#10B981', 'English Literature': '#EC4899',
    'Business Administration': '#F97316', 'Electrical Engineering': '#06B6D4',
    'Mechanical Engineering': '#84CC16', 'Civil Engineering': '#A78BFA',
    'Psychology': '#F43F5E', 'Economics': '#14B8A6',
};

const getAvatarColor = (name) => {
    const colors = ['#6366F1','#8B5CF6','#3B82F6','#10B981','#F59E0B','#EC4899','#06B6D4','#F97316'];
    let h = 0; for (let c of (name||'?')) h = (h * 31 + c.charCodeAt(0)) % colors.length;
    return colors[h];
};

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

    const openAdd = () => {
        const nextId = `S${String(students.length + 1).padStart(3, '0')}`;
        setEditing(null);
        setForm({ name: '', email: '', password: '', department: '', phone: '', major: '', student_id: nextId });
        setMsg({ text: '', type: '' }); setModal(true);
    };
    const openEdit = (s) => {
        setEditing(s);
        setForm({ name: s.name, email: s.email, password: '', department: s.department || '', phone: s.phone || '', major: s.major || '', student_id: s.student_id || '' });
        setMsg({ text: '', type: '' }); setModal(true);
    };

    const save = async () => {
        // Validate BEFORE setting saving state
        if (!form.name || !form.email) return setMsg({ text: 'Name and email are required.', type: 'error' });
        if (!editing && !form.password) return setMsg({ text: 'Password is required for new students.', type: 'error' });
        setSaving(true);
        try {
            if (editing) await api.put(`/api/admin/students/${editing.id}`, form);
            else await api.post('/api/admin/students', form);
            setModal(false);
            setMsg({ text: editing ? 'Student updated successfully.' : 'Student added successfully.', type: 'success' });
            load();
        } catch (e) {
            setMsg({ text: e.response?.data?.message || 'Error saving student.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        try { await api.delete(`/api/admin/students/${id}`); setMsg({ text: 'Student deleted.', type: 'success' }); load(); }
        catch { setMsg({ text: 'Delete failed.', type: 'error' }); }
        setDeleteConfirm(null);
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.student_id || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-content animate-fade">
            {/* ── Page Header ── */}
            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg,#10B981,#06B6D4)' }}>
                        <MdPerson size={22} color="white" />
                    </div>
                    <div>
                        <h1 className="admin-page-title">Students</h1>
                        <p className="admin-page-sub">
                            <span className="admin-count-badge" style={{ background: '#D1FAE5', color: '#059669' }}>{students.length}</span> registered students
                        </p>
                    </div>
                </div>
                <button className="admin-add-btn" style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }} onClick={openAdd}>
                    <MdAdd size={18} /> Add Student
                </button>
            </div>

            {/* ── Alert ── */}
            {msg.text && (
                <div className={`admin-alert admin-alert-${msg.type}`}>
                    <span>{msg.text}</span>
                    <button className="admin-alert-close" onClick={() => setMsg({ text: '', type: '' })}><MdClose size={14}/></button>
                </div>
            )}

            {/* ── Search ── */}
            <div className="admin-search-row">
                <div className="admin-search-box">
                    <MdSearch size={16} className="admin-search-icon" />
                    <input
                        className="admin-search-input"
                        placeholder="Search by name, email, or student ID…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button className="admin-search-clear" onClick={() => setSearch('')}><MdClose size={14}/></button>}
                </div>
                <span className="admin-result-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* ── Table ── */}
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>ID</th>
                            <th>Major</th>
                            <th>Department</th>
                            <th>Phone</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                                    <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981' }} />
                                </div>
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6}>
                                <div className="admin-empty-state">
                                    <div className="admin-empty-icon" style={{ background: 'linear-gradient(135deg,#10B981,#06B6D4)' }}>
                                        <MdPerson size={28} color="white" />
                                    </div>
                                    <div className="admin-empty-title">No students found</div>
                                    <div className="admin-empty-sub">{search ? 'Try a different search term' : 'Click "Add Student" to enroll your first student'}</div>
                                    {!search && <button className="admin-add-btn" style={{ marginTop: 16, background: 'linear-gradient(135deg,#10B981,#059669)' }} onClick={openAdd}><MdAdd size={16}/> Add First Student</button>}
                                </div>
                            </td></tr>
                        ) : filtered.map(s => {
                            const majorColor = MAJOR_COLORS[s.major] || '#6366F1';
                            const avatarBg = getAvatarColor(s.name);
                            return (
                                <tr key={s.id} className="admin-table-row">
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="admin-avatar" style={{ background: avatarBg }}>
                                                {s.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="admin-name">{s.name}</div>
                                                <div className="admin-email">{s.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="admin-id-badge">{s.student_id || '—'}</span></td>
                                    <td>
                                        {s.major ? (
                                            <span className="admin-dept-chip" style={{ background: majorColor + '18', color: majorColor, borderColor: majorColor + '40' }}>
                                                {s.major}
                                            </span>
                                        ) : <span className="admin-muted">—</span>}
                                    </td>
                                    <td className="admin-muted">{s.department || '—'}</td>
                                    <td className="admin-muted">{s.phone || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button className="admin-action-btn admin-action-edit" onClick={() => openEdit(s)} title="Edit">
                                                <MdEdit size={15} />
                                            </button>
                                            <button className="admin-action-btn admin-action-delete" onClick={() => setDeleteConfirm(s.id)} title="Delete">
                                                <MdDelete size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Add/Edit Modal ── */}
            {modal && (
                <div className="admin-modal-overlay" onClick={() => setModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10B981,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MdPerson size={18} color="white" />
                                </div>
                                <div>
                                    <div className="admin-modal-title">{editing ? 'Edit Student' : 'Add New Student'}</div>
                                    <div className="admin-modal-sub">{editing ? `Editing ${editing.name}` : 'Create a new student account'}</div>
                                </div>
                            </div>
                            <button className="admin-modal-close" onClick={() => setModal(false)}><MdClose size={16}/></button>
                        </div>

                        {msg.text && (
                            <div className={`admin-alert admin-alert-${msg.type}`} style={{ margin: '0 20px', marginTop: 12 }}>
                                <span>{msg.text}</span>
                            </div>
                        )}

                        <div className="admin-modal-body">
                            <div className="admin-form-section-label">Basic Information</div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdPerson size={12}/> Full Name <span className="admin-required">*</span></label>
                                    <input className="admin-form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jane Smith" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdEmail size={12}/> Email Address <span className="admin-required">*</span></label>
                                    <input className="admin-form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@university.edu" />
                                </div>
                            </div>

                            {!editing && (
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Password <span className="admin-required">*</span></label>
                                    <input className="admin-form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" />
                                </div>
                            )}

                            <div className="admin-form-divider" />
                            <div className="admin-form-section-label">Academic Details</div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdBadge size={12}/> Student ID <span className="admin-auto-label">(auto-assigned)</span></label>
                                    <input className="admin-form-input admin-form-input-readonly" value={form.student_id} readOnly />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdPhone size={12}/> Phone Number</label>
                                    <input className="admin-form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdSchool size={12}/> Major</label>
                                    <input className="admin-form-input" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} placeholder="e.g. Computer Science" list="majors-list" />
                                    <datalist id="majors-list">{MAJORS.map(m => <option key={m} value={m} />)}</datalist>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdBusiness size={12}/> Department</label>
                                    <input className="admin-form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. CS" />
                                </div>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <button className="admin-cancel-btn" onClick={() => setModal(false)}>Cancel</button>
                            <button className="admin-save-btn" style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }} onClick={save} disabled={saving}>
                                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }}/> Saving…</> : (editing ? 'Save Changes' : 'Add Student')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ── */}
            {deleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="admin-confirm-box" onClick={e => e.stopPropagation()}>
                        <div className="admin-confirm-icon" style={{ background: '#FEF2F2' }}>
                            <MdDelete size={26} color="#EF4444" />
                        </div>
                        <div className="admin-confirm-title">Delete Student?</div>
                        <div className="admin-confirm-sub">This will permanently remove the student and all their records. This action cannot be undone.</div>
                        <div className="admin-confirm-actions">
                            <button className="admin-cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="admin-delete-btn" onClick={() => remove(deleteConfirm)}>
                                <MdDelete size={15}/> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
