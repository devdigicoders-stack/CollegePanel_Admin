import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, ChevronDown, Save, Edit2, Check, X as XIcon,
  ChevronLeft, ChevronRight, BookOpen, AlertTriangle
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const InternalMarks = () => {
  if (!checkPermission('Enter Marks') && !checkPermission('View Results')) {
    return <AccessDenied />;
  }
  const [activeTab, setActiveTab] = useState('Pending');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [marks, setMarks] = useState({}); // { studentId: marksValue }
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    section: '',
    subject: '',
    examType: 'Internal 1'
  });

  const [examId, setExamId] = useState(null);
  const [maxMarks] = useState(30);

  // 1. Fetch dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptRes, semRes, secRes, subRes] = await Promise.all([
          axiosInstance.get('/academics/departments'),
          axiosInstance.get('/academics/semesters'),
          axiosInstance.get('/academics/sections'),
          axiosInstance.get('/academics/subjects')
        ]);

        const depts = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data?.data || []);
        const sems = Array.isArray(semRes.data) ? semRes.data : (semRes.data?.data || []);
        const secs = Array.isArray(secRes.data) ? secRes.data : (secRes.data?.data || []);
        const subs = Array.isArray(subRes.data) ? subRes.data : (subRes.data?.data || []);

        setDepartments(depts);
        setSemesters(sems);
        setSections(secs);
        setSubjects(subs);

        // Set default filter values if we have data
        setFilters({
          department: depts[0]?.name || '',
          semester: sems[0]?.semesterNumber?.toString() || '1',
          section: secs[0]?.name || 'A',
          subject: subs[0]?.name || '',
          examType: 'Internal 1'
        });
      } catch (err) {
        console.error('Failed to fetch academic options', err);
      }
    };
    fetchOptions();
  }, []);

  // 2. Fetch or create Examination & fetch Student list with Marks
  const fetchExamAndResults = useCallback(async () => {
    if (!filters.department || !filters.subject || !filters.semester) return;
    setLoading(true);
    try {
      // Step A: Find or create the Examination for this filter combination
      const examName = `${filters.examType} - ${filters.subject}`;
      const examSearchQuery = filters.examType;
      
      const examsRes = await axiosInstance.get('/exams', {
        params: {
          course: filters.department,
          search: examSearchQuery
        }
      });
      const examsList = examsRes.data?.data || [];
      // Look for exam with exact subject & name
      let exam = examsList.find(e => e.subject === filters.subject && e.examName === filters.examType && e.semester === filters.semester);

      if (!exam) {
        // Create a new Examination automatically for this combination
        const createRes = await axiosInstance.post('/exams', {
          examName: filters.examType,
          course: filters.department,
          subject: filters.subject,
          semester: filters.semester,
          date: new Date(),
          status: 'Ongoing',
          totalMarks: 30,
          passingMarks: 12
        });
        exam = createRes.data;
      }

      const currentExamId = exam._id;
      setExamId(currentExamId);

      // Step B: Fetch all students of this department (branch) and mapped year
      let yearVal = '1st Year';
      const semNo = parseInt(filters.semester);
      if (semNo === 3 || semNo === 4) yearVal = '2nd Year';
      else if (semNo === 5 || semNo === 6) yearVal = '3rd Year';
      else if (semNo === 7 || semNo === 8) yearVal = '4th Year';

      const studentsRes = await axiosInstance.get('/students', {
        params: {
          limit: 1000,
          branch: filters.department,
          year: yearVal
        }
      });
      const studentsList = studentsRes.data?.data || studentsRes.data || [];

      // Step C: Fetch existing exam results for this examId
      const resultsRes = await axiosInstance.get(`/exams/${currentExamId}/results`, {
        params: { limit: 1000 }
      });
      const resultsList = resultsRes.data?.data || [];

      // Step D: Merge students with existing results
      const mergedStudents = studentsList.map(s => {
        const result = resultsList.find(r => r.studentId === s._id || r.rollNo === s.studentId);
        return {
          _id: s._id,
          rollNo: s.studentId,
          studentName: s.studentName,
          semester: filters.semester,
          section: filters.section,
          marks: result ? result.theoryMarks : null,
          maxMarks: maxMarks,
          status: result ? result.status : 'Pending',
          resultId: result ? result._id : null
        };
      });

      // Filter based on active status tab: 'Pending' vs 'Submitted' vs 'Approved'
      // Note: mapping 'Submitted' -> matches Submitted status, 'Approved' -> Approved, 'Pending' -> Pending or null marks
      const filteredStudents = mergedStudents.filter(s => {
        if (activeTab === 'Pending') {
          return s.status === 'Pending' || s.marks === null;
        }
        return s.status === activeTab;
      });

      setStudents(filteredStudents);

      // Pre-fill input marks
      const initialMarks = {};
      mergedStudents.forEach(s => {
        if (s.marks !== null) {
          initialMarks[s._id] = s.marks;
        }
      });
      setMarks(initialMarks);

    } catch (err) {
      console.error(err);
      toast.error('Failed to load marks and student list');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    fetchExamAndResults();
  }, [fetchExamAndResults]);

  const handleEdit = (student) => {
    setEditingRow(student._id);
    setMarks(prev => ({ ...prev, [student._id]: student.marks !== null ? student.marks : '' }));
  };

  const handleSave = async (student) => {
    const enteredMarks = Number(marks[student._id]);
    if (isNaN(enteredMarks) || enteredMarks < 0 || enteredMarks > student.maxMarks) {
      toast.error(`Marks should be between 0 and ${student.maxMarks}`);
      return;
    }

    try {
      // Prepare results payload for this single student and keep the others' existing results
      // To perform a save, we can call bulkCreateResults with the updated list of students who have entered marks
      const allResultsPayload = [
        {
          studentId: student._id,
          rollNo: student.rollNo,
          studentName: student.studentName,
          course: filters.department,
          theoryMarks: enteredMarks,
          practicalMarks: 0,
          status: 'Pending'
        }
      ];

      // Fetch other students who already have marks in the current state to preserve them
      students.forEach(s => {
        if (s._id !== student._id && s.marks !== null) {
          allResultsPayload.push({
            studentId: s._id,
            rollNo: s.rollNo,
            studentName: s.studentName,
            course: filters.department,
            theoryMarks: s.marks,
            practicalMarks: 0,
            status: s.status
          });
        }
      });

      await axiosInstance.post(`/exams/${examId}/results`, {
        examId,
        results: allResultsPayload
      });

      toast.success(`Marks saved for ${student.studentName}`);
      setEditingRow(null);
      fetchExamAndResults();
    } catch (err) {
      toast.error('Failed to save student marks');
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
  };

  const handleMarksChange = (studentId, value) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const handleBulkSubmit = () => {
    const enteredStudentsCount = students.filter(s => marks[s._id] !== undefined && marks[s._id] !== '').length;
    if (enteredStudentsCount === 0) {
      toast.error('No marks entered to submit');
      return;
    }
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = async () => {
    try {
      // Gather all students and update their status to 'Submitted'
      const allResultsPayload = students.map(s => ({
        studentId: s._id,
        rollNo: s.rollNo,
        studentName: s.studentName,
        course: filters.department,
        theoryMarks: marks[s._id] !== undefined && marks[s._id] !== '' ? Number(marks[s._id]) : (s.marks || 0),
        practicalMarks: 0,
        status: 'Submitted'
      }));

      await axiosInstance.post(`/exams/${examId}/results`, {
        examId,
        results: allResultsPayload
      });

      toast.success('Marks submitted successfully');
      setShowSubmitModal(false);
      fetchExamAndResults();
    } catch (error) {
      toast.error('Failed to submit marks');
    }
  };

  const handleApproveAll = async () => {
    try {
      const allResultsPayload = students.map(s => ({
        studentId: s._id,
        rollNo: s.rollNo,
        studentName: s.studentName,
        course: filters.department,
        theoryMarks: s.marks || 0,
        practicalMarks: 0,
        status: 'Approved'
      }));

      await axiosInstance.post(`/exams/${examId}/results`, {
        examId,
        results: allResultsPayload
      });

      toast.success('Marks approved successfully');
      fetchExamAndResults();
    } catch (error) {
      toast.error('Failed to approve marks');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-5 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Internal Marks Entry</h2>
          <p className="text-[13px] text-gray-500 mt-1">Enter and manage internal examination marks</p>
        </div>
        {activeTab === 'Pending' && (
          <button 
            onClick={handleBulkSubmit}
            disabled={students.length === 0}
            className="flex items-center gap-2 bg-[#0A6C54] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#085a46] disabled:opacity-50 transition-colors shadow-sm"
          >
            <Save size={16} />
            Submit All Marks
          </button>
        )}
        {activeTab === 'Submitted' && (
          <button 
            onClick={handleApproveAll}
            disabled={students.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Check size={16} />
            Approve All Marks
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto">
        {['Pending', 'Submitted', 'Approved'].map((tabName) => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName)}
            className={`whitespace-nowrap px-5 py-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === tabName ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabName}
            {activeTab === tabName && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="p-5 flex flex-wrap gap-3 bg-white border-b border-gray-100">
        <div className="relative">
          <select 
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="">Select Branch</option>
            {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.semester}
            onChange={(e) => setFilters({...filters, semester: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="">Select Semester</option>
            {semesters.map(s => <option key={s._id} value={s.semesterNumber}>{s.semesterNumber}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.section}
            onChange={(e) => setFilters({...filters, section: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="">Select Section</option>
            {sections.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.subject}
            onChange={(e) => setFilters({...filters, subject: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.examType}
            onChange={(e) => setFilters({...filters, examType: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer shadow-sm"
          >
            <option>Internal 1</option>
            <option>Internal 2</option>
            <option>Internal 3</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <BookOpen size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] text-blue-800 font-semibold">
            {filters.subject || 'Select Subject'} - {filters.examType} | {filters.department || 'Select Branch'} | Semester {filters.semester || 'Select Sem'} - Section {filters.section || 'Select Sec'}
          </p>
          <p className="text-[12px] text-blue-600 mt-0.5">Maximum Marks: {maxMarks} | Total Students: {students.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto mt-4">
        {loading ? (
          <div className="p-6"><SkeletonLoader type="table" rows={5} cols={6} /></div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search size={40} className="mb-3 opacity-30" />
            <p className="text-[13px] font-medium">No students found matching filters and active status</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-y border-gray-100">
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Roll No</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[30%]">Student Name</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Semester</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Marks Obtained</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Status</th>
                <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[13%] text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{student.rollNo}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-semibold">{student.studentName}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">Semester {student.semester} - Sec {student.section}</td>
                  <td className="py-4 px-6">
                    {editingRow === student._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={student.maxMarks}
                          value={marks[student._id] !== undefined ? marks[student._id] : ''}
                          onChange={(e) => handleMarksChange(student._id, e.target.value)}
                          className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] font-semibold"
                          placeholder={`0-${student.maxMarks}`}
                        />
                        <span className="text-[13px] text-gray-500">/ {student.maxMarks}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-gray-800 font-black">
                        {student.marks !== null ? `${student.marks} / ${student.maxMarks}` : '-'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide inline-block ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {student.status === 'Pending' && (
                        editingRow === student._id ? (
                          <>
                            <button 
                              onClick={() => handleSave(student)}
                              className="w-8 h-8 rounded-full border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                              title="Save"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={handleCancel}
                              className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                              title="Cancel"
                            >
                              <XIcon size={14} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleEdit(student)}
                            className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Marks"
                          >
                            <Edit2 size={14} />
                          </button>
                        )
                      )}
                      {student.status !== 'Pending' && (
                        <span className="text-[12px] text-gray-400 font-medium">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-800">Submit Marks</h3>
            </div>
            
            <p className="text-gray-600 mb-6 text-[13px] leading-relaxed">
              Are you sure you want to submit all entered marks? This action cannot be undone and marks will be locked for approval.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleSubmitConfirm}
                className="flex-1 bg-[#0A6C54] hover:bg-[#085a46] text-white py-2.5 rounded-lg transition-colors font-semibold text-sm shadow-sm"
              >
                Submit Marks
              </button>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalMarks;
