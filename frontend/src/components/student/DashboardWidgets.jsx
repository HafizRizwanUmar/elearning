import React from 'react';
import { MdPlayArrow, MdStar, MdPeople, MdChevronRight, MdCheck } from 'react-icons/md';

export const ProgressCircle = ({ percentage }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="progress-circle">
            <svg width="60" height="60">
                <circle
                    stroke="#222"
                    strokeWidth="4"
                    fill="transparent"
                    r={radius}
                    cx="30"
                    cy="30"
                />
                <circle
                    stroke="#D1F55C"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="30"
                    cy="30"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <span style={{ position: 'absolute', fontSize: '12px', fontWeight: '700' }}>{percentage}%</span>
        </div>
    );
};

export const ContinueLearningCard = ({ course }) => {
    return (
        <div className="featured-card">
            <div className="featured-image-container" style={{ position: 'relative' }}>
                <img 
                    src={course.image || 'https://images.unsplash.com/photo-1586717791821-3f44a563cc4c?auto=format&fit=crop&q=80&w=320'} 
                    alt="Course" 
                    className="featured-image"
                />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '48px',
                    height: '48px',
                    background: 'rgba(209, 245, 92, 0.8)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black'
                }}>
                    <MdPlayArrow size={32} />
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                }}>
                    18 min
                </div>
            </div>

            <div className="featured-content">
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
                    {course.title || 'Start in Web Design: Lesson 6'}
                </h2>
                <p style={{ color: '#999', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                    Typography is the basis of the design of any web page or application screen. In this topic, we will consider the basic rules of working with text and apply them in our project.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button className="btn" style={{ 
                        background: '#D1F55C', 
                        color: 'black', 
                        borderRadius: '100px', 
                        padding: '12px 32px',
                        fontWeight: '700'
                    }}>
                        To the course
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#999' }}>Course completion</span>
                        <ProgressCircle percentage={25} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CourseCard = ({ course }) => {
    return (
        <div className="course-card">
            <div style={{ position: 'relative' }}>
                <img 
                    src={course.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=200'} 
                    alt={course.title} 
                    className="course-thumb"
                />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '32px',
                    height: '32px',
                    background: 'rgba(209, 245, 92, 0.8)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black'
                }}>
                    <MdPlayArrow size={20} />
                </div>
                <button style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'white'
                }}>
                    <div style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', padding: '4px' }}>
                        <MdStar size={16} />
                    </div>
                </button>
            </div>
            <div style={{ marginTop: '12px' }}>
                <span style={{ 
                    background: 'rgba(209, 245, 92, 0.15)', 
                    color: '#D1F55C', 
                    padding: '4px 12px', 
                    borderRadius: '100px', 
                    fontSize: '12px',
                    fontWeight: '600'
                }}>
                    Basic
                </span>
                <h3 style={{ fontSize: '16px', marginTop: '12px', marginBottom: '8px' }}>{course.title || 'Start in Web Design'}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#666', fontSize: '13px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdPeople size={16} />
                        <span>1435</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdStar size={16} color="#D1F55C" />
                        <span>4.9</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <img src="https://ui-avatars.com/api/?name=Esther+Howard&background=333&color=fff" style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="avatar" />
                    <span style={{ fontSize: '12px', color: '#999' }}>Esther Howard</span>
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: 'auto' }}>24 lessons | 12 hours</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', borderTop: '1px solid #222', paddingTop: '16px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>$25</span>
                    <button style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#999', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        View Details <MdChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ScheduleWidget = () => {
    const events = [
        { time: '10:00', label: 'Lecture: Typography', active: true },
        { time: '11:00', label: '' },
        { time: '12:00', label: 'Exam: Typography', active: false },
        { time: '13:00', label: '' },
        { time: '14:00', label: '' },
        { time: '15:00', label: '' },
        { time: '16:00', label: '', current: true },
    ];

    return (
        <div className="widget-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px' }}>Wednesday, 24 Aug</h3>
                <span style={{ color: '#666', fontSize: '13px' }}>All Events</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {events.map((event, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                        <span style={{ fontSize: '13px', color: '#666', width: '40px' }}>{event.time}</span>
                        <div style={{ flex: 1, height: '1px', background: '#222', alignSelf: 'center' }}></div>
                        {event.label && (
                            <div style={{
                                position: 'absolute',
                                left: '56px',
                                top: '-4px',
                                right: '0',
                                background: event.active ? '#D1F55C' : '#333',
                                color: event.active ? 'black' : 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                borderLeft: '4px solid rgba(0,0,0,0.2)'
                            }}>
                                {event.label}
                            </div>
                        )}
                        {event.current && (
                            <div style={{
                                position: 'absolute',
                                left: '56px',
                                top: '0px',
                                width: '4px',
                                height: '24px',
                                background: '#D1F55C',
                                borderRadius: '100px'
                            }}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TasksBoard = () => {
    return (
        <div className="widget-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px' }}>Tasks Board</h3>
                <span style={{ color: '#666', fontSize: '13px' }}>All Tasks</span>
            </div>
            
            <div className="task-item lime">
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Homework: Typography</div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>26 Aug</div>
                </div>
                <div style={{ width: '20px', height: '20px', border: '1.5px solid rgba(0,0,0,0.2)', borderRadius: '4px' }}></div>
            </div>

            <div className="task-item peach">
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Homework: Colors</div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>26 Aug</div>
                </div>
                <div style={{ width: '20px', height: '20px', border: '1.5px solid rgba(0,0,0,0.2)', borderRadius: '4px' }}></div>
            </div>

            <h3 style={{ fontSize: '18px', marginTop: '32px', marginBottom: '16px' }}>Completed</h3>
            
            <div className="task-item blue" style={{ background: '#BBE8F2' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Quiz: Typography</div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>26 Aug</div>
                </div>
                <div style={{ width: '20px', height: '18px', background: 'black', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MdCheck size={14} color="white" />
                </div>
            </div>
        </div>
    );
};
