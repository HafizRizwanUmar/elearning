import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdCampaign } from 'react-icons/md';

const TeacherAnnouncements = () => {
    const { api } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title:'', content:'', course_id:'' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text:'', type:'' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        const [a, c] = await Promise.all([api.get('/api/teacher/announcements'), api.get('/api/teacher/courses')]);
        setAnnouncements(a.data); setCourses(c.data);
    };
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm({ title:'', content:'', course_id:'' }); setModal(true); };
    const openEdit = (a) => { setEditing(a); setForm({ title:a.title, content:a.content, course_id:a.course_id||'' }); setModal(true); };

    const save = async () => {
        if (!form.title || !form.content) return setMsg({ text:'Title and content required', type:'error' });
        setSaving(true);
        try {
            if (editing) await api.put(`/api/teacher/announcements/${editing.id}`, form);
            else await api.post('/api/teacher/announcements', form);
            setModal(false); setMsg({ text:'Saved', type:'success' }); load();
        } catch { setMsg({ text:'Error saving', type:'error' }); } finally { setSaving(false); }
    };

    const remove = async (id) => {
        await api.delete(`/api/teacher/announcements/${id}`);
        setMsg({ text:'Deleted', type:'success' }); load(); setDeleteConfirm(null);
    };

    return (
        <div className="page-content animate-fade">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Announcements</h1>
                    <p style={{ color:'var(--text-muted)', fontSize:13 }}>Post notices for your students</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><MdAdd size={16}/> New Announcement</button>
            </div>

            {msg.text && <div className={`alert alert-${msg.type==='success'?'success':'error'}`} style={{ marginBottom:16 }}>{msg.text}</div>}

            {announcements.length === 0 && <div className="empty-state"><div className="empty-icon"><MdCampaign size={20}/></div><div className="empty-title">No announcements yet. Post one!</div></div>}

            {announcements.map(a => (
                <div key={a.id} className="stat-card" style={{ marginBottom:12, padding:'16px 20px', borderLeft:'3px solid var(--info)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                                <MdCampaign size={16} color="var(--info-text)"/>
                                <span style={{ fontWeight:700, fontSize:14 }}>{a.title}</span>
                                {a.course_name && <span className="badge badge-info">{a.code}</span>}
                            </div>
                            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:8 }}>{a.content}</p>
                            <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</div>
                        </div>
                        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>openEdit(a)}><MdEdit size={14}/></button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={()=>setDeleteConfirm(a.id)}><MdDelete size={14}/></button>
                        </div>
                    </div>
                </div>
            ))}

            {modal && (
                <div className="modal-overlay" onClick={()=>setModal(false)}>
                    <div className="modal" onClick={e=>e.stopPropagation()}>
                        <div className="modal-header"><span className="modal-title">{editing?'Edit Announcement':'New Announcement'}</span><button className="modal-close" onClick={()=>setModal(false)}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Announcement title"/></div>
                            <div className="form-group"><label className="form-label">Course (leave blank for all)</label>
                                <select className="form-select" value={form.course_id} onChange={e=>setForm({...form,course_id:e.target.value})}>
                                    <option value="">All courses</option>
                                    {courses.map(c=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label className="form-label">Content *</label><textarea className="form-textarea" style={{ minHeight:120 }} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Announcement content…"/></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<><div className="spinner"/>Saving…</>:'Post'}</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="confirm-overlay"><div className="confirm-box">
                    <div className="confirm-icon" style={{ background:'var(--danger-bg)' }}><MdDelete size={22} color="var(--danger)"/></div>
                    <div style={{ fontWeight:700, marginBottom:6 }}>Delete Announcement?</div>
                    <div style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>This cannot be undone.</div>
                    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                        <button className="btn btn-ghost" onClick={()=>setDeleteConfirm(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={()=>remove(deleteConfirm)}>Delete</button>
                    </div>
                </div></div>
            )}
        </div>
    );
};

export default TeacherAnnouncements;
