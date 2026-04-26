import React, { useState, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';

// Public
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';

// Shared
import ProfilePage from './components/shared/ProfilePage';
import ChangePassword from './components/shared/ChangePassword';
import NotificationsPage from './components/shared/NotificationsPage';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';
import AdminStudents from './components/admin/AdminStudents';
import AdminTeachers from './components/admin/AdminTeachers';
import AdminCourses from './components/admin/AdminCourses';
import AdminReports from './components/admin/AdminReports';
import AdminRoles from './components/admin/AdminRoles';

// Teacher
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherStudents from './components/teacher/TeacherStudents';
import TeacherCourses from './components/teacher/TeacherCourses';
import TeacherAttendance from './components/teacher/TeacherAttendance';
import TeacherGrades from './components/teacher/TeacherGrades';
import TeacherAssignments from './components/teacher/TeacherAssignments';
import TeacherUpload from './components/teacher/TeacherUpload';
import TeacherAnnouncements from './components/teacher/TeacherAnnouncements';

// Student
import StudentDashboard from './components/student/StudentDashboard';
import StudentCourses from './components/student/StudentCourses';
import StudentSchedule from './components/student/StudentSchedule';
import StudentGrades from './components/student/StudentGrades';
import StudentAttendance from './components/student/StudentAttendance';
import StudentMaterials from './components/student/StudentMaterials';
import StudentAssignments from './components/student/StudentAssignments';
import StudentQuizzes from './components/student/StudentQuizzes';
import StudentNotices from './components/student/StudentNotices';

// Page titles map
const pageTitles = {
    dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers', courses: 'Courses',
    reports: 'Reports & Analytics', roles: 'User Roles', attendance: 'Attendance',
    grades: 'Grades', assignments: 'Assignments', upload: 'Upload Slides',
    quiz: 'Quiz Creator', announcements: 'Announcements', schedule: 'My Schedule',
    materials: 'Course Materials', notices: 'Notices', quizzes: 'Quizzes',
    profile: 'My Profile', password: 'Change Password', notifications: 'Notifications',
};

// Role portal wrapper
const Portal = ({ role, defaultPage, children }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState(defaultPage);

    if (!user) return <Navigate to="/login" />;
    if (user.role !== role) return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} />;

    const handleNavigate = (pageId, path) => {
        setActivePage(pageId);
        if (path) navigate(path);
        else {
            const rolePrefix = `/${user.role.toLowerCase()}`;
            if (pageId === 'profile') navigate(`${rolePrefix}/profile`);
            else if (pageId === 'password') navigate(`${rolePrefix}/password`);
            else if (pageId === 'notifications') navigate(`${rolePrefix}/notifications`);
        }
    };

    return (
        <Layout activePage={activePage} onNavigate={handleNavigate} title={pageTitles[activePage] || 'EduFlow'}>
            {React.cloneElement(children, { setActivePage })}
        </Layout>
    );
};

// Wrapper that auto-sets active page
const Page = ({ comp: Comp, pageId, setActivePage }) => {
    React.useEffect(() => { if (setActivePage) setActivePage(pageId); }, [pageId]);
    return <Comp />;
};

const App = () => {
    const { user } = useContext(AuthContext);

    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role.toLowerCase()}/dashboard`} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ── ADMIN ── */}
            <Route path="/admin/*" element={
                <Portal role="Admin" defaultPage="dashboard">
                    <Routes>
                        <Route path="dashboard" element={<Page comp={AdminDashboard} pageId="dashboard" />} />
                        <Route path="students" element={<Page comp={AdminStudents} pageId="students" />} />
                        <Route path="teachers" element={<Page comp={AdminTeachers} pageId="teachers" />} />
                        <Route path="courses" element={<Page comp={AdminCourses} pageId="courses" />} />
                        <Route path="reports" element={<Page comp={AdminReports} pageId="reports" />} />
                        <Route path="roles" element={<Page comp={AdminRoles} pageId="roles" />} />
                        <Route path="profile" element={<Page comp={ProfilePage} pageId="profile" />} />
                        <Route path="password" element={<Page comp={ChangePassword} pageId="password" />} />
                        <Route path="notifications" element={<Page comp={NotificationsPage} pageId="notifications" />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                    </Routes>
                </Portal>
            } />

            {/* ── TEACHER ── */}
            <Route path="/teacher/*" element={
                <Portal role="Teacher" defaultPage="dashboard">
                    <Routes>
                        <Route path="dashboard" element={<Page comp={TeacherDashboard} pageId="dashboard" />} />
                        <Route path="students" element={<Page comp={TeacherStudents} pageId="students" />} />
                        <Route path="courses" element={<Page comp={TeacherCourses} pageId="courses" />} />
                        <Route path="attendance" element={<Page comp={TeacherAttendance} pageId="attendance" />} />
                        <Route path="grades" element={<Page comp={TeacherGrades} pageId="grades" />} />
                        <Route path="assignments" element={<Page comp={TeacherAssignments} pageId="assignments" />} />
                        <Route path="upload" element={<Page comp={TeacherUpload} pageId="upload" />} />
                        <Route path="announcements" element={<Page comp={TeacherAnnouncements} pageId="announcements" />} />
                        <Route path="profile" element={<Page comp={ProfilePage} pageId="profile" />} />
                        <Route path="password" element={<Page comp={ChangePassword} pageId="password" />} />
                        <Route path="notifications" element={<Page comp={NotificationsPage} pageId="notifications" />} />
                        <Route path="*" element={<Navigate to="/teacher/dashboard" />} />
                    </Routes>
                </Portal>
            } />

            {/* ── STUDENT ── */}
            <Route path="/student/*" element={
                <Portal role="Student" defaultPage="dashboard">
                    <Routes>
                        <Route path="dashboard" element={<Page comp={StudentDashboard} pageId="dashboard" />} />
                        <Route path="courses" element={<Page comp={StudentCourses} pageId="courses" />} />
                        <Route path="schedule" element={<Page comp={StudentSchedule} pageId="schedule" />} />
                        <Route path="grades" element={<Page comp={StudentGrades} pageId="grades" />} />
                        <Route path="attendance" element={<Page comp={StudentAttendance} pageId="attendance" />} />
                        <Route path="materials" element={<Page comp={StudentMaterials} pageId="materials" />} />
                        <Route path="assignments" element={<Page comp={StudentAssignments} pageId="assignments" />} />
                        <Route path="quizzes" element={<Page comp={StudentQuizzes} pageId="quizzes" />} />
                        <Route path="notices" element={<Page comp={StudentNotices} pageId="notices" />} />
                        <Route path="profile" element={<Page comp={ProfilePage} pageId="profile" />} />
                        <Route path="password" element={<Page comp={ChangePassword} pageId="password" />} />
                        <Route path="notifications" element={<Page comp={NotificationsPage} pageId="notifications" />} />
                        <Route path="*" element={<Navigate to="/student/dashboard" />} />
                    </Routes>
                </Portal>
            } />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default App;
