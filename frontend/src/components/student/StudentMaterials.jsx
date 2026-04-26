import React from 'react';
import { MdBook } from 'react-icons/md';

const StudentMaterials = () => (
    <div className="page-content animate-fade">
        <div style={{ marginBottom:24 }}>
            <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Course Materials</h1>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>Access lecture slides, documents and resources</p>
        </div>
        <div className="empty-state" style={{ padding:80 }}>
            <div className="empty-icon" style={{ width:64, height:64 }}><MdBook size={32} color="var(--text-muted)"/></div>
            <div className="empty-title">No Materials Uploaded</div>
            <div className="empty-body">Your teachers haven't uploaded any materials yet. Check back soon.</div>
        </div>
    </div>
);

export default StudentMaterials;
