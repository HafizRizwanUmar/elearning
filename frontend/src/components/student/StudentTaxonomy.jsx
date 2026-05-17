import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MdAttachFile, MdSend, MdDownload, MdClose, MdDescription } from 'react-icons/md';

const API_BASE = 'http://localhost:5000';

const StudentTaxonomy = () => {
    const { api } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [result, setResult] = useState(null);
    const fileRef = useRef(null);

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const submit = async () => {
        if (!file) return;
        setLoading(true);
        setMsg({ text: '', type: '' });
        setResult(null);

        try {
            const fd = new FormData();
            fd.append('file', file);

            const res = await api.post(`/api/student/taxonomy-explain`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setMsg({ text: res.data.message || 'Explanation generated successfully!', type: 'success' });
            setResult(res.data);
            setFile(null);
        } catch (err) {
            console.error(err);
            setMsg({ text: err.response?.data?.message || 'Failed to generate explanation.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content animate-fade">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Taxonomy Explainer</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Upload a document about taxonomy, and we'll generate an explained summary in a new PDF.
                </p>
            </div>

            {msg.text && (
                <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 16 }}>
                    {msg.text}
                </div>
            )}

            <div className="stat-card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    Upload Taxonomy PDF
                </div>
                
                <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: '2px dashed var(--border-md)',
                        borderRadius: 'var(--r-lg)',
                        padding: '40px 20px',
                        marginBottom: 16,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        transition: 'var(--t-fast)',
                        background: file ? 'var(--primary-muted)' : 'var(--bg-input)',
                        borderColor: file ? 'var(--primary)' : 'var(--border-md)'
                    }}
                >
                    <MdAttachFile size={32} color={file ? 'var(--primary)' : 'var(--text-muted)'} />
                    {file ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>{file.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatSize(file.size)}</div>
                            <button
                                style={{ 
                                    background: 'var(--danger-bg)', border: 'none', cursor: 'pointer', 
                                    color: 'var(--danger)', padding: '6px 12px', borderRadius: 'var(--r-sm)',
                                    marginTop: 12, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4
                                }}
                                onClick={e => { e.stopPropagation(); setFile(null); }}
                            >
                                <MdClose size={14} /> Remove File
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Click to browse or drag file here</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>(PDF only — max 20 MB)</div>
                        </div>
                    )}
                </div>
                
                <input
                    ref={fileRef}
                    type="file"
                    style={{ display: 'none' }}
                    accept=".pdf"
                    onChange={e => {
                        const f = e.target.files[0];
                        if (f) setFile(f);
                    }}
                />

                <button
                    className="btn btn-primary w-full"
                    style={{ padding: '12px', fontSize: 14 }}
                    onClick={submit}
                    disabled={loading || !file}
                >
                    {loading ? (
                        <><div className="spinner" /> Analyzing & Generating PDF...</>
                    ) : (
                        <><MdSend size={16} /> Generate Explanation</>
                    )}
                </button>
            </div>

            {result && (
                <div className="stat-card animate-fade" style={{ padding: 24, borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MdDescription size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Explanation Ready!</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>We successfully processed "{result.originalFile}"</div>
                        </div>
                    </div>
                    
                    <a
                        href={`${API_BASE}${result.explanationFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success"
                        style={{ display: 'inline-flex', padding: '10px 16px', fontSize: 14 }}
                    >
                        <MdDownload size={18} /> Download Generated PDF
                    </a>
                </div>
            )}
        </div>
    );
};

export default StudentTaxonomy;
