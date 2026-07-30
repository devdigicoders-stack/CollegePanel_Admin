import React, { useState } from 'react';
import { Download, FileText, BarChart3, ChevronDown } from 'lucide-react';

const reportTypes = [
  'Daily Enquiry Report', 'Enquiry Source Report', 'Follow-up Report', 'Application Report',
  'Admission Report', 'Course-wise Admissions', 'Department-wise Admissions',
  'Category-wise Admissions', 'Gender-wise Admissions', 'Seat Availability Report',
  'Cancelled Admission Report', 'Pending Documents Report', 'Fee-Pending Admission Report',
  'Counsellor Performance Report',
];

const summaryData = [
  { label: 'Total Enquiries', value: 1245, change: '+12%' },
  { label: 'Total Applications', value: 892, change: '+8%' },
  { label: 'Approved Admissions', value: 567, change: '+15%' },
  { label: 'Cancelled Admissions', value: 12, change: '-3%' },
];

const courseData = [
  { course: 'Diploma in CE', enquiries: 380, applications: 280, admissions: 180 },
  { course: 'Diploma in IT', enquiries: 320, applications: 240, admissions: 156 },
  { course: 'Diploma in ME', enquiries: 290, applications: 210, admissions: 134 },
  { course: 'Diploma in EE', enquiries: 255, applications: 162, admissions: 97 },
];

const AdmissionReports = () => {
  const [selectedReport, setSelectedReport] = useState('Admission Report');
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState('2024-02-28');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Admission Reports</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Generate and export admission reports</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4">
        <div className="relative">
          <select value={selectedReport} onChange={e => setSelectedReport(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer min-w-[220px]">
            {reportTypes.map(r => <option key={r}>{r}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-gray-600">From:</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-gray-600">To:</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Generate</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryData.map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-[12px] text-gray-500 mb-1">{s.label}</p>
              <p className="text-[24px] font-bold text-gray-800">{s.value.toLocaleString()}</p>
              <p className={`text-[12px] font-semibold ${s.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{s.change} vs last year</p>
            </div>
          ))}
        </div>

        {/* Course-wise Table */}
        <div>
          <h3 className="text-[14px] font-bold text-gray-800 mb-3">Course-wise Admission Summary</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Course','Enquiries','Applications','Admissions','Conversion Rate'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courseData.map(row => (
                <tr key={row.course} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{row.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{row.enquiries}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{row.applications}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-green-700">{row.admissions}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{Math.round((row.admissions/row.enquiries)*100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Available Reports List */}
        <div>
          <h3 className="text-[14px] font-bold text-gray-800 mb-3">Available Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportTypes.map(report => (
              <div key={report} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#0A6C54] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-[#0A6C54]" />
                  <span className="text-[13px] font-medium text-gray-700">{report}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Export PDF"><Download size={14} className="text-gray-500" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionReports;
