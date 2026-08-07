import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, Calendar, Users, FileText, AlertCircle, CheckCircle, Clock, RotateCcw, 
  BookOpen, AlertTriangle, Zap, Search, Save, RefreshCw, Upload, Download, Eye, 
  ChevronLeft, ChevronRight, Loader2, Edit2, Plus, X
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const STATUS_OPTIONS = ['Upcoming', 'Ongoing', 'Completed'];
const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'F'];

const Examinations = () => {
  if (!checkPermission('View Exams') && !checkPermission('Create Exam') && !checkPermission('Enter Marks') && !checkPermission('View Results')) {
    return <AccessDenied />;
  }
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    upcoming: 0,
    ongoing: 0,
    totalRegistered: 0,
    eligible: 0,
    pendingAdmit: 0,
    pendingMarks: 0,
    resultPending: 0,
    revaluationRequests: 0,
    backPaperStudents: 0,
    todayExams: 0,
    invigilatorShortage: 0
  });

  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [admitCards, setAdmitCards] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [failedResults, setFailedResults] = useState([]);

  const [filters, setFilters] = useState({
    exam: '',
    course: '',
    semester: '',
    subject: '',
    status: '',
    search: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [marksData, setMarksData] = useState([]);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState('');
  const [selectedExamForResults, setSelectedExamForResults] = useState('');
  const [selectedExamForAdmit, setSelectedExamForAdmit] = useState('');
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [examForm, setExamForm] = useState({
    examName: '', course: '', semester: '', subject: '', date: '', startTime: '', endTime: '', totalMarks: 100, passingMarks: 40
  });

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/exams/dashboard/stats');
      setDashboardStats(res.data.data);
      setStats(res.data.data || {});
    } catch {
      toast.error('Failed to load dashboard stats');
    }
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.course && filters.course !== 'All') params.course = filters.course;
      if (filters.search) params.search = filters.search;
      const res = await axiosInstance.get('/exams', { params });
      const data = res.data.data || res.data;
      setExams(data);
      setPagination({
        page: res.data.page || 1,
        limit: res.data.limit || 10,
        total: res.data.total || data.length,
        pages: res.data.pages || 1
      });
    } catch {
      toast.error('Failed to fetch exams');
    }
  }, [filters]);

  const fetchExamResults = useCallback(async () => {
    if (!selectedExamForResults) {
      setExamResults([]);
      return;
    }
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await axiosInstance.get(`/exams/${selectedExamForResults}/results`, { params });
      const data = res.data.data || res.data;
      setExamResults(data);
      setPagination({
        page: res.data.page || 1,
        limit: res.data.limit || 10,
        total: res.data.total || data.length,
        pages: res.data.pages || 1
      });
    } catch {
      toast.error('Failed to fetch exam results');
    }
  }, [selectedExamForResults, filters.page, filters.limit, filters.status, filters.search]);

  const fetchAdmitCards = useCallback(async () => {
    if (!selectedExamForAdmit) {
      setAdmitCards([]);
      return;
    }
    try {
      const res = await axiosInstance.get(`/exams/${selectedExamForAdmit}/admit-card`);
      setAdmitCards([res.data]);
    } catch {
      toast.error('Failed to fetch admit card data');
    }
  }, [selectedExamForAdmit]);

  const fetchQuestionPapers = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/exams/question-papers');
      setQuestionPapers(res.data || []);
    } catch {
      toast.error('Failed to fetch question papers');
    }
  }, []);

  const fetchMarksData = useCallback(async () => {
    if (!selectedExamForMarks) {
      setMarksData([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/exams/${selectedExamForMarks}/results`);
      const data = res.data.data || res.data;
      setMarksData(data);
    } catch {
      toast.error('Failed to load marks data');
    } finally {
      setLoading(false);
    }
  }, [selectedExamForMarks]);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/academics/departments');
      setDepartments(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await axiosInstance.get('/academics/semesters');
      setSemesters(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch semesters', error);
    }
  };

  const fetchFailedResults = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/exams/results/failed');
      setFailedResults(res.data || []);
    } catch {
      toast.error('Failed to fetch back paper students');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchExams(),
        fetchQuestionPapers(),
        fetchDepartments(),
        fetchSemesters()
      ]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'Results & Revaluation' && selectedExamForResults) {
      fetchExamResults();
    }
  }, [activeTab, selectedExamForResults, fetchExamResults]);

  useEffect(() => {
    if (activeTab === 'Admit Cards' && selectedExamForAdmit) {
      fetchAdmitCards();
    }
  }, [activeTab, selectedExamForAdmit, fetchAdmitCards]);

  useEffect(() => {
    if (activeTab === 'Marks Entry' && selectedExamForMarks) {
      fetchMarksData();
    }
  }, [activeTab, selectedExamForMarks, fetchMarksData]);

  useEffect(() => {
    if (activeTab === 'Back Papers & Invigilators') {
      fetchFailedResults();
    }
  }, [activeTab, fetchFailedResults]);

  const handleScheduleExam = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.post('/exams', { ...examForm, status: 'Upcoming' });
      toast.success('Exam scheduled successfully!');
      setShowScheduleModal(false);
      setExamForm({ examName: '', course: '', semester: '', subject: '', date: '', startTime: '', endTime: '', totalMarks: 100, passingMarks: 40 });
      fetchExams();
      fetchDashboardStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule exam');
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
  };

  const handleMarksChange = (index, field, value) => {
    setMarksData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      const theoryVal = parseInt(updated[index].theoryMarks) || 0;
      const practicalVal = parseInt(updated[index].practicalMarks) || 0;
      updated[index].totalMarks = theoryVal + practicalVal;
      const total = theoryVal + practicalVal;
      
      const selectedExam = exams.find(e => e._id === selectedExamForMarks);
      const examTotalMarks = selectedExam?.totalMarks || 100;
      const examPassingMarks = selectedExam?.passingMarks || 40;

      if (total >= examTotalMarks * 0.8) { updated[index].grade = 'A'; updated[index].status = 'Pass'; }
      else if (total >= examTotalMarks * 0.6) { updated[index].grade = 'B'; updated[index].status = 'Pass'; }
      else if (total >= examTotalMarks * 0.4) { updated[index].grade = 'C'; updated[index].status = 'Pass'; }
      else if (total >= examPassingMarks) { updated[index].grade = 'D'; updated[index].status = 'Pass'; }
      else { updated[index].grade = 'F'; updated[index].status = 'Fail'; }
      return updated;
    });
  };

  const handleSaveMarks = async () => {
    if (!selectedExamForMarks) {
      toast.error('Please select an exam first');
      return;
    }
    if (marksData.length === 0) {
      toast.error('No marks data to save');
      return;
    }
    try {
      setSaving(true);
      const resultsPayload = marksData.map(m => ({
        studentId: m.studentId,
        rollNo: m.rollNo,
        studentName: m.studentName,
        course: m.course,
        theoryMarks: m.theoryMarks,
        practicalMarks: m.practicalMarks,
        grade: m.grade,
        status: m.status,
        remarks: m.remarks || ''
      }));
      await axiosInstance.post(`/exams/${selectedExamForMarks}/results`, { results: resultsPayload });
      toast.success('Marks saved successfully!');
      fetchMarksData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishResult = async () => {
    if (!selectedExamForResults) {
      toast.error('Please select an exam first');
      return;
    }
    try {
      setSaving(true);
      await axiosInstance.put(`/exams/${selectedExamForResults}`, { status: 'Completed' });
      toast.success('Result published successfully!');
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish result');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAdmitCard = async () => {
    if (!selectedExamForAdmit) {
      toast.error('Please select an exam first');
      return;
    }
    try {
      setSaving(true);
      await axiosInstance.post(`/exams/${selectedExamForAdmit}/admit-card`, {});
      toast.success('Admit cards generated successfully!');
      fetchAdmitCards();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate admit cards');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (examResults.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Roll No.', 'Name', 'Course', 'Theory', 'Practical', 'Total', 'Grade', 'Status'];
    const rows = examResults.map(r => [
      r.rollNo || '',
      r.studentName || '',
      r.course || '',
      r.theoryMarks || 0,
      r.practicalMarks || 0,
      r.totalMarks || 0,
      r.grade || '',
      r.status || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  };

  const tabs = ['Dashboard', 'Upcoming Exams', 'Ongoing Exams', 'Admit Cards', 'Question Papers', 'Marks Entry', 'Results & Revaluation', 'Back Papers & Invigilators'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pass': return 'text-green-700 bg-green-50';
      case 'Fail': return 'text-red-700 bg-red-50';
      case 'Pending': return 'text-yellow-700 bg-yellow-50';
      case 'Completed': return 'text-green-700 bg-green-50';
      case 'Published': return 'text-green-700 bg-green-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getExamStatusColor = (status) => {
    switch(status) {
      case 'Upcoming': return 'text-blue-700 bg-blue-50';
      case 'Ongoing': return 'text-green-700 bg-green-50';
      case 'Completed': return 'text-gray-700 bg-gray-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  if (loading && activeTab === 'Dashboard') {
    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
        <div className="p-6 border-b border-gray-50">
          <SkeletonLoader type="table" rows={3} cols={4} />
        </div>
        <div className="flex-1 p-6">
          <SkeletonLoader type="cards" />
        </div>
      </div>
    );
  }

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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Upcoming Exams', value: stats.upcoming, icon: Calendar, color: 'bg-blue-50', iconColor: 'text-blue-500' },
              { label: 'Ongoing Exams', value: stats.ongoing, icon: Clock, color: 'bg-purple-50', iconColor: 'text-purple-500' },
              { label: 'Total Registered', value: stats.totalRegistered.toLocaleString(), icon: Users, color: 'bg-green-50', iconColor: 'text-green-500' },
              { label: 'Eligible Students', value: stats.eligible.toLocaleString(), icon: CheckCircle, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
              { label: 'Pending Admit Cards', value: stats.pendingAdmit, icon: FileText, color: 'bg-orange-50', iconColor: 'text-orange-500' },
              { label: 'Pending Question Papers', value: stats.pendingMarks, icon: BookOpen, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
              { label: 'Pending Marks Entry', value: stats.pendingMarks, icon: AlertCircle, color: 'bg-red-50', iconColor: 'text-red-500' },
              { label: 'Result Pending', value: stats.resultPending, icon: RotateCcw, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
              { label: 'Revaluation Requests', value: stats.revaluationRequests, icon: AlertTriangle, color: 'bg-pink-50', iconColor: 'text-pink-500' },
              { label: 'Back Paper Students', value: stats.backPaperStudents, icon: AlertTriangle, color: 'bg-rose-50', iconColor: 'text-rose-500' },
              { label: "Today's Exams", value: stats.todayExams, icon: Zap, color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
              { label: 'Invigilator Shortage', value: stats.invigilatorShortage, icon: AlertCircle, color: 'bg-red-50', iconColor: 'text-red-600' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col-reverse sm:flex-row items-start sm:justify-between gap-3 sm:gap-0">
                    <div>
                      <p className="text-[11px] sm:text-[12px] text-gray-600 font-medium mb-1 leading-tight">{stat.label}</p>
                      <h3 className="text-[20px] sm:text-[24px] font-bold text-gray-800">{stat.value}</h3>
                    </div>
                    <div className={`${stat.color} p-2 sm:p-3 rounded-lg self-end sm:self-auto`}>
                      <Icon className={`${stat.iconColor} w-4 h-4 sm:w-5 sm:h-5`} />
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
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search exams..."
                defaultValue={filters.search}
                onKeyDown={handleSearch}
                className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
              />
            </div>
            {checkPermission('Create Exam') && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={16} />
                Schedule Exam
              </button>
            )}
          </div>
          {loading ? (
            <SkeletonLoader type="table" rows={5} cols={4} />
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Calendar size={40} className="mb-3 opacity-30" />
              <p className="text-[13px] font-medium">No upcoming exams found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map(exam => (
                <div key={exam._id} className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{exam.examName}</h4>
                    <p className="text-[12px] text-gray-600">{exam.course} — {exam.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-medium text-gray-700">{new Date(exam.date).toLocaleDateString()} at {exam.startTime || '-'}</p>
                    <p className="text-[12px] text-gray-500">{exam.totalStudents || 0} students registered</p>
                  </div>
                  <span className={`ml-4 px-3 py-1 rounded-full text-[11px] font-semibold ${getExamStatusColor(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ongoing Exams Tab */}
      {activeTab === 'Ongoing Exams' && (
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <SkeletonLoader type="table" rows={3} cols={4} />
          ) : exams.filter(e => e.status === 'Ongoing').length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Clock size={40} className="mb-3 opacity-30" />
              <p className="text-[13px] font-medium">No ongoing exams.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.filter(e => e.status === 'Ongoing').map(exam => (
                <div key={exam._id} className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{exam.examName}</h4>
                      <p className="text-[12px] text-gray-600">{exam.course} — {exam.subject}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[11px] font-semibold">In Progress</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[12px] text-gray-600">Total</p>
                      <p className="font-bold text-gray-800">{exam.totalStudents || 0}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-600">Present</p>
                      <p className="font-bold text-green-600">{exam.totalStudents ? Math.floor(exam.totalStudents * 0.95) : 0}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-600">Absent</p>
                      <p className="font-bold text-red-600">{exam.totalStudents ? Math.ceil(exam.totalStudents * 0.05) : 0}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 text-[12px] text-gray-500">
                    <span>Time: {exam.startTime || '-'} — {exam.endTime || '-'}</span>
                    <span>•</span>
                    <span>Date: {new Date(exam.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admit Cards Tab */}
      {activeTab === 'Admit Cards' && (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <select
                value={selectedExamForAdmit}
                onChange={(e) => setSelectedExamForAdmit(e.target.value)}
                className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
              >
                <option value="">Select an exam...</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>
                    {exam.examName} — {exam.course}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {selectedExamForAdmit && (
              <button
                onClick={handleGenerateAdmitCard}
                disabled={saving}
                className="bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                Generate Admit Cards
              </button>
            )}
          </div>
          {admitCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText size={40} className="mb-3 opacity-30" />
              <p className="text-[13px] font-medium">Select an exam to view admit card status.</p>
            </div>
          ) : (
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
                  <tr key={card.exam} className="border-b border-gray-50 hover:bg-gray-50">
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
          )}
        </div>
      )}

      {/* Question Papers Tab */}
      {activeTab === 'Question Papers' && (
        <div className="flex-1 overflow-x-auto p-6">
          {loading ? (
            <SkeletonLoader type="table" rows={5} cols={4} />
          ) : questionPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BookOpen size={40} className="mb-3 opacity-30" />
              <p className="text-[13px] font-medium">No question papers found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Exam</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Subject</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Submitted Date</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {questionPapers.map(paper => (
                  <tr key={paper.examId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{paper.exam}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{paper.course}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{paper.subject}</td>
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
          )}
        </div>
      )}

      {/* Marks Entry Tab */}
      {activeTab === 'Marks Entry' && (
        <>
          <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6 flex-shrink-0">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Exam</label>
                <div className="relative">
                  <select
                    value={selectedExamForMarks}
                    onChange={(e) => setSelectedExamForMarks(e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm"
                  >
                    <option value="">Select an exam...</option>
                    {exams.map(exam => (
                      <option key={exam._id} value={exam._id}>
                        {exam.examName} — {exam.course}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Course</label>
                <div className="relative">
                  <select
                    value={filters.course}
                    onChange={(e) => handleFilterChange('course', e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm bg-white"
                  >
                    <option value="">All Courses</option>
                    {departments.map(d => (
                      <option key={d._id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Semester</label>
                <div className="relative">
                  <select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm bg-white"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map(s => (
                      <option key={s._id} value={`Sem ${s.semesterNumber}`}>Sem {s.semesterNumber}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Subject</label>
                <div className="relative">
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm"
                  >
                    <option value="">All Subjects</option>
                    {exams.map(exam => (
                      <option key={exam._id} value={exam.subject}>{exam.subject}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <button
              onClick={() => { setSelectedExamForMarks(''); setMarksData([]); }}
              className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={14} />
              Clear
            </button>
          </div>

          {loading ? (
            <SkeletonLoader type="table" rows={5} cols={7} />
          ) : marksData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Edit2 size={40} className="mb-3 opacity-30" />
              <p className="text-[13px] font-medium">Select an exam to enter marks.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-x-auto p-6 pt-2">
                {(() => {
                  const selectedExam = exams.find(e => e._id === selectedExamForMarks);
                  const examTotal = selectedExam?.totalMarks || 100;
                  const theoryMax = Math.round(examTotal * 0.8);
                  const practicalMax = examTotal - theoryMax;
                  return (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-y border-gray-100">
                          <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[5%] rounded-tl-xl">#</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Enrollment No.</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[20%]">Name</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Theory ({theoryMax})</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Practical ({practicalMax})</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center">Total ({examTotal})</th>
                          <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%] text-center rounded-tr-xl">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marksData.map((student, index) => (
                          <tr key={student._id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{index + 1}</td>
                            <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{student.rollNo}</td>
                            <td className="py-4 px-6 text-[13px] font-medium text-gray-800">{student.studentName}</td>
                            <td className="py-4 px-6 text-center">
                              <input
                                type="number"
                                min="0"
                                max={theoryMax}
                                value={student.theoryMarks || ''}
                                onChange={(e) => handleMarksChange(index, 'theoryMarks', e.target.value)}
                                className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                              />
                            </td>
                            <td className="py-4 px-6 text-center">
                              <input
                                type="number"
                                min="0"
                                max={practicalMax}
                                value={student.practicalMarks || ''}
                                onChange={(e) => handleMarksChange(index, 'practicalMarks', e.target.value)}
                                className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                              />
                            </td>
                            <td className="py-4 px-6 text-center">
                              <input
                                type="text"
                                value={student.totalMarks || 0}
                            readOnly
                            className="w-[70px] text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-medium text-gray-800 bg-gray-50 cursor-not-allowed"
                          />
                        </td>
                        <td className={`py-4 px-6 text-[14px] font-bold text-center ${
                          student.grade === 'A' ? 'text-orange-500' :
                          student.grade === 'B' ? 'text-orange-500' :
                          student.grade === 'C' ? 'text-red-500' :
                          student.grade === 'F' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {student.grade || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                );
                })()}
              </div>

              <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 rounded-b-2xl bg-gray-50/30">
                <button
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download size={14} />
                  Export CSV
                </button>
                {checkPermission('Enter Marks') && (
                  <>
                    <button
                      onClick={handleSaveMarks}
                      disabled={saving}
                      className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-gray-400 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Marks
                    </button>
                    <button
                      onClick={handlePublishResult}
                      disabled={saving}
                      className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-gray-400 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Publish Result
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Results & Revaluation Tab */}
      {activeTab === 'Results & Revaluation' && (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <select
                value={selectedExamForResults}
                onChange={(e) => setSelectedExamForResults(e.target.value)}
                className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
              >
                <option value="">Select an exam...</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>
                    {exam.examName} — {exam.course}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {selectedExamForResults && (
              <button
                onClick={handlePublishResult}
                disabled={saving}
                className="bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Publish Result
              </button>
            )}
          </div>
          {examResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <RotateCcw size={40} className="mb-3 opacity-30" />
              <p className="text-[13px] font-medium">Select an exam to view results.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Enrollment No.</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Name</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Theory</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Practical</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Total</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Grade</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Status</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Revaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {examResults.map(result => (
                    <tr key={result._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{result.rollNo}</td>
                      <td className="py-3 px-4 text-[13px] text-gray-800 font-medium">{result.studentName}</td>
                      <td className="py-3 px-4 text-[13px] text-center text-gray-600">{result.theoryMarks || 0}</td>
                      <td className="py-3 px-4 text-[13px] text-center text-gray-600">{result.practicalMarks || 0}</td>
                      <td className="py-3 px-4 text-[13px] text-center font-medium">{result.totalMarks || 0}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(result.grade)}`}>
                          {result.grade || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {result.revaluationRequested ? (
                          <span className="text-blue-600 text-[13px] font-semibold">Requested</span>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await axiosInstance.put(`/exams/results/${result._id}`, { revaluationRequested: true });
                                toast.success('Revaluation requested!');
                                fetchExamResults();
                              } catch {
                                toast.error('Failed to request revaluation');
                              }
                            }}
                            className="text-[13px] text-blue-600 font-semibold hover:underline"
                          >
                            Request
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Back Papers & Invigilators Tab */}
      {activeTab === 'Back Papers & Invigilators' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[14px] font-bold text-gray-800 mb-4">Back Paper Students ({failedResults.length})</h3>
              {failedResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <p className="text-[13px] font-medium">No back paper students.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {failedResults.map(student => (
                    <div key={student._id} className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{student.studentName}</p>
                          <p className="text-[12px] text-gray-600">{student.rollNo}</p>
                          <p className="text-[12px] text-gray-600 mt-1">{student.course} — Total: {student.totalMarks || 0}</p>
                        </div>
                        <span className="text-[11px] font-medium text-rose-700 bg-white px-2 py-1 rounded">Fail</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-[14px] font-bold text-gray-800 mb-4">Invigilator Shortage ({stats.invigilatorShortage})</h3>
              {exams.filter(e => e.status === 'Upcoming').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <p className="text-[13px] font-medium">No upcoming exams with shortage.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exams.filter(e => e.status === 'Upcoming').map(exam => {
                    const required = Math.ceil((exam.totalStudents || 0) / 30);
                    const assigned = Math.floor((exam.totalStudents || 0) / 40);
                    const shortage = Math.max(0, required - assigned);
                    if (shortage === 0) return null;
                    return (
                      <div key={exam._id} className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">{exam.examName}</p>
                            <p className="text-[12px] text-gray-600">{new Date(exam.date).toLocaleDateString()}</p>
                          </div>
                          <span className="text-[11px] font-bold text-red-700 bg-white px-2 py-1 rounded">Shortage: {shortage}</span>
                        </div>
                        <div className="flex gap-4 text-[12px]">
                          <span className="text-gray-600">Required: <span className="font-semibold text-gray-800">{required}</span></span>
                          <span className="text-gray-600">Assigned: <span className="font-semibold text-gray-800">{assigned}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Exam Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">Schedule New Exam</h2>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleScheduleExam} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Exam Name (e.g. Mid Sem, Unit Test 1)</label>
                  <input
                    required
                    type="text"
                    value={examForm.examName}
                    onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    placeholder="Enter exam name"
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Course / Department</label>
                  <div className="relative">
                    <select
                      required
                      value={examForm.course}
                      onChange={(e) => setExamForm({ ...examForm, course: e.target.value })}
                      className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
                    >
                      <option value="">Select Course</option>
                      {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Semester</label>
                  <div className="relative">
                    <select
                      required
                      value={examForm.semester}
                      onChange={(e) => setExamForm({ ...examForm, semester: e.target.value })}
                      className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map(s => <option key={s._id} value={`Sem ${s.semesterNumber}`}>Sem {s.semesterNumber}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Subject</label>
                  <input
                    required
                    type="text"
                    value={examForm.subject}
                    onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    placeholder="Enter subject name"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date</label>
                  <input
                    required
                    type="date"
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={examForm.startTime}
                      onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">End Time</label>
                    <input
                      type="time"
                      value={examForm.endTime}
                      onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Total Marks</label>
                  <input
                    required
                    type="number"
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Passing Marks</label>
                  <input
                    required
                    type="number"
                    value={examForm.passingMarks}
                    onChange={(e) => setExamForm({ ...examForm, passingMarks: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Examinations;