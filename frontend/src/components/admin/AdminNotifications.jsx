import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
    MdSend, MdNotifications, MdPeople, MdSchool, MdMenuBook,
    MdGroup, MdPerson, MdDelete, MdCircle, MdBarChart,
    MdCampaign, MdCheckCircle, MdExpandMore, MdExpandLess
} from 'react-icons/md';

/* ─── Config ────────────────────────────────────────────────────── */
const AUDIENCE_OPTIONS = [
    { id: 'all',        label: 'Everyone',            icon: MdPeople,    desc: 'All students and teachers',           color: '#4B6BFB' },
    { id: 'students',   label: 'All Students',         icon: MdGroup,     desc: 'Every student in the system',         color: '#10B981' },
    { id: 'teachers',   label: 'All Teachers',         icon: MdSchool,    desc: 'Every course instructor',             color: '#F59E0B' },
    { id: 'program',    label: 'By Program',           icon: MdMenuBook,  desc: 'Students enrolled in a program',      color: '#8B5CF6' },
    { id: 'course',     label: 'By Course',            icon: MdMenuBook,  desc: 'Students in a specific course',       color: '#EF4444' },
    { id: 'individual', label: 'Individual Student',   icon: MdPerson,    desc: 'Send to one specific student',        color: '#3B82F6' },
];

const NOTIF_KEY = 'classeta_admin_notifications';

const loadNotifications = () => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); }
    catch { return []; }
};

const saveNotification = (notif) => {
    const existing = loadNotifications();
    const updated = [notif, ...existing];
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    return updated;
};

/* ─── Component ─────────────────────────────────────────────────── */
const AdminNotifications = () => {
    const { user } = useContext(AuthContext);

    /* compose state */
    const [audience,      setAudience]      = useState('all');
    const [audienceDetail,setAudienceDetail]= useState('');
    const [title,         setTitle]         = useState('');
    const [message,       setMessage]       = useState('');
    const [sending,       setSending]       = useState(false);
    const [sent,          setSent]          = useState(false);
    const [error,         setError]         = useState('');

    /* history state */
    const [history, setHistory]   = useState([]);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => { setHistory(loadNotifications()); }, []);

    const needsDetail = ['program','course','individual'].includes(audience);
    const detailLabel  = audience === 'program' ? 'Program Name' : audience === 'course' ? 'Course Name/Code' : 'Student Name or Email';

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) { setError('Please fill in title and message.'); return; }
        if (needsDetail && !audienceDetail.trim()) { setError(`Please specify the ${detailLabel}.`); return; }
        setError('');
        setSending(true);

        await new Promise(r => setTimeout(r, 900));

        const notif = {
            id: Date.now(),
            title: title.trim(),
            message: message.trim(),
            audience,
            audienceDetail: audienceDetail.trim(),
            sentAt: new Date().toISOString(),
            sentBy: user?.name || 'Admin',
        };
        const updated = saveNotification(notif);
        setHistory(updated);
        setTitle('');
        setMessage('');
        setAudienceDetail('');
        setAudience('all');
        setSending(false);
        setSent(true);
        setTimeout(() => setSent(false), 3000);
    };

    const deleteNotif = (id) => {
        const updated = history.filter(n => n.id !== id);
        localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
        setHistory(updated);
    };

    const getAudienceInfo = (notif) => {
        const opt = AUDIENCE_OPTIONS.find(o => o.id === notif.audience);
        return opt ? { label: opt.label + (notif.audienceDetail ? ` → ${notif.audienceDetail}` : ''), color: opt.color, icon: opt.icon } : null;
    };

    const totalSent  = history.length;
    const thisWeek   = history.filter(n => new Date(n.sentAt) > new Date(Date.now() - 7*24*3600*1000)).length;

    return (
        <div className="page-content animate-fade">

            {/* ─── Header ─── */}
            <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Notification Center</h1>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Compose and send targeted notifications to your institution members.</p>
            </div>

            {/* ─── Stats row ─── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
                {[
                    { label:'Total Sent',  value: totalSent,  icon: MdCampaign,       color:'#4B6BFB' },
                    { label:'This Week',   value: thisWeek,   icon: MdBarChart,        color:'#10B981' },
                    { label:'Audiences',   value: 6,          icon: MdPeople,          color:'#8B5CF6' },
                ].map(s => (
                    <div key={s.label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px 18px', display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:40, height:40, borderRadius:'var(--r-md)', background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <s.icon size={20} color={s.color} />
                        </div>
                        <div>
                            <div style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)' }}>{s.value}</div>
                            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>

                {/* ─── Left: Compose ─── */}
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:24 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                        <div style={{ width:36, height:36, borderRadius:'var(--r-md)', background:'var(--primary-muted)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <MdCampaign size={18} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Compose Notification</div>
                            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Target specific audiences</div>
                        </div>
                    </div>

                    {error && <div className="alert alert-error" style={{ marginBottom:14, fontSize:13 }}>{error}</div>}
                    {sent  && <div className="alert alert-success" style={{ marginBottom:14, fontSize:13 }}><MdCheckCircle size={16} /> Notification sent successfully!</div>}

                    {/* Audience selector */}
                    <div style={{ marginBottom:16 }}>
                        <label style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                            Target Audience
                        </label>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                            {AUDIENCE_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                const isSel = audience === opt.id;
                                return (
                                    <button key={opt.id} onClick={() => { setAudience(opt.id); setAudienceDetail(''); }}
                                        style={{
                                            padding:'10px 12px', borderRadius:'var(--r-md)', border:`2px solid ${isSel ? opt.color : 'var(--border)'}`,
                                            background: isSel ? `${opt.color}14` : 'transparent', cursor:'pointer', transition:'var(--t-fast)',
                                            textAlign:'left', display:'flex', alignItems:'center', gap:8
                                        }}>
                                        <Icon size={16} color={isSel ? opt.color : 'var(--text-muted)'} />
                                        <div>
                                            <div style={{ fontSize:12, fontWeight:700, color: isSel ? opt.color : 'var(--text-secondary)' }}>{opt.label}</div>
                                            <div style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.3 }}>{opt.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detail field */}
                    {needsDetail && (
                        <div style={{ marginBottom:16 }}>
                            <label style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                                {detailLabel}
                            </label>
                            <input
                                className="form-input" type="text"
                                placeholder={`Enter ${detailLabel.toLowerCase()}…`}
                                value={audienceDetail}
                                onChange={e => setAudienceDetail(e.target.value)}
                                style={{ width:'100%' }}
                            />
                        </div>
                    )}

                    {/* Title */}
                    <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                            Notification Title
                        </label>
                        <input
                            className="form-input" type="text"
                            placeholder="e.g. Exam Schedule Released"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ width:'100%' }}
                            maxLength={100}
                        />
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom:18 }}>
                        <label style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                            Message
                        </label>
                        <textarea
                            className="form-input"
                            rows={4}
                            placeholder="Write your notification message here…"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            style={{ width:'100%', resize:'vertical', minHeight:100, fontFamily:'inherit', lineHeight:1.6 }}
                            maxLength={500}
                        />
                        <div style={{ textAlign:'right', fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{message.length}/500</div>
                    </div>

                    {/* Send btn */}
                    <button className="btn btn-primary w-full" style={{ padding:'12px', fontSize:14 }} onClick={handleSend} disabled={sending}>
                        {sending ? <><div className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Sending…</>
                                 : <><MdSend size={16} /> Send Notification</>}
                    </button>
                </div>

                {/* ─── Right: History ─── */}
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:24 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                        <div style={{ width:36, height:36, borderRadius:'var(--r-md)', background:'rgba(16,185,129,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <MdNotifications size={18} color="#10B981" />
                        </div>
                        <div>
                            <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Sent History</div>
                            <div style={{ fontSize:12, color:'var(--text-muted)' }}>{history.length} notifications sent</div>
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <div className="empty-state" style={{ padding:'40px 20px' }}>
                            <div className="empty-icon"><MdCampaign size={22} color="var(--text-muted)" /></div>
                            <div className="empty-title">No notifications yet</div>
                            <div className="empty-body">Sent notifications will appear here.</div>
                        </div>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:520, overflowY:'auto' }} className="thin-scroll">
                            {history.map(n => {
                                const info = getAudienceInfo(n);
                                const Icon = info ? info.icon : MdCampaign;
                                const isExp = expanded === n.id;
                                return (
                                    <div key={n.id} style={{ border:'1px solid var(--border)', borderRadius:'var(--r-md)', overflow:'hidden' }}>
                                        <div onClick={() => setExpanded(isExp ? null : n.id)}
                                            style={{ padding:'12px 14px', display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', background: isExp ? 'var(--bg-input)' : 'transparent', transition:'var(--t-fast)' }}>
                                            <div style={{ width:32, height:32, borderRadius:'var(--r-sm)', background: info ? `${info.color}18` : 'var(--bg-input)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <Icon size={15} color={info?.color || 'var(--text-muted)'} />
                                            </div>
                                            <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{n.title}</div>
                                                <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                                                    {info && (
                                                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background:`${info.color}18`, color:info.color, fontWeight:700 }}>{info.label}</span>
                                                    )}
                                                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{new Date(n.sentAt).toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' })}</span>
                                                </div>
                                            </div>
                                            <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                                                <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }} className="btn btn-ghost btn-sm btn-icon" style={{ color:'var(--danger)' }}>
                                                    <MdDelete size={14} />
                                                </button>
                                                {isExp ? <MdExpandLess size={16} color="var(--text-muted)" /> : <MdExpandMore size={16} color="var(--text-muted)" />}
                                            </div>
                                        </div>
                                        {isExp && (
                                            <div style={{ padding:'10px 14px 14px', background:'var(--bg-input)', borderTop:'1px solid var(--border)' }}>
                                                <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{n.message}</div>
                                                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:8 }}>
                                                    Sent by <strong>{n.sentBy}</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
