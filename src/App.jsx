import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { SocketProvider } from './context/SocketContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admissions from './pages/Admissions';
import Students from './pages/Students';
import Academics from './pages/Academics';
import Teachers from './pages/Teachers';
import Hods from './pages/Hods';
import Roles from './pages/Roles';
import Employees from './pages/Employees';
import Fees from './pages/Fees';
import Library from './pages/Library';
import Hostel from './pages/Hostel';
import Reports from './pages/Reports';
import Notice from './pages/Notice';
import Complaints from './pages/Complaints';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Assignments from './pages/Assignments';
import StudyMaterials from './pages/StudyMaterials';

// Admissions Pages
import AdmissionsDashboard from './pages/admissions/Dashboard';
import Applications from './pages/admissions/Applications';
import ApprovedApplications from './pages/admissions/ApprovedApplications';
import RejectedApplications from './pages/admissions/RejectedApplications';
import NewAdmission from './pages/admissions/NewAdmission';
import PublicAdmissionForm from './pages/admissions/PublicAdmissionForm';
import AdmissionReports from './pages/admissions/AdmissionReports';


// Library Pages
import LibraryDashboard from './pages/library/Dashboard';
import LibraryBooks from './pages/library/Books';
import LibraryIssueReturn from './pages/library/IssueReturn';
import LibraryFines from './pages/library/Fines';
import LibraryLostDamaged from './pages/library/LostDamaged';
import LibraryReports from './pages/library/Reports';

// Hostel Warden Pages
import HostelWardenDashboard from './pages/hostel-warden/Dashboard';
import HostelWardenRooms from './pages/hostel-warden/Rooms';
import HostelWardenAllotment from './pages/hostel-warden/Allotment';
import HostelWardenCheckInOut from './pages/hostel-warden/CheckInOut';
import HostelWardenLeaveOuting from './pages/hostel-warden/LeaveOuting';
import HostelWardenVisitors from './pages/hostel-warden/Visitors';
import HostelWardenComplaints from './pages/hostel-warden/Complaints';
import HostelWardenIncidents from './pages/hostel-warden/Incidents';
import HostelWardenInventory from './pages/hostel-warden/Inventory';
import HostelWardenNotices from './pages/hostel-warden/Notices';
import HostelWardenReports from './pages/hostel-warden/Reports';

// Mess Manager Pages
import MessDashboard from './pages/mess/Dashboard';
import MessMealMenu from './pages/mess/MealMenu';
import MessStudents from './pages/mess/MessStudents';
import MessStockInventory from './pages/mess/StockInventory';
import MessDailyConsumption from './pages/mess/DailyConsumption';
import MessPurchaseRequests from './pages/mess/PurchaseRequests';
import MessComplaints from './pages/mess/Complaints';
import MessReports from './pages/mess/Reports';

// Lab Assistant Pages
import LabDashboard from './pages/lab/Dashboard';
import LabUnits from './pages/lab/Labs';
import LabEquipment from './pages/lab/Equipment';
import LabPracticalSchedule from './pages/lab/PracticalSchedule';
import LabIssueReturn from './pages/lab/IssueReturn';
import LabConsumableStock from './pages/lab/ConsumableStock';
import LabMaintenance from './pages/lab/Maintenance';
import LabDamageLost from './pages/lab/DamageLost';
import LabSafetyChecklist from './pages/lab/SafetyChecklist';
import LabReports from './pages/lab/Reports';

// Workshop Instructor Pages
import WorkshopDashboard from './pages/workshop/Dashboard';
import WorkshopSchedule from './pages/workshop/Schedule';
import WorkshopBatches from './pages/workshop/Batches';
import WorkshopJobs from './pages/workshop/Jobs';
import WorkshopMachines from './pages/workshop/Machines';
import WorkshopToolIssueReturn from './pages/workshop/ToolIssueReturn';
import WorkshopConsumableStock from './pages/workshop/ConsumableStock';
import WorkshopMaintenance from './pages/workshop/Maintenance';
import WorkshopSafetyChecklist from './pages/workshop/SafetyChecklist';
import WorkshopReports from './pages/workshop/Reports';

// Placement Officer Pages
import PlacementDashboard from './pages/placement/Dashboard';
import PlacementStudentProfiles from './pages/placement/StudentProfiles';
import PlacementCompanies from './pages/placement/Companies';
import PlacementJobOpportunities from './pages/placement/JobOpportunities';
import PlacementDrives from './pages/placement/PlacementDrives';
import PlacementEligibilityShortlisting from './pages/placement/EligibilityShortlisting';
import PlacementApplications from './pages/placement/Applications';
import PlacementInterviews from './pages/placement/Interviews';
import PlacementSelectionsOffers from './pages/placement/SelectionsOffers';
import PlacementInternships from './pages/placement/Internships';
import PlacementReports from './pages/placement/Reports';


// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import ReceptionistVisitors from './pages/receptionist/Visitors';
import ReceptionistCalls from './pages/receptionist/Calls';
import ReceptionistAppointments from './pages/receptionist/Appointments';
import ReceptionistHelpDesk from './pages/receptionist/HelpDesk';
import ReceptionistGatePass from './pages/receptionist/GatePass';
import ReceptionistCourier from './pages/receptionist/Courier';
import ReceptionistReports from './pages/receptionist/Reports';

// Security / Gate Operator Pages
import SecurityDashboard from './pages/security/Dashboard';
import SecurityStudentMovement from './pages/security/StudentMovement';
import SecurityVisitors from './pages/security/Visitors';
import SecurityGatePass from './pages/security/GatePass';
import SecurityVehicles from './pages/security/Vehicles';
import SecurityHostelMovement from './pages/security/HostelMovement';
import SecurityIncidents from './pages/security/Incidents';
import SecurityReports from './pages/security/Reports';

// Student Portal Pages
import StudentDashboard from './pages/student-portal/Dashboard';
import StudentProfile from './pages/student-portal/Profile';
import StudentAssignments from './pages/student-portal/Assignments';
import StudentStudyMaterials from './pages/student-portal/StudyMaterials';
import StudentHostel from './pages/student-portal/Hostel';
import StudentPlacement from './pages/student-portal/Placement';
import StudentComplaints from './pages/student-portal/Complaints';
import StudentNotices from './pages/student-portal/Notices';
import ScanAttendance from './pages/student-portal/ScanAttendance';

// Teacher Portal Pages
import TeacherDashboard from './pages/teacher-portal/Dashboard';
import MyClasses from './pages/teacher-portal/MyClasses';
import TeacherStudents from './pages/teacher-portal/Students';
import TeacherAttendance from './pages/teacher-portal/Attendance';
import TeacherNotices from './pages/teacher-portal/Notices';
import TeacherStudyMaterials from './pages/teacher-portal/StudyMaterials';
import TeacherAssignments from './pages/teacher-portal/Assignments';
import TeacherComplaints from './pages/teacher-portal/Complaints';
import PremiumLockScreen from './components/PremiumLockScreen';
import { isModuleUnlocked } from './utils/moduleAccess';

// Dynamic Premium Route Guard based on College License
const PremiumGuard = ({ moduleKey, moduleName, children }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('college_modules_updated', handleUpdate);
    return () => window.removeEventListener('college_modules_updated', handleUpdate);
  }, []);

  if (isModuleUnlocked(moduleKey)) {
    return children;
  }
  return <PremiumLockScreen moduleName={moduleName} moduleKey={moduleKey} />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Login - outside Layout (no sidebar/header) */}
        <Route path="/login" element={<Login />} />
        
        {/* Public Routes */}
        <Route path="/public/admission/:collegeId" element={<PublicAdmissionForm />} />

        {/* Protected Routes - inside Layout */}
        <Route path="/*" element={
          <PrivateRoute>
            <SocketProvider>
              <Layout>
                <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* ── CORE ERP FEATURES (100% UNLOCKED & ACTIVE) ──────── */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admissions" element={<Admissions />} />
                <Route path="/students" element={<Students />} />
                <Route path="/academics" element={<Academics />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/hod" element={<Hods />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/fees" element={<Fees />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/study-materials" element={<StudyMaterials />} />

                {/* Admissions Specific Routes (Core) */}
                <Route path="/admissions/dashboard" element={<AdmissionsDashboard />} />
                <Route path="/admissions/applications" element={<Applications />} />
                <Route path="/admissions/approved" element={<ApprovedApplications />} />
                <Route path="/admissions/rejected" element={<RejectedApplications />} />
                <Route path="/admissions/new" element={<NewAdmission />} />
                <Route path="/admissions/reports" element={<AdmissionReports />} />

                {/* ── PREMIUM CAMPUS FEATURES (DYNAMICALLY LICENSED BY COLLEGE) ────── */}
                
                {/* Library Pages */}
                <Route path="/library" element={<PremiumGuard moduleKey="library" moduleName="Library Management"><Library /></PremiumGuard>} />
                <Route path="/library/dashboard" element={<PremiumGuard moduleKey="library" moduleName="Library Dashboard"><LibraryDashboard /></PremiumGuard>} />
                <Route path="/library/books" element={<PremiumGuard moduleKey="library" moduleName="Library Books Catalog"><LibraryBooks /></PremiumGuard>} />
                <Route path="/library/issue-return" element={<PremiumGuard moduleKey="library" moduleName="Issue & Return Desk"><LibraryIssueReturn /></PremiumGuard>} />
                <Route path="/library/fines" element={<PremiumGuard moduleKey="library" moduleName="Library Penalties & Fines"><LibraryFines /></PremiumGuard>} />
                <Route path="/library/lost-damaged" element={<PremiumGuard moduleKey="library" moduleName="Lost & Damaged Books"><LibraryLostDamaged /></PremiumGuard>} />
                <Route path="/library/reports" element={<PremiumGuard moduleKey="library" moduleName="Library Analytics Reports"><LibraryReports /></PremiumGuard>} />

                {/* Hostel Pages */}
                <Route path="/hostel" element={<PremiumGuard moduleKey="hostel" moduleName="Hostel Management"><Hostel /></PremiumGuard>} />
                <Route path="/hostel-warden/dashboard" element={<PremiumGuard moduleKey="hostel" moduleName="Hostel Dashboard"><HostelWardenDashboard /></PremiumGuard>} />
                <Route path="/hostel-warden/rooms" element={<PremiumGuard moduleKey="hostel" moduleName="Rooms & Beds Management"><HostelWardenRooms /></PremiumGuard>} />
                <Route path="/hostel-warden/allotment" element={<PremiumGuard moduleKey="hostel" moduleName="Student Allotment"><HostelWardenAllotment /></PremiumGuard>} />
                <Route path="/hostel-warden/check-in-out" element={<PremiumGuard moduleKey="hostel" moduleName="Student In / Out Management"><HostelWardenCheckInOut /></PremiumGuard>} />
                <Route path="/hostel-warden/leave-outing" element={<PremiumGuard moduleKey="hostel" moduleName="Leave & Outing Management"><HostelWardenLeaveOuting /></PremiumGuard>} />
                <Route path="/hostel-warden/visitors" element={<PremiumGuard moduleKey="security" moduleName="Visitor Management"><HostelWardenVisitors /></PremiumGuard>} />
                <Route path="/hostel-warden/complaints" element={<PremiumGuard moduleKey="complaints" moduleName="Hostel Complaints"><HostelWardenComplaints /></PremiumGuard>} />
                <Route path="/hostel-warden/incidents" element={<PremiumGuard moduleKey="hostel" moduleName="Discipline & Incident Tracking"><HostelWardenIncidents /></PremiumGuard>} />
                <Route path="/hostel-warden/inventory" element={<PremiumGuard moduleKey="hostel" moduleName="Hostel Assets & Inventory"><HostelWardenInventory /></PremiumGuard>} />
                <Route path="/hostel-warden/notices" element={<PremiumGuard moduleKey="hostel" moduleName="Hostel Notice Board"><HostelWardenNotices /></PremiumGuard>} />
                <Route path="/hostel-warden/reports" element={<PremiumGuard moduleKey="hostel" moduleName="Hostel Analytics Reports"><HostelWardenReports /></PremiumGuard>} />

                {/* Mess Pages */}
                <Route path="/mess/dashboard" element={<PremiumGuard moduleKey="mess" moduleName="Mess Dashboard"><MessDashboard /></PremiumGuard>} />
                <Route path="/mess/menu" element={<PremiumGuard moduleKey="mess" moduleName="Mess Meal Menu"><MessMealMenu /></PremiumGuard>} />
                <Route path="/mess/students" element={<PremiumGuard moduleKey="mess" moduleName="Mess Enrolled Students"><MessStudents /></PremiumGuard>} />
                <Route path="/mess/stock" element={<PremiumGuard moduleKey="mess" moduleName="Mess Stock & Inventory"><MessStockInventory /></PremiumGuard>} />
                <Route path="/mess/consumption" element={<PremiumGuard moduleKey="mess" moduleName="Daily Food Consumption"><MessDailyConsumption /></PremiumGuard>} />
                <Route path="/mess/purchases" element={<PremiumGuard moduleKey="mess" moduleName="Mess Purchase Requests"><MessPurchaseRequests /></PremiumGuard>} />
                <Route path="/mess/complaints" element={<PremiumGuard moduleKey="mess" moduleName="Mess Food Complaints"><MessComplaints /></PremiumGuard>} />
                <Route path="/mess/reports" element={<PremiumGuard moduleKey="mess" moduleName="Mess Analytics Reports"><MessReports /></PremiumGuard>} />

                {/* Complaint & Discipline */}
                <Route path="/complaints" element={<PremiumGuard moduleKey="complaints" moduleName="Complaint & Discipline Management"><Complaints /></PremiumGuard>} />

                {/* Additional Campus Management Modules */}
                <Route path="/lab/*" element={<PremiumGuard moduleKey="all" moduleName="Lab Management"><LabDashboard /></PremiumGuard>} />
                <Route path="/workshop/*" element={<PremiumGuard moduleKey="all" moduleName="Workshop Management"><WorkshopDashboard /></PremiumGuard>} />
                <Route path="/placement/*" element={<PremiumGuard moduleKey="all" moduleName="Placement Officer Portal"><PlacementDashboard /></PremiumGuard>} />
                <Route path="/receptionist/*" element={<PremiumGuard moduleKey="all" moduleName="Receptionist & Front Desk"><ReceptionistDashboard /></PremiumGuard>} />
                <Route path="/security/*" element={<PremiumGuard moduleKey="security" moduleName="Campus Security & Gatepass"><SecurityDashboard /></PremiumGuard>} />

                {/* Student Portal Specific Routes */}
                <Route path="/student-portal/attendance/scan" element={<ScanAttendance />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student-portal/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student-portal/profile" element={<StudentProfile />} />
                <Route path="/student/assignments" element={<StudentAssignments />} />
                <Route path="/student-portal/assignments" element={<StudentAssignments />} />
                <Route path="/student/materials" element={<StudentStudyMaterials />} />
                <Route path="/student-portal/materials" element={<StudentStudyMaterials />} />
                <Route path="/student/hostel" element={<StudentHostel />} />
                <Route path="/student-portal/hostel" element={<StudentHostel />} />
                <Route path="/student/placement" element={<StudentPlacement />} />
                <Route path="/student-portal/placement" element={<StudentPlacement />} />
                <Route path="/student/complaints" element={<StudentComplaints />} />
                <Route path="/student-portal/complaints" element={<StudentComplaints />} />
                <Route path="/student/notices" element={<StudentNotices />} />
                <Route path="/student-portal/notices" element={<StudentNotices />} />

                {/* Teacher Portal Specific Routes */}
                <Route path="/teacher-portal/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher-portal/my-classes" element={<MyClasses />} />
                <Route path="/teacher-portal/students" element={<TeacherStudents />} />
                <Route path="/teacher-portal/attendance" element={<TeacherAttendance />} />
                <Route path="/teacher-portal/notices" element={<TeacherNotices />} />
                <Route path="/teacher-portal/study-materials" element={<TeacherStudyMaterials />} />
                <Route path="/teacher-portal/assignments" element={<TeacherAssignments />} />
                <Route path="/teacher-portal/complaints" element={<TeacherComplaints />} />
              </Routes>
            </Layout>
            </SocketProvider>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
