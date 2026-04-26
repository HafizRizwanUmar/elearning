import React from 'react';
import { MdQuiz } from 'react-icons/md';

const StudentQuizzes = () => (
    <div className="page-content animate-fade">
        <div style={{ marginBottom:24 }}>
            <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', marginBottom:4 }}>Quizzes</h1>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>Online quizzes and tests</p>
        </div>
        <div className="empty-state" style={{ padding:80 }}>
            <div className="empty-icon" style={{ width:64, height:64 }}><MdQuiz size={32} color="var(--text-muted)"/></div>
            <div className="empty-title">No Quizzes Available</div>
            <div className="empty-body">No quizzes have been posted yet. Check back before your next exam.</div>
        </div>
    </div>
);

export default StudentQuizzes;
