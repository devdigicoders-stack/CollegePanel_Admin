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

// Admissions Pages
import AdmissionsDashboard from './pages/admissions/Dashboard';
import Enquiries from './pages/admissions/Enquiries';
import FollowUps from './pages/admissions/FollowUps';
import Applications from './pages/admissions/Applications';
import NewAdmission from './pages/admissions/NewAdmission';
import DocumentVerification from './pages/admissions/DocumentVerification';
import StudentRegistration from './pages/admissions/StudentRegistration';
import SeatManagement from './pages/admissions/SeatManagement';
import AdmissionApproval from './pages/admissions/AdmissionApproval';
import AdmissionCancellation from './pages/admissions/AdmissionCancellation';
import AdmissionReports from './pages/admissions/AdmissionReports';

// Financial Pages
import FeeStructure from './pages/financial/FeeStructure';
import StudentFees from './pages/financial/StudentFees';
import FeeCollection from './pages/financial/FeeCollection';
import PendingDues from './pages/financial/PendingDues';
import Installments from './pages/financial/Installments';
import Discounts from './pages/financial/Discounts';
import Scholarships from './pages/financial/Scholarships';
import Refunds from './pages/financial/Refunds';
import Expenses from './pages/financial/Expenses';
import Income from './pages/financial/Income';
import VendorPayments from './pages/financial/VendorPayments';
import Payroll from './pages/financial/Payroll';
import Receipts from './pages/financial/Receipts';
import CashBank from './pages/financial/CashBank';
import AccountLedger from './pages/financial/AccountLedger';
import FinancialReports from './pages/financial/FinancialReports';

// Library Pages
import LibraryDashboard from './pages/library/Dashboard';
import LibraryBooks from './pages/library/Books';
import LibraryMembers from './pages/library/Members';
import LibraryIssueReturn from './pages/library/IssueReturn';
import LibraryReservations from './pages/library/Reservations';
import LibraryFines from './pages/library/Fines';
import LibraryLostDamaged from './pages/library/LostDamaged';
import LibraryStock from './pages/library/StockVerification';
import LibraryReports from './pages/library/Reports';

// Hostel Warden Pages
import HostelWardenDashboard from './pages/hostel-warden/Dashboard';
import HostelWardenRooms from './pages/hostel-warden/Rooms';
import HostelWardenAllotment from './pages/hostel-warden/Allotment';
import HostelWardenCheckInOut from './pages/hostel-warden/CheckInOut';
import HostelWardenAttendance from './pages/hostel-warden/Attendance';
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
import MessMealAttendance from './pages/mess/MealAttendance';
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
import LabPracticalAttendance from './pages/lab/PracticalAttendance';
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
import WorkshopAttendance from './pages/workshop/Attendance';
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

// Scholarship Coordinator Pages
import ScholarshipDashboard from './pages/scholarship/Dashboard';
import ScholarshipSchemes from './pages/scholarship/Schemes';
import ScholarshipApplications from './pages/scholarship/Applications';
import ScholarshipDocVerification from './pages/scholarship/DocVerification';
import ScholarshipEligibility from './pages/scholarship/Eligibility';
import ScholarshipApproval from './pages/scholarship/Approval';
import ScholarshipDisbursement from './pages/scholarship/Disbursement';
import ScholarshipRenewal from './pages/scholarship/Renewal';
import ScholarshipReports from './pages/scholarship/Reports';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import ReceptionistVisitors from './pages/receptionist/Visitors';
import ReceptionistEnquiries from './pages/receptionist/Enquiries';
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
import StudentAttendance from './pages/student-portal/Attendance';
import StudentTimetable from './pages/student-portal/Timetable';
import StudentSubjects from './pages/student-portal/Subjects';
import StudentAssignments from './pages/student-portal/Assignments';
import StudentStudyMaterials from './pages/student-portal/StudyMaterials';
import StudentExams from './pages/student-portal/Exams';
import StudentResults from './pages/student-portal/Results';
import StudentPortalFees from './pages/student-portal/Fees';
import StudentScholarships from './pages/student-portal/Scholarships';
import StudentLibrary from './pages/student-portal/Library';
import StudentHostel from './pages/student-portal/Hostel';
import StudentPlacement from './pages/student-portal/Placement';
import StudentComplaints from './pages/student-portal/Complaints';
import StudentLeaveRequests from './pages/student-portal/LeaveRequests';
import StudentDownloads from './pages/student-portal/Downloads';

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

                {/* Admissions Specific Routes */}
                <Route path="/admissions/dashboard" element={<AdmissionsDashboard />} />
                <Route path="/admissions/enquiries" element={<Enquiries />} />
                <Route path="/admissions/followups" element={<FollowUps />} />
                <Route path="/admissions/applications" element={<Applications />} />
                <Route path="/admissions/new" element={<NewAdmission />} />
                <Route path="/admissions/documents" element={<DocumentVerification />} />
                <Route path="/admissions/registration" element={<StudentRegistration />} />
                <Route path="/admissions/seats" element={<SeatManagement />} />
                <Route path="/admissions/approval" element={<AdmissionApproval />} />
                <Route path="/admissions/cancellation" element={<AdmissionCancellation />} />
                <Route path="/admissions/reports" element={<AdmissionReports />} />

                {/* Financial Specific Routes */}
                <Route path="/financial/fee-structure" element={<FeeStructure />} />
                <Route path="/financial/student-fees" element={<StudentFees />} />
                <Route path="/financial/fee-collection" element={<FeeCollection />} />
                <Route path="/financial/pending-dues" element={<PendingDues />} />
                <Route path="/financial/installments" element={<Installments />} />
                <Route path="/financial/discounts" element={<Discounts />} />
                <Route path="/financial/scholarships" element={<Scholarships />} />
                <Route path="/financial/refunds" element={<Refunds />} />
                <Route path="/financial/expenses" element={<Expenses />} />
                <Route path="/financial/income" element={<Income />} />
                <Route path="/financial/vendor-payments" element={<VendorPayments />} />
                <Route path="/financial/payroll" element={<Payroll />} />
                <Route path="/financial/receipts" element={<Receipts />} />
                <Route path="/financial/cash-bank" element={<CashBank />} />
                <Route path="/financial/ledger" element={<AccountLedger />} />
                <Route path="/financial/reports" element={<FinancialReports />} />

                {/* Library Specific Routes */}
                <Route path="/library/dashboard" element={<LibraryDashboard />} />
                <Route path="/library/books" element={<LibraryBooks />} />
                <Route path="/library/members" element={<LibraryMembers />} />
                <Route path="/library/issue-return" element={<LibraryIssueReturn />} />
                <Route path="/library/reservations" element={<LibraryReservations />} />
                <Route path="/library/fines" element={<LibraryFines />} />
                <Route path="/library/lost-damaged" element={<LibraryLostDamaged />} />
                <Route path="/library/stock" element={<LibraryStock />} />
                <Route path="/library/reports" element={<LibraryReports />} />

                {/* Hostel Warden Specific Routes */}
                <Route path="/hostel-warden/dashboard" element={<HostelWardenDashboard />} />
                <Route path="/hostel-warden/rooms" element={<HostelWardenRooms />} />
                <Route path="/hostel-warden/allotment" element={<HostelWardenAllotment />} />
                <Route path="/hostel-warden/check-in-out" element={<HostelWardenCheckInOut />} />
                <Route path="/hostel-warden/attendance" element={<HostelWardenAttendance />} />
                <Route path="/hostel-warden/leave-outing" element={<HostelWardenLeaveOuting />} />
                <Route path="/hostel-warden/visitors" element={<HostelWardenVisitors />} />
                <Route path="/hostel-warden/complaints" element={<HostelWardenComplaints />} />
                <Route path="/hostel-warden/incidents" element={<HostelWardenIncidents />} />
                <Route path="/hostel-warden/inventory" element={<HostelWardenInventory />} />
                <Route path="/hostel-warden/notices" element={<HostelWardenNotices />} />
                <Route path="/hostel-warden/reports" element={<HostelWardenReports />} />

                {/* Mess Manager Specific Routes */}
                <Route path="/mess/dashboard" element={<MessDashboard />} />
                <Route path="/mess/menu" element={<MessMealMenu />} />
                <Route path="/mess/attendance" element={<MessMealAttendance />} />
                <Route path="/mess/students" element={<MessStudents />} />
                <Route path="/mess/stock" element={<MessStockInventory />} />
                <Route path="/mess/consumption" element={<MessDailyConsumption />} />
                <Route path="/mess/purchases" element={<MessPurchaseRequests />} />
                <Route path="/mess/complaints" element={<MessComplaints />} />
                <Route path="/mess/reports" element={<MessReports />} />

                {/* Lab Assistant Specific Routes */}
                <Route path="/lab/dashboard" element={<LabDashboard />} />
                <Route path="/lab/units" element={<LabUnits />} />
                <Route path="/lab/equipment" element={<LabEquipment />} />
                <Route path="/lab/schedule" element={<LabPracticalSchedule />} />
                <Route path="/lab/attendance" element={<LabPracticalAttendance />} />
                <Route path="/lab/issue-return" element={<LabIssueReturn />} />
                <Route path="/lab/consumables" element={<LabConsumableStock />} />
                <Route path="/lab/maintenance" element={<LabMaintenance />} />
                <Route path="/lab/damage-lost" element={<LabDamageLost />} />
                <Route path="/lab/safety" element={<LabSafetyChecklist />} />
                <Route path="/lab/reports" element={<LabReports />} />

                {/* Workshop Instructor Specific Routes */}
                <Route path="/workshop/dashboard" element={<WorkshopDashboard />} />
                <Route path="/workshop/schedule" element={<WorkshopSchedule />} />
                <Route path="/workshop/batches" element={<WorkshopBatches />} />
                <Route path="/workshop/attendance" element={<WorkshopAttendance />} />
                <Route path="/workshop/jobs" element={<WorkshopJobs />} />
                <Route path="/workshop/machines" element={<WorkshopMachines />} />
                <Route path="/workshop/tool-issue-return" element={<WorkshopToolIssueReturn />} />
                <Route path="/workshop/stock" element={<WorkshopConsumableStock />} />
                <Route path="/workshop/maintenance" element={<WorkshopMaintenance />} />
                <Route path="/workshop/safety" element={<WorkshopSafetyChecklist />} />
                <Route path="/workshop/reports" element={<WorkshopReports />} />

                {/* Placement Officer Specific Routes */}
                <Route path="/placement/dashboard" element={<PlacementDashboard />} />
                <Route path="/placement/profiles" element={<PlacementStudentProfiles />} />
                <Route path="/placement/companies" element={<PlacementCompanies />} />
                <Route path="/placement/jobs" element={<PlacementJobOpportunities />} />
                <Route path="/placement/drives" element={<PlacementDrives />} />
                <Route path="/placement/shortlist" element={<PlacementEligibilityShortlisting />} />
                <Route path="/placement/applications" element={<PlacementApplications />} />
                <Route path="/placement/interviews" element={<PlacementInterviews />} />
                <Route path="/placement/offers" element={<PlacementSelectionsOffers />} />
                <Route path="/placement/internships" element={<PlacementInternships />} />
                <Route path="/placement/reports" element={<PlacementReports />} />

                {/* Scholarship Coordinator Specific Routes */}
                <Route path="/scholarship/dashboard" element={<ScholarshipDashboard />} />
                <Route path="/scholarship/schemes" element={<ScholarshipSchemes />} />
                <Route path="/scholarship/applications" element={<ScholarshipApplications />} />
                <Route path="/scholarship/verification" element={<ScholarshipDocVerification />} />
                <Route path="/scholarship/eligibility" element={<ScholarshipEligibility />} />
                <Route path="/scholarship/approval" element={<ScholarshipApproval />} />
                <Route path="/scholarship/disbursement" element={<ScholarshipDisbursement />} />
                <Route path="/scholarship/renewal" element={<ScholarshipRenewal />} />
                <Route path="/scholarship/reports" element={<ScholarshipReports />} />

                {/* Receptionist Specific Routes */}
                <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/visitors" element={<ReceptionistVisitors />} />
                <Route path="/receptionist/enquiries" element={<ReceptionistEnquiries />} />
                <Route path="/receptionist/calls" element={<ReceptionistCalls />} />
                <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
                <Route path="/receptionist/helpdesk" element={<ReceptionistHelpDesk />} />
                <Route path="/receptionist/gatepass" element={<ReceptionistGatePass />} />
                <Route path="/receptionist/courier" element={<ReceptionistCourier />} />
                <Route path="/receptionist/reports" element={<ReceptionistReports />} />

                {/* Security / Gate Operator Specific Routes */}
                <Route path="/security/dashboard" element={<SecurityDashboard />} />
                <Route path="/security/movement" element={<SecurityStudentMovement />} />
                <Route path="/security/visitors" element={<SecurityVisitors />} />
                <Route path="/security/gatepass" element={<SecurityGatePass />} />
                <Route path="/security/vehicles" element={<SecurityVehicles />} />
                <Route path="/security/hostel-movement" element={<SecurityHostelMovement />} />
                <Route path="/security/incidents" element={<SecurityIncidents />} />
                <Route path="/security/reports" element={<SecurityReports />} />

                {/* Student Portal Specific Routes */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/attendance" element={<StudentAttendance />} />
                <Route path="/student/timetable" element={<StudentTimetable />} />
                <Route path="/student/subjects" element={<StudentSubjects />} />
                <Route path="/student/assignments" element={<StudentAssignments />} />
                <Route path="/student/materials" element={<StudentStudyMaterials />} />
                <Route path="/student/exams" element={<StudentExams />} />
                <Route path="/student/results" element={<StudentResults />} />
                <Route path="/student/fees" element={<StudentPortalFees />} />
                <Route path="/student/scholarships" element={<StudentScholarships />} />
                <Route path="/student/library" element={<StudentLibrary />} />
                <Route path="/student/hostel" element={<StudentHostel />} />
                <Route path="/student/placement" element={<StudentPlacement />} />
                <Route path="/student/complaints" element={<StudentComplaints />} />
                <Route path="/student/leave-requests" element={<StudentLeaveRequests />} />
                <Route path="/student/downloads" element={<StudentDownloads />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
