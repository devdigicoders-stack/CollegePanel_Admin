import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admissions from './pages/Admissions';
import Students from './pages/Students';
import Academics from './pages/Academics';
import Teachers from './pages/Teachers';
import Hods from './pages/Hods';
import Roles from './pages/Roles';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Examinations from './pages/Examinations';
import Fees from './pages/Fees';
import Library from './pages/Library';
import Hostel from './pages/Hostel';
import Reports from './pages/Reports';
import Notice from './pages/Notice';
import Complaints from './pages/Complaints';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import LeaveRequests from './pages/LeaveRequests';
import LessonPlans from './pages/LessonPlans';
import InternalMarks from './pages/InternalMarks';
import FacultyAttendance from './pages/FacultyAttendance';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import Meetings from './pages/Meetings';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Login - outside Layout (no sidebar/header) */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - inside Layout */}
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admissions" element={<Admissions />} />
                <Route path="/students" element={<Students />} />
                <Route path="/academics" element={<Academics />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/hod" element={<Hods />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/exams" element={<Examinations />} />
                <Route path="/fees" element={<Fees />} />
                <Route path="/library" element={<Library />} />
                <Route path="/hostel" element={<Hostel />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/leave-requests" element={<LeaveRequests />} />
                <Route path="/lesson-plans" element={<LessonPlans />} />
                <Route path="/internal-marks" element={<InternalMarks />} />
                <Route path="/faculty-attendance" element={<FacultyAttendance />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/meetings" element={<Meetings />} />
                {/* Add more routes here as needed */}
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
