import React, { useState } from 'react';
import { ChevronDown, Calendar, Users, FileText, AlertCircle, CheckCircle, Clock, RotateCcw, BookOpen, AlertTriangle, Zap } from 'lucide-react';

const Examinations = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [marksData, setMarksData] = useState([
    { id: 1, enrollNo: 'OP/23/CE/001', name: 'Aarav Singh', theory: '72', practical: '18', total: '90', grade: 'A', gradeColor: 'text-orange-500' },
    { id: 2, enrollNo: 'OP/23/CE/002', name: 'Neha Verma', theory: '68', practical: '17', total: '85', grade: 'A', gradeColor: 'text-orange-500' },
    { id: 3, enrollNo: 'OP/23/CE/003', name: 'Vikram Patel', theory: '55', practical: '16', total: '71', grade: 'B', gradeColor: 'text-orange-500' },
    { id: 4, enrollNo: 'OP/23/CE/004', name: 'Muskan Jain', theory: '48', practical: '15', total: '63', grade: 'B', gradeColor: 'text-orange-500' },
    { id: 5, enrollNo: 'OP/23/CE/005', name: 'Rohit Sharma', theory: '35', practical: '12', total: '47', grade: 'C', gradeColor: 'text-red-500' },
  ]);

  // Dashboard Stats
  const stats = [
    { label: 'Upcoming Exams', value: '6', icon: Calendar, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Ongoing Exams', value: '2', icon: Clock, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Total Registered', value: '2,458', icon: Users, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Eligible Students', value: '2,312', icon: CheckCircle, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Pending Admit Cards', value: '145', icon: FileText, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Pending Question Papers', value: '8', icon: BookOpen, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Pending Marks Entry', value: '312', icon: AlertCircle, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Result Pending', value: '89', icon: RotateCcw, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Revaluation Requests', value: '12', icon: AlertTriangle, color: 'bg-pink-50', iconColor: 'text-pink-500' },
    { label: 'Back Paper Students', value: '34', icon: AlertTriangle, color: 'bg-rose-50', iconColor: 'text-rose-500' },
    { label: "Today's Exams", value: '3', icon: Zap, color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
    { label: 'Invigilator Shortage', value: '5', icon: AlertCircle, color: 'bg-red-50', iconColor: 'text-red-600' },
  ];

  // Upcoming Exams Data
  const upcomingExams = [
    { id: 1, name: 'Data Structures', course: 'Diploma in CE', date: '2024-02-15', time: '10:00 AM', students: 245, status: 'Scheduled' },
    { id: 2, name: 'Database Management', course: 'Diploma in CE', date: '2024-02-16', time: '02:00 PM', students: 238, status: 'Scheduled' },
    { id: 3, name: 'Operating Systems', course: 'Diploma in CE', date: '2024-02-17', time: '10:00 AM', students: 242, status: 'Scheduled' },
    { id: 4, name: 'Web Development', course: 'Diploma in IT', date: '2024-02-18', time: '02:00 PM', students: 156, status: 'Scheduled' },
    { id: 5, name: 'Thermodynamics', course: 'Diploma in ME', date: '2024-02-19', time: '10:00 AM', students: 189, status: 'Scheduled' },
    { id: 6, name: 'Circuit Theory', course: 'Diploma in EE', date: '2024-02-20', time: '02:00 PM', students: 167, status: 'Scheduled' },
  ];

  // Ongoing Exams Data
  const ongoingExams = [
    { id: 1, name: 'Data Structures', course: 'Diploma in CE', startTime: '10:00 AM', endTime: '01:00 PM', totalStudents: 245, presentStudents: 238, absentStudents: 7, status: 'In Progress' },
    { id: 2, name: 'Database Management', course: 'Diploma in CE', startTime: '02:00 PM', endTime: '05:00 PM', totalStudents: 238, presentStudents: 235, absentStudents: 3, status: 'In Progress' },
  ];

  // Admit Cards Data
  const admitCards = [
    { id: 1, exam: 'Data Structures', course: 'Diploma in CE', totalStudents: 245, generated: 245, pending: 0, status: 'Completed' },
    { id: 2, exam: 'Database Management', course: 'Diploma in CE', totalStudents: 238, generated: 220, pending: 18, status: 'Pending' },
    { id: 3, exam: 'Operating Systems', course: 'Diploma in CE', totalStudents: 242, generated: 180, pending: 62, status: 'Pending' },
    { id: 4, exam: 'Web Development', course: 'Diploma in IT', totalStudents: 156, generated: 145, pending: 11, status: 'Pending' },
    { id: 5, exam: 'Thermodynamics', course: 'Diploma in ME', totalStudents: 189, generated: 189, pending: 0, status: 'Completed' },
  ];

  // Question Papers Data
  const questionPapers = [
    { id: 1, exam: 'Data Structures', course: 'Diploma in CE', submitted: true, submittedDate: '2024-02-10', status: 'Submitted' },
    { id: 2, exam: 'Database Management', course: 'Diploma in CE', submitted: true, submittedDate: '2024-02-11', status: 'Submitted' },
    { id: 3, exam: 'Operating Systems', course: 'Diploma in CE', submitted: false, submittedDate: null, status: 'Pending' },
    { id: 4, exam: 'Web Development', course: 'Diploma in IT', submitted: false, submittedDate: null, status: 'Pending' },
    { id: 5, exam: 'Thermodynamics', course: 'Diploma in ME', submitted: true, submittedDate: '2024-02-12', status: 'Submitted' },
    { id: 6, exam: 'Circuit Theory', course: 'Diploma in EE', submitted: false, submittedDate: null, status: 'Pending' },
    { id: 7, exam: 'Mechanics', course: 'Diploma in ME', submitted: true, submittedDate: '2024-02-13', status: 'Submitted' },
    { id: 8, exam: 'Power Systems', course: 'Diploma in EE', submitted: false, submittedDate: null, status: 'Pending' },
  ];

  // Results & Revaluation Data
  const resultsData = [
    { id: 1, exam: 'Data Structures', course: 'Diploma in CE', totalStudents: 245, resultPublished: 245, resultPending: 0, revaluationRequests: 3, status: 'Published' },
    { id: 2, exam: 'Database Management', course: 'Diploma in CE', totalStudents: 238, resultPublished: 200, resultPending: 38, revaluationRequests: 5, status: 'Pending' },
    { id: 3, exam: 'Operating Systems', course: 'Diploma in CE', totalStudents: 242, resultPublished: 0, resultPending: 242, revaluationRequests: 0, status: 'Pending' },
  ];

  // Back Papers & Invigilators Data
  const backPaperStudents = [
    { id: 1, enrollNo: 'OP/23/CE/045', name: 'Arjun Kumar', exam: 'Data Structures', course: 'Diploma in CE', backPaperDate: '2024-03-10' },
    { id: 2, enrollNo: 'OP/23/CE/089', name: 'Priya Singh', exam: 'Database Management', course: 'Diploma in CE', backPaperDate: '2024-03-12' },
    { id: 3, enrollNo: 'OP/23/IT/034', name: 'Rahul Verma', exam: 'Web Development', course: 'Diploma in IT', backPaperDate: '2024-03-15' },
    { id: 4, enrollNo: 'OP/23/ME/056', name: 'Sneha Patel', exam: 'Thermodynamics', course: 'Diploma in ME', backPaperDate: '2024-03-18' },
  ];

  const invigilatorShortage = [
    { id: 1, exam: 'Data Structures', date: '2024-02-15', requiredInvigilators: 8, assignedInvigilators: 6, shortage: 2 },
    { id: 2, exam: 'Database Management', date: '2024-02-16', requiredInvigilators: 8, assignedInvigilators: 7, shortage: 1 },
    { id: 3, exam: 'Operating Systems', date: '2024-02-17', requiredInvigilators: 8, assignedInvigilators: 5, shortage: 3 },
    { id: 4, exam: 'Web Development', date: '2024-02-18', requiredInvigilators: 6, assignedInvigilators: 4, shortage: 2 },
    { id: 5, exam: 'Thermodynamics', date: '2024-02-19', requiredInvigilators: 7, assignedInvigilators: 6, shortage: 1 },
  ];

  const handleInputChange = (id, field, value) => {
    setMarksData(marksData.map(student => {
      if (student.id === id) {
        const updatedStudent = { ...student, [field]: value };
        const theoryVal = parseInt(updatedStudent.theory) || 0;
        const practicalVal = parseInt(updatedStudent.practical) || 0;
        updatedStudent.total = (theoryVal + practicalVal).toString();
        
        const total = theoryVal + practicalVal;
        if (total >= 80) { updatedStudent.grade = 'A'; updatedStudent.gradeColor = 'text-orange-500'; }
        else if (total >= 60) { updatedStudent.grade = 'B'; updatedStudent.gradeColor = 'text-orange-500'; }
        else if (total >= 40) { updatedStudent.grade = 'C'; updatedStudent.gradeColor = 'text-red-500'; }
        else { updatedStudent.grade = 'F'; updatedStudent.gradeColor = 'text-red-600'; }
        
        return updatedStudent;
      }
      return student;
    }));
  };

  const tabs = ['Dashboard', 'Upcoming Exams', 'Ongoing Exams', 'Admit Cards', 'Question Papers', 'Marks Entry', 'Results & Revaluation', 'Back Papers & Invigilators'];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto px-4 md:px-6 border-b border-gray-100 pt-2 flex-shrink-0 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 md:px-6 py-4 whitespace-nowrap text-[13px] md:text-[14px] font-semibold transition-colors relative ${
              activeTab === tab 
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>
            )}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'Dashboard' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[12px] text-gray-600 font-medium mb-1">{stat.label}</p>
                      <h3 className="text-[24px] font-bold text-gray-800">{stat.value}</h3>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className={`${stat.iconColor}`} size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Exams Tab */}
      {activeTab === 'Upcoming Exams' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {upcomingExams.map(exam => (
              <div key={exam.id} className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{exam.name}</h4>
                  <p className="text-[12px] text-gray-600">{exam.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-gray-700">{exam.date} at {exam.time}</p>
                  <p className="text-[12px] text-gray-500">{exam.students} students registered</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ongoing Exams Tab */}
      {activeTab === 'Ongoing Exams' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {ongoingExams.map(exam => (
              <div key={exam.id} className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{exam.name}</h4>
                    <p className="text-[12px] text-gray-600">{exam.course}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[11px] font-semibold">In Progress</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[12px] text-gray-600">Total</p>
                    <p className="font-bold text-gray-800">{exam.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-600">Present</p>
                    <p className="font-bold text-green-600">{exam.presentStudents}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-600">Absent</p>
                    <p className="font-bold text-red-600">{exam.absentStudents}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admit Cards Tab */}
      {activeTab === 'Admit Cards' && (
        <div className="flex-1 overflow-x-auto p-6">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Exam</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Total</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Generated</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Pending</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {admitCards.map(card => (
                <tr key={card.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{card.exam}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{card.course}</td>
                  <td className="py-3 px-4 text-[13px] text-center font-medium">{card.totalStudents}</td>
                  <td className="py-3 px-4 text-[13px] text-center text-green-600 font-medium">{card.generated}</td>
                  <td className="py-3 px-4 text-[13px] text-center text-orange-600 font-medium">{card.pending}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                      card.status === 'Completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {card.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Question Papers Tab */}
      {activeTab === 'Question Papers' && (
        <div className="flex-1 overflow-x-auto p-6">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Exam</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Submitted Date</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {questionPapers.map(paper => (
                <tr key={paper.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{paper.exam}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{paper.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{paper.submittedDate || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                      paper.submitted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {paper.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Marks Entry Tab */}
      {activeTab === 'Marks Entry' && (
        <>
          {/* Filters Top Row */}
          <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6 flex-shrink-0">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Exam
                </label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                    <option>Even Semester 2023-24</option>
                    <option>Odd Semester 2023-24</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Course
                </label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                    <option>Diploma in CE</option>
                    <option>Diploma in ME</option>
                    <option>Diploma in EE</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Semester
                </label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                    <option>4th Semester</option>
                    <option>2nd Semester</option>
                    <option>6th Semester</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Subject
                </label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                    <option>Data Structures</option>
                    <option>Database Management</option>
                    <option>Operating Systems</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

            </div>

            <button className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-8 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center transition-colors shadow-sm mb-[2px]">
              Load
            </button>
          </div>

          {/* Table Section */}
          <div className="flex-1 overflow-x-auto p-6 pt-2">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F9FAFB] border-y border-gray-100">
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[5%] rounded-tl-xl">#</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Enrollment No.</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[20%]">Name</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Theory (80)</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Practical (20)</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Total (100)</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center rounded-tr-xl">Grade</th>
                </tr>
              </thead>
              <tbody>
                {marksData.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{student.id}</td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{student.enrollNo}</td>
                    <td className="py-4 px-6 text-[13px] font-medium text-gray-800">{student.name}</td>
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="text"
                        value={student.theory}
                        onChange={(e) => handleInputChange(student.id, 'theory', e.target.value)}
                        className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="text"
                        value={student.practical}
                        onChange={(e) => handleInputChange(student.id, 'practical', e.target.value)}
                        className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                      />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="text"
                        value={student.total}
                        readOnly
                        className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 bg-gray-50 cursor-not-allowed"
                      />
                    </td>
                    <td className={`py-4 px-6 text-[14px] font-bold text-center ${student.gradeColor}`}>
                      {student.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 rounded-b-2xl bg-gray-50/30">
            <button className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm">
              Save Marks
            </button>
            <button className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm">
              Publish Result
            </button>
          </div>
        </>
      )}

      {/* Results & Revaluation Tab */}
      {activeTab === 'Results & Revaluation' && (
        <div className="flex-1 overflow-x-auto p-6">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Exam</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Total</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Published</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Pending</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Revaluation</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {resultsData.map(result => (
                <tr key={result.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{result.exam}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{result.course}</td>
                  <td className="py-3 px-4 text-[13px] text-center font-medium">{result.totalStudents}</td>
                  <td className="py-3 px-4 text-[13px] text-center text-green-600 font-medium">{result.resultPublished}</td>
                  <td className="py-3 px-4 text-[13px] text-center text-orange-600 font-medium">{result.resultPending}</td>
                  <td className="py-3 px-4 text-[13px] text-center text-blue-600 font-medium">{result.revaluationRequests}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                      result.status === 'Published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {result.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Back Papers & Invigilators Tab */}
      {activeTab === 'Back Papers & Invigilators' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Back Paper Students */}
            <div>
              <h3 className="text-[14px] font-bold text-gray-800 mb-4">Back Paper Students ({backPaperStudents.length})</h3>
              <div className="space-y-3">
                {backPaperStudents.map(student => (
                  <div key={student.id} className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{student.name}</p>
                        <p className="text-[12px] text-gray-600">{student.enrollNo}</p>
                        <p className="text-[12px] text-gray-600 mt-1">{student.exam}</p>
                      </div>
                      <span className="text-[11px] font-medium text-rose-700 bg-white px-2 py-1 rounded">{student.backPaperDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invigilator Shortage */}
            <div>
              <h3 className="text-[14px] font-bold text-gray-800 mb-4">Invigilator Shortage ({invigilatorShortage.length})</h3>
              <div className="space-y-3">
                {invigilatorShortage.map(inv => (
                  <div key={inv.id} className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{inv.exam}</p>
                        <p className="text-[12px] text-gray-600">{inv.date}</p>
                      </div>
                      <span className="text-[11px] font-bold text-red-700 bg-white px-2 py-1 rounded">Shortage: {inv.shortage}</span>
                    </div>
                    <div className="flex gap-4 text-[12px]">
                      <span className="text-gray-600">Required: <span className="font-semibold text-gray-800">{inv.requiredInvigilators}</span></span>
                      <span className="text-gray-600">Assigned: <span className="font-semibold text-gray-800">{inv.assignedInvigilators}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Examinations;
