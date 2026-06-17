import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdSchool, MdClose, MdPerson, MdEmail, MdPhone, MdBusiness, MdBadge } from 'react-icons/md';

const DEPARTMENTS = [
    'Computer Science', 'Software Engineering', 'Information Technology',
    'Mathematics', 'Physics', 'Chemistry', 'English',
    'Business Administration', 'Electrical Engineering',
    'Mechanical Engineering', 'Civil Engineering', 'Education', 'Psychology',
];
const CUSTOM = '__custom__';

const DEPT_COLORS = {
    'Computer Science': '#6366F1', 'Software Engineering': '#8B5CF6',
    'Information Technology': '#3B82F6', 'Mathematics': '#F59E0B',
    'Physics': '#EF4444', 'Chemistry': '#10B981', 'English': '#EC4899',
    'Business Administration': '#F97316', 'Electrical Engineering': '#06B6D4',
    'Mechanical Engineering': '#84CC16', 'Civil Engineering': '#A78BFA',
    'Education': '#14B8A6', 'Psychology': '#F43F5E',
};

const getAvatarColor = (name) => {
    const colors = ['#6366F1','#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4'];
    let h = 0; for (let c of (name||'?')) h = (h * 31 + c.charCodeAt(0)) % colors.length;
    return colors[h];
};

const AdminTeachers = () => {
    const { api } = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', department: DEPARTMENTS[0], phone: '', teacher_id: '' });
    const [deptMode, setDeptMode] = useState('select');
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
        setEditing(null); setDeptMode('select');
        setForm({ name: '', email: '', password: '', department: DEPARTMENTS[0], phone: '', teacher_id: nextId });
        setMsg({ text: '', type: '' }); setModal(true);
    };
    const openEdit = (t) => {
        const isKnown = DEPARTMENTS.includes(t.department);
        setDeptMode(isKnown ? 'select' : 'custom');
        setEditing(t);
        setForm({ name: t.name, email: t.email, password: '', department: t.department || DEPARTMENTS[0], phone: t.phone || '', teacher_id: t.teacher_id || '' });
        setMsg({ text: '', type: '' }); setModal(true);
    };

    const save = async () => {
        // Validate BEFORE setting saving state
        if (!form.name || !form.email) return setMsg({ text: 'Name and email are required.', type: 'error' });
        if (!editing && !form.password) return setMsg({ text: 'Password is required for new teachers.', type: 'error' });
        setSaving(true);
        try {
            if (editing) await api.put(`/api/admin/teachers/${editing.id}`, form);
            else await api.post('/api/admin/teachers', form);
            setModal(false);
            setMsg({ text: editing ? 'Teacher updated successfully.' : 'Teacher added successfully.', type: 'success' });
            load();
        } catch (e) {
            setMsg({ text: e.response?.data?.message || 'Error saving teacher.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        try { await api.delete(`/api/admin/teachers/${id}`); setMsg({ text: 'Teacher deleted.', type: 'success' }); load(); }
        catch { setMsg({ text: 'Delete failed.', type: 'error' }); }
        setDeleteConfirm(null);
    };

    const filtered = teachers.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-content animate-fade">
            {/* ── Page Header ── */}
            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                        <MdSchool size={22} color="white" />
                    </div>
                    <div>
                        <h1 className="admin-page-title">Teachers</h1>
                        <p className="admin-page-sub">
                            <span className="admin-count-badge">{teachers.length}</span> faculty members registered
                        </p>
                    </div>
                </div>
                <button className="admin-add-btn" onClick={openAdd}>
                    <MdAdd size={18} /> Add Teacher
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
                        placeholder="Search teachers by name or email…"
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
                            <th>Faculty Member</th>
                            <th>ID</th>
                            <th>Department</th>
                            <th>Phone</th>
                            <th>Courses</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                                    <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366F1' }} />
                                </div>
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6}>
                                <div className="admin-empty-state">
                                    <div className="admin-empty-icon" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                                        <MdSchool size={28} color="white" />
                                    </div>
                                    <div className="admin-empty-title">No teachers found</div>
                                    <div className="admin-empty-sub">{search ? 'Try a different search term' : 'Click "Add Teacher" to get started'}</div>
                                    {!search && <button className="admin-add-btn" style={{ marginTop: 16 }} onClick={openAdd}><MdAdd size={16}/> Add First Teacher</button>}
                                </div>
                            </td></tr>
                        ) : filtered.map((t, idx) => {
                            const deptColor = DEPT_COLORS[t.department] || '#6366F1';
                            const avatarBg = getAvatarColor(t.name);
                            return (
                                <tr key={t.id} className="admin-table-row">
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="admin-avatar" style={{ background: avatarBg }}>
                                                {t.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="admin-name">{t.name}</div>
                                                <div className="admin-email">{t.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="admin-id-badge">{t.teacher_id || '—'}</span></td>
                                    <td>
                                        {t.department ? (
                                            <span className="admin-dept-chip" style={{ background: deptColor + '18', color: deptColor, borderColor: deptColor + '40' }}>
                                                {t.department}
                                            </span>
                                        ) : <span className="admin-muted">—</span>}
                                    </td>
                                    <td className="admin-muted">{t.phone || '—'}</td>
                                    <td>
                                        <span className="admin-courses-badge">{t.course_count} course{t.course_count !== 1 ? 's' : ''}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button className="admin-action-btn admin-action-edit" onClick={() => openEdit(t)} title="Edit">
                                                <MdEdit size={15} />
                                            </button>
                                            <button className="admin-action-btn admin-action-delete" onClick={() => setDeleteConfirm(t.id)} title="Delete">
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
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MdSchool size={18} color="white" />
                                </div>
                                <div>
                                    <div className="admin-modal-title">{editing ? 'Edit Teacher' : 'Add New Teacher'}</div>
                                    <div className="admin-modal-sub">{editing ? `Editing ${editing.name}` : 'Create a new faculty account'}</div>
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
                                    <input className="admin-form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. John Smith" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdEmail size={12}/> Email Address <span className="admin-required">*</span></label>
                                    <input className="admin-form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@university.edu" />
                                </div>
                            </div>

                            {!editing && (
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Password <span className="admin-required">*</span></label>
                                    <input className="admin-form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" />
                                </div>
                            )}

                            <div className="admin-form-divider" />
                            <div className="admin-form-section-label">Faculty Details</div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdBadge size={12}/> Teacher ID <span className="admin-auto-label">(auto-assigned)</span></label>
                                    <input className="admin-form-input admin-form-input-readonly" value={form.teacher_id} readOnly />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label"><MdPhone size={12}/> Phone Number</label>
                                    <input className="admin-form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label"><MdBusiness size={12}/> Department</label>
                                <select className="admin-form-select" value={deptMode === 'custom' ? CUSTOM : form.department} onChange={e => setDept(e.target.value)}>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    <option value={CUSTOM}>Other (custom)…</option>
                                </select>
                                {deptMode === 'custom' && (
                                    <input className="admin-form-input" style={{ marginTop: 8 }}
                                        placeholder="Type department name…"
                                        value={form.department}
                                        onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                                )}
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <button className="admin-cancel-btn" onClick={() => setModal(false)}>Cancel</button>
                            <button className="admin-save-btn" onClick={save} disabled={saving}>
                                {saving ? <><div className="spinner" style={{ width: 14, height: 14 }}/> Saving…</> : (editing ? 'Save Changes' : 'Add Teacher')}
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
                        <div className="admin-confirm-title">Delete Teacher?</div>
                        <div className="admin-confirm-sub">Their courses will be unassigned but not deleted. This action cannot be undone.</div>
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

export default AdminTeachers;
