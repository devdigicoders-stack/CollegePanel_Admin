import { useState, useEffect } from 'react';
import { Download, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [semesters, setSemesters] = useState([]);
  const [revalLoading, setRevalLoading] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/results');
      const data = res.data || [];
      setResults(data);
      
      const sems = [...new Set(data.map(r => r.examId?.semester).filter(Boolean))];
      // Sort semesters e.g. Sem 1, Sem 2
      sems.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numB - numA; // Descending
      });
      setSemesters(sems);
      if (sems.length > 0) {
        setSelectedSemester(sems[0]); // Select latest by default
      }
    } catch (error) {
      toast.error('Failed to fetch results');
    }
  };

  const handleRequestRevaluation = async (resultId) => {
    try {
      setRevalLoading(resultId);
      await axiosInstance.post(`/student-portal/results/${resultId}/revaluation`);
      toast.success('Revaluation requested successfully!');
      fetchResults();
    } catch (error) {
      toast.error('Failed to request revaluation');
    } finally {
      setRevalLoading(null);
    }
  };

  // Filter results
  const filteredResults = selectedSemester === 'All' 
    ? results 
    : results.filter(r => r.examId?.semester === selectedSemester);

  // Compute Stats for selected semester
  const totalSubjects = filteredResults.length;
  const clearedSubjects = filteredResults.filter(r => r.status === 'Pass').length;
  const isFailed = filteredResults.some(r => r.status === 'Fail');
  
  // Calculate SGPA (Simplified: Total marks obtained / Max marks * 10)
  let obtained = 0;
  let maxMarks = 0;
  filteredResults.forEach(r => {
    obtained += (r.totalMarks || 0);
    maxMarks += (r.examId?.totalMarks || 100);
  });
  const sgpa = maxMarks > 0 ? ((obtained / maxMarks) * 10).toFixed(2) : '0.00';
  const percentage = maxMarks > 0 ? ((obtained / maxMarks) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter'] print:shadow-none print:border-none">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">My Grade Card & Semester Results</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify internal marks, practical marks, overall SGPA results, and download marksheets</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option value="All">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          <button onClick={() => window.print()} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Download size={15} /> Download Marksheet
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto print:overflow-visible">
        <div className="hidden print:block text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">Grade Card</h1>
          <p className="text-sm text-gray-500">Semester: {selectedSemester}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 border rounded-xl flex items-center justify-between ${isFailed ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
            <div>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Semester Status</span>
              <h4 className={`text-[20px] font-bold mt-1 ${isFailed ? 'text-red-700' : 'text-green-700'}`}>
                {totalSubjects === 0 ? 'NO DATA' : (isFailed ? 'FAILED' : 'PASSED')}
              </h4>
            </div>
            {!isFailed && totalSubjects > 0 && (
              <div className="text-[11px] font-bold text-green-800 bg-green-100 px-2 py-1 rounded print:border print:border-green-800">PROMOTED</div>
            )}
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Subjects Cleared</span>
              <h4 className="text-[20px] font-bold text-blue-700 mt-1">
                {clearedSubjects} / {totalSubjects}
              </h4>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">SGPA / Percentage</span>
              <h4 className="text-[20px] font-bold text-purple-700 mt-1">
                {sgpa} <span className="text-[12px] font-medium text-purple-500">({percentage}%)</span>
              </h4>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-[14px]">Subject Grades</h3>
          {filteredResults.length > 0 ? (
            <div className="border border-gray-100 rounded-xl overflow-x-auto custom-scrollbar print:border-gray-300">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 print:bg-gray-100">
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Subject</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Marks (Th + Pr)</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Grade</th>
                    <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center print:hidden">Revaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((item, idx) => {
                    const max = item.examId?.totalMarks || 100;
                    return (
                      <tr key={item._id || idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-gray-800">{item.examId?.examName}</span>
                            <span className="text-[11px] text-gray-500">{item.examId?.subject || 'Subject'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[13px] font-medium text-gray-700">{item.totalMarks} / {max}</span>
                          <div className="text-[10px] text-gray-400">Th: {item.theoryMarks} | Pr: {item.practicalMarks}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-bold ${
                            item.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          } print:border print:border-gray-300`}>
                            {item.grade || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center print:hidden">
                          {item.revaluationRequested ? (
                            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">Requested</span>
                          ) : (
                            <button
                              onClick={() => handleRequestRevaluation(item._id)}
                              disabled={revalLoading === item._id}
                              className="text-[11px] font-semibold text-gray-600 hover:text-[#0A6C54] hover:bg-green-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                            >
                              {revalLoading === item._id ? <Loader2 size={12} className="animate-spin inline" /> : 'Apply'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
              No results found for the selected semester.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
