import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Search, Save, RefreshCw } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const STATUS_OPTIONS = ['Present', 'Absent', 'Late'];

const Attendance = () => {
  if (!checkPermission('View Attendance') && !checkPermission('Mark Attendance') && !checkPermission('Edit Attendance')) {
    return <AccessDenied />;
  }
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingSessionId, setExistingSessionId] = useState(null);

  const [filters, setFilters] = useState({
    section: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    period: ''
  });

  const fetchSections = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/academics/sections');
      setSections(res.data);
    } catch {
      toast.error('Failed to load sections');
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/academics/subjects');
      setSubjects(res.data);
    } catch {
      toast.error('Failed to load subjects');
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!filters.section) {
      setStudents([]);
      return;
    }
    try {
      setStudentsLoading(true);
      const section = sections.find(s => s._id === filters.section);
      const className = section ? `${section.courseName} Sem ${section.semester} - ${section.name}` : filters.section;
      const subject = filters.subject || 'General';
      const date = filters.date;

      // 1. Check if an attendance session already exists for this class, subject, and date
      const sessionRes = await axiosInstance.get('/attendance/sessions', {
        params: {
          className,
          subject,
          startDate: date,
          endDate: date
        }
      });

      const sessions = sessionRes.data.data || sessionRes.data || [];
      if (sessions.length > 0) {
        const session = sessions[0];
        setExistingSessionId(session._id);

        // 2. Fetch the records for this session
        const recordsRes = await axiosInstance.get(`/attendance/sessions/${session._id}/records`);
        const records = recordsRes.data.data || recordsRes.data || [];
        
        const mappedRecords = records.map(r => ({
          _id: r.studentId?._id || r.studentId,
          studentId: r.rollNo || '',
          name: r.studentName || '',
          status: r.status || 'Present',
          remarks: r.remarks || ''
        }));
        setStudents(mappedRecords);
      } else {
        setExistingSessionId(null);

        // 3. No session exists, load all students and filter by class
        const studentsRes = await axiosInstance.get('/students', { params: { limit: 1000 } });
        const allStudents = studentsRes.data.data || studentsRes.data;
        if (section) {
          const filtered = allStudents.filter(s =>
            s.course === section.courseName ||
            s.branch === section.courseName ||
            s.year === `Sem ${section.semester}` ||
            s.course?.toLowerCase().includes(section.courseName?.toLowerCase())
          );
          setStudents(filtered.map(s => ({
            _id: s._id,
            studentId: s.studentId || '',
            name: s.studentName || s.name || '',
            status: 'Present',
            remarks: ''
          })));
        } else {
          setStudents(allStudents.map(s => ({
            _id: s._id,
            studentId: s.studentId || '',
            name: s.studentName || s.name || '',
            status: 'Present',
            remarks: ''
          })));
        }
      }
    } catch {
      toast.error('Failed to load students or attendance records');
    } finally {
      setStudentsLoading(false);
    }
  }, [filters.section, filters.subject, filters.date, sections]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSections(), fetchSubjects()]);
      setLoading(false);
    };
    init();
  }, [fetchSections, fetchSubjects]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLoadStudents = () => {
    fetchStudents();
  };

  const handleStatusChange = (index, newStatus) => {
    setStudents(prev =>
      prev.map((s, i) => (i === index ? { ...s, status: newStatus } : s))
    );
  };

  const handleRemarksChange = (index, newRemarks) => {
    setStudents(prev =>
      prev.map((s, i) => (i === index ? { ...s, remarks: newRemarks } : s))
    );
  };

  const totalPresent = students.filter(s => s.status === 'Present').length;
  const totalAbsent = students.filter(s => s.status === 'Absent').length;
  const totalLate = students.filter(s => s.status === 'Late').length;

  const handleSave = async () => {
    if (!filters.section) {
      toast.error('Please select a class');
      return;
    }
    if (students.length === 0) {
      toast.error('No students to save');
      return;
    }
    try {
      setSaving(true);
      const section = sections.find(s => s._id === filters.section);
      const className = section ? `${section.courseName} Sem ${section.semester} - ${section.name}` : filters.section;
      const subject = filters.subject || 'General';

      let sessionId = existingSessionId;

      if (!sessionId) {
        const sessionPayload = {
          className,
          subject,
          date: filters.date,
          period: filters.period || 'Period 1',
          teacherId: null,
          collegeId: null
        };
        const sessionRes = await axiosInstance.post('/attendance/sessions', sessionPayload);
        sessionId = sessionRes.data.data._id;
        setExistingSessionId(sessionId);
      }

      const recordsPayload = students.map(s => ({
        studentId: s._id,
        rollNo: s.studentId || '',
        studentName: s.name || '',
        status: s.status || 'Present',
        remarks: s.remarks || ''
      }));

      await axiosInstance.post(`/attendance/sessions/${sessionId}/records`, { records: recordsPayload });

      toast.success('Attendance saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
        <div className="p-4 md:p-6 border-b border-gray-50">
          <SkeletonLoader type="table" rows={3} cols={4} />
        </div>
        <div className="flex-1 p-6">
          <SkeletonLoader type="table" rows={5} cols={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">

      {/* Top Filter Section */}
      <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6">

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Select Class<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={filters.section}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm"
              >
                <option value="">Select a class...</option>
                {sections.map(section => (
                  <option key={section._id} value={section._id}>
                    {section.courseName} Sem {section.semester} - {section.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Select Subject<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm"
              >
                <option value="">Select a subject...</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleLoadStudents}
            disabled={studentsLoading || !filters.section}
            className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {studentsLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search size={14} />
                Load Students
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-x-auto p-6 pt-2">
        {studentsLoading ? (
          <SkeletonLoader type="table" rows={5} cols={4} />
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search size={40} className="mb-3 opacity-30" />
            <p className="text-[13px] font-medium">Select a class and click Load Students</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-y border-gray-100">
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[20%] rounded-tl-xl">Roll No.</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[30%]">Student Name</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[25%]">Status</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[25%] rounded-tr-xl">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student._id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{student.studentId || '-'}</td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-800">{student.studentName || student.name || '-'}</td>
                  <td className="py-4 px-6">
                    <div className="relative w-[130px]">
                      <select
                        value={student.status || 'Present'}
                        onChange={(e) => handleStatusChange(index, e.target.value)}
                        className={`appearance-none w-full bg-white border border-gray-200 py-2 pl-3 pr-8 rounded-lg text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm
                          ${student.status === 'Present' ? 'text-gray-700' : ''}
                          ${student.status === 'Absent' ? 'text-red-500' : ''}
                          ${student.status === 'Late' ? 'text-orange-500' : ''}
                        `}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className={opt === 'Absent' ? 'text-red-500' : opt === 'Late' ? 'text-orange-500' : 'text-gray-700'}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none size-4
                        ${student.status === 'Present' ? 'text-gray-400' : ''}
                        ${student.status === 'Absent' ? 'text-red-400' : ''}
                        ${student.status === 'Late' ? 'text-orange-400' : ''}
                      `} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <input
                      type="text"
                      value={student.remarks || ''}
                      onChange={(e) => handleRemarksChange(index, e.target.value)}
                      placeholder="Add remarks..."
                      className="w-full bg-transparent border-none text-[13px] text-gray-600 font-medium focus:outline-none focus:ring-0 placeholder:text-gray-300"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-gray-50/30 rounded-b-2xl">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-[13px] md:text-[14px] font-semibold text-gray-600 w-full md:w-auto">
          <div>Total Present: <span className="text-[#0A6C54] ml-1">{totalPresent}</span></div>
          <div>Absent: <span className="text-red-500 ml-1">{totalAbsent}</span></div>
          <div>Late: <span className="text-orange-500 ml-1">{totalLate}</span></div>
          <div className="text-gray-400">|</div>
          <div>Total: <span className="text-gray-800 ml-1">{students.length}</span></div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="w-full sm:w-auto bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-gray-400 text-white px-8 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {saving ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={14} />
              Save Attendance
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default Attendance;