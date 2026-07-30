import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, Filter, FileSpreadsheet, FilePlus2, 
  ArrowRight, Users, DollarSign, BookOpen, Home, Coffee, FlaskConical,
  Hammer, Briefcase, Award, Phone, ShieldAlert, GraduationCap, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const roleReports = [
  {
    id: 'admissions',
    name: 'Admissions Officer',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    types: [
      { name: "Today's Enquiries & Follow-ups", fields: ['Name', 'Course', 'Status', 'Date'], data: [
        { name: 'Amit Sharma', course: 'B.Tech CSE', status: 'Pending Follow-up', date: '30-Jul' },
        { name: 'Pooja Verma', course: 'MBA Marketing', status: 'Enquiry Completed', date: '30-Jul' }
      ]},
      { name: "Course-wise Registrations", fields: ['Course', 'Intake Capacity', 'Registered', 'Vacant'], data: [
        { course: 'B.Tech CSE', capacity: 120, registered: 110, vacant: 10 },
        { course: 'B.Tech ECE', capacity: 60, registered: 42, vacant: 18 }
      ]}
    ]
  },
  {
    id: 'finance',
    name: 'Accountant (Finance)',
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50',
    types: [
      { name: "Daily Fee Collections", fields: ['Receipt No', 'Student', 'Amount', 'Mode'], data: [
        { receipt: 'REC-9081', student: 'Rohan Mehta', amount: '₹45,000', mode: 'UPI' },
        { receipt: 'REC-9082', student: 'Neha Singh', amount: '₹60,000', mode: 'Bank Transfer' }
      ]},
      { name: "Pending Fee Dues", fields: ['Enrollment', 'Student', 'Branch', 'Pending Dues'], data: [
        { enrollment: 'CSE-22-045', student: 'Abhishek Roy', branch: 'B.Tech CSE', dues: '₹15,000' },
        { enrollment: 'ECE-22-012', student: 'Simran Kaur', branch: 'B.Tech ECE', dues: '₹8,500' }
      ]}
    ]
  },
  {
    id: 'library',
    name: 'Librarian',
    icon: BookOpen,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    types: [
      { name: "Overdue Books Log", fields: ['ISBN', 'Book Title', 'Borrower', 'Days Overdue', 'Fine Due'], data: [
        { isbn: '978-3-16-148410-0', title: 'Introduction to Algorithms', borrower: 'Vikas Kumar', days: '6 Days', fine: '₹60' },
        { isbn: '978-0-13-110362-7', title: 'The C Programming Language', borrower: 'Karan Malhotra', days: '12 Days', fine: '₹120' }
      ]},
      { name: "Library Cards Roster", fields: ['Member ID', 'Name', 'Status', 'Books Issued'], data: [
        { id: 'LIB-309', name: 'Ayush Sharma', status: 'Active', issued: 3 },
        { id: 'LIB-411', name: 'Divya Sen', status: 'Suspended', issued: 0 }
      ]}
    ]
  },
  {
    id: 'hostel',
    name: 'Hostel Warden',
    icon: Home,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    types: [
      { name: "Hostel Occupancy Report", fields: ['Block', 'Total Rooms', 'Allotted', 'Available Seats'], data: [
        { block: 'Block A (Boys)', rooms: 100, allotted: 95, available: 5 },
        { block: 'Block B (Girls)', rooms: 80, allotted: 72, available: 8 }
      ]},
      { name: "Outings Checkins", fields: ['Student', 'Room No', 'Exit Time', 'Expected Return', 'Status'], data: [
        { student: 'Pranav Joshi', room: 'A-204', exit: '29-Jul 17:00', return: '30-Jul 20:00', status: 'Outside Campus' }
      ]}
    ]
  },
  {
    id: 'mess',
    name: 'Mess Manager',
    icon: Coffee,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    types: [
      { name: "Daily Meal Consumptions", fields: ['Meal Session', 'Hostel Block', 'Head Count', 'Wastage KG'], data: [
        { meal: 'Breakfast', block: 'Boys Mess A', count: 280, wastage: '4.5 kg' },
        { meal: 'Lunch', block: 'Boys Mess A', count: 320, wastage: '8.2 kg' }
      ]},
      { name: "Low Inventory Alerts", fields: ['Ingredient', 'Stock Quantity', 'Safety Level', 'Expiry Date'], data: [
        { item: 'Rice (Basmati)', stock: '45 kg', level: '100 kg', expiry: '12-Dec-2026' },
        { item: 'Cooking Oil', stock: '20 Liters', level: '50 Liters', expiry: '05-Sep-2026' }
      ]}
    ]
  },
  {
    id: 'lab',
    name: 'Lab Assistant',
    icon: FlaskConical,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    types: [
      { name: "Equipment Breakdown Logs", fields: ['Lab Name', 'Asset Name', 'Problem', 'Status', 'Date Logged'], data: [
        { lab: 'Chemistry Lab 2', asset: 'Spectrophotometer', problem: 'Calibration issue', status: 'Under Maintenance', date: '28-Jul' },
        { lab: 'ECE Logic Design', asset: 'Digital Trainer Kit', problem: 'Faulty display', status: 'Assigned for Repair', date: '29-Jul' }
      ]}
    ]
  },
  {
    id: 'workshop',
    name: 'Workshop Instructor',
    icon: Hammer,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    types: [
      { name: "Tool Inventory Registry", fields: ['Tool Code', 'Tool Name', 'Total Qty', 'Issued Qty', 'Under Maintenance'], data: [
        { code: 'TL-F102', name: 'Machinist Flat File', total: 60, issued: 45, maintenance: 2 },
        { code: 'TL-W209', name: 'Arc Welding Torch', total: 15, issued: 8, maintenance: 1 }
      ]}
    ]
  },
  {
    id: 'placement',
    name: 'Placement Officer',
    icon: Briefcase,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    types: [
      { name: "Selections & Job Offers", fields: ['Student', 'Branch', 'Company', 'Package Offered', 'Status'], data: [
        { student: 'Rahul Dravid', branch: 'CSE', company: 'Google Inc.', package: '₹32.5 LPA', status: 'Offer Letter Signed' },
        { student: 'Harpreet Singh', branch: 'ECE', company: 'Intel India', package: '₹18.0 LPA', status: 'Offer Released' }
      ]}
    ]
  },
  {
    id: 'scholarship',
    name: 'Scholarship Coordinator',
    icon: Award,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    types: [
      { name: "Scheme Disbursement Summary", fields: ['Scheme Name', 'Total Applications', 'Approved Count', 'Disbursed Amount'], data: [
        { scheme: 'Post-Matric SC Scholarship', count: 124, approved: 98, amount: '₹14,70,000' },
        { scheme: 'AICTE Pragati Scholarship', count: 42, approved: 35, amount: '₹17,50,000' }
      ]}
    ]
  },
  {
    id: 'reception',
    name: 'Receptionist',
    icon: Phone,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    types: [
      { name: "Daily Visitor Ledger", fields: ['Visitor Name', 'Purpose', 'Whom to Meet', 'In Time', 'Out Time'], data: [
        { name: 'Sanjay Kumar (Parent)', purpose: 'Hostel Outing Approval', whom: 'Warden Block A', in: '10:15 AM', out: '11:00 AM' },
        { name: 'Dr. S. K. Roy', purpose: 'Guest Lecture', whom: 'HOD CSE', in: '11:30 AM', out: '02:30 PM' }
      ]}
    ]
  },
  {
    id: 'security',
    name: 'Security Gate Operator',
    icon: ShieldAlert,
    color: 'text-red-600',
    bg: 'bg-red-50',
    types: [
      { name: "Student Late Checkins", fields: ['Enrollment', 'Student Name', 'Expected Time', 'Actual In Time', 'Warden Notified'], data: [
        { enroll: 'CSE-23-018', name: 'Varun Dhawan', expected: '21:00', actual: '22:15', notified: 'Yes (SMS Sent)' },
        { enroll: 'ME-23-110', name: 'Siddharth Roy', expected: '21:00', actual: '21:45', notified: 'No (Warning Issued)' }
      ]}
    ]
  }
];

const Reports = () => {
  const [selectedRole, setSelectedRole] = useState(roleReports[0]);
  const [selectedReportType, setSelectedReportType] = useState(roleReports[0].types[0]);
  const [dateRange, setDateRange] = useState('Today');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSelectedReportType(role.types[0]);
  };

  const triggerExport = (format) => {
    toast.success(`${selectedReportType.name} exported successfully as ${format}!`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 font-['Inter'] h-full">
      {/* Left Role Selection Sidebar */}
      <div className="w-full md:w-[280px] bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2 flex-shrink-0">
        <h3 className="text-[12px] font-bold text-gray-400 px-3 uppercase tracking-wider mb-2">Role Categories</h3>
        <div className="space-y-1 overflow-y-auto max-h-[400px] md:max-h-none flex-1 custom-scrollbar pr-1">
          {roleReports.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  isSelected 
                    ? 'bg-[#0A6C54] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : `${role.bg} ${role.color}`}`}>
                  <Icon size={16} />
                </div>
                <span className="text-[13px] font-semibold">{role.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Report Generation Area */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-bold text-gray-800">{selectedRole.name} Report Center</h2>
            <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Select report type, apply filters, and download analytical ledger records.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => triggerExport('PDF')}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-[13px] font-semibold text-gray-600 flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> PDF
            </button>
            <button 
              onClick={() => triggerExport('Excel')}
              className="px-4 py-2 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileSpreadsheet size={14} /> Excel
            </button>
          </div>
        </div>

        {/* Configurations Filter Panel */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Select Report Ledger</label>
            <select
              value={selectedReportType.name}
              onChange={(e) => {
                const report = selectedRole.types.find(t => t.name === e.target.value);
                if (report) setSelectedReportType(report);
              }}
              className="w-full p-2 border border-gray-200 rounded-lg text-[13px] font-medium bg-white focus:outline-none"
            >
              {selectedRole.types.map((type, idx) => (
                <option key={idx} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Date Range</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] font-medium bg-white focus:outline-none"
              >
                <option value="Today">Today (30-Jul)</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => toast.success('Applied report filters successfully!')}
              className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Filter size={14} /> Apply Filter
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6 flex-1 overflow-x-auto">
          <table className="w-full border-collapse text-[13px] text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                {selectedReportType.fields.map((field, index) => (
                  <th key={index} className="pb-3">{field}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedReportType.data && selectedReportType.data.length > 0 ? (
                selectedReportType.data.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100/50 hover:bg-gray-50/30 transition-colors">
                    {Object.values(row).map((val, idx) => (
                      <td key={idx} className="py-3.5 text-gray-700 font-medium">{val}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={selectedReportType.fields.length} className="py-8 text-center text-gray-400">
                    No records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
