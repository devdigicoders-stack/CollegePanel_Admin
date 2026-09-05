import { useState, useEffect } from 'react';
import { Calendar, Upload, FileText, CheckCircle, Clock, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Assignments = () => {
  const [assigns, setAssigns] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/assignments');
      setAssigns(res.data);
    } catch (error) {
      toast.error('Failed to fetch assignments');
    } finally { setLoading(false); }
  };

  const handleFileChange = (id, file) => {
    setSelectedFiles({ ...selectedFiles, [id]: file });
  };

  const handleUpload = async (id) => {
    try {
      if (!selectedFiles[id]) {
        toast.error('Please select a file to upload');
        return;
      }
      
      const file = selectedFiles[id];
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const uploadRes = await axiosInstance.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = uploadRes.data.url;
      
      await axiosInstance.post('/student-portal/assignments/submit', {
        assignmentId: id,
        remarks: selectedFiles[`${id}_remarks`] || 'Submitted via Student Portal',
        fileUrl: fileUrl
      });
      
      toast.success('Assignment submitted successfully!');
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally { setLoading(false); }
  };

  
  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="table" rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Course Assignments</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Download faculty-attached PDFs, complete your tasks, and submit your work before the deadline</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {assigns.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assigns.map(item => (
              <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-shadow relative flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md">{item.subject || 'Subject'}</span>
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-md">{item.branch || item.course}</span>
                      <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-md">{item.semester}</span>
                      {item.section && <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-md">Sec {item.section}</span>}
                    </div>
                    <h4 className="font-bold text-gray-800 text-[15px] leading-tight line-clamp-2">{item.title}</h4>
                    {item.description && (
                      <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] font-semibold text-gray-500">
                      <span className="text-red-500 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-md">
                        <Clock size={13} /> Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                      <span>Total Marks: <strong className="text-gray-700">{item.totalMarks}</strong></span>
                      {item.teacherName && <span>Faculty: <strong className="text-gray-700">{item.teacherName}</strong></span>}
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap ${
                    item.submissionStatus === 'Submitted' || item.submissionStatus === 'Late' || item.submissionStatus === 'Graded' 
                      ? 'bg-green-50 text-green-700 border border-green-100' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.submissionStatus}
                  </span>
                </div>

                {/* Faculty Attached PDF Section */}
                {item.fileUrl && (
                  <div className="my-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                          <FileText size={16} />
                        </div>
                        <div className="truncate">
                          <p className="text-[12px] font-bold text-gray-800 truncate">{item.fileName || 'Attached Assignment PDF'}</p>
                          <p className="text-[10px] text-gray-400">Faculty Reference Material</p>
                        </div>
                      </div>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[11px] font-bold transition-colors shadow-sm flex-shrink-0"
                      >
                        <Download size={13} /> View PDF
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-50">
                  {item.submissionStatus === 'Pending' ? (
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="Any remarks for the faculty? (Optional)"
                        onChange={(e) => {
                          const el = e.target;
                          setSelectedFiles(prev => ({ ...prev, [`${item._id}_remarks`]: el.value }));
                        }}
                        className="w-full text-[13px] text-gray-700 border border-gray-200 px-3 py-2 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      
                      <div className="relative group/upload cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-3.5 text-center hover:bg-gray-50 hover:border-primary/30 transition-all">
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.zip"
                          onChange={(e) => handleFileChange(item._id, e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                          <div className={`p-2 rounded-full mb-1.5 ${selectedFiles[item._id] ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400 group-hover/upload:bg-primary/10 group-hover/upload:text-primary'} transition-colors`}>
                            {selectedFiles[item._id] ? <CheckCircle size={18} /> : <Upload size={18} />}
                          </div>
                          <p className="text-[12px] font-semibold text-gray-700">
                            {selectedFiles[item._id] ? selectedFiles[item._id].name : 'Attach your assignment solution (PDF/Doc)'}
                          </p>
                          <p className="text-[10px] mt-0.5 text-gray-400">PDF, DOC, ZIP (Max 10MB)</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleUpload(item._id)} 
                        disabled={!selectedFiles[item._id]}
                        className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        Submit Assignment
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 text-[12px] space-y-2 border border-gray-100">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                        <span className="text-gray-500 font-bold">Marks Awarded</span>
                        <span className={`font-black text-[14px] ${item.marksAwarded !== null ? 'text-primary' : 'text-orange-500'}`}>
                          {item.marksAwarded !== null ? item.marksAwarded : 'Pending Evaluation'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-500 font-medium">Submitted on</span>
                        <span className="font-bold text-gray-700">{new Date(item.submissionDate).toLocaleString()}</span>
                      </div>
                      {item.submittedFileUrl && (
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                          <span className="text-gray-500 font-medium">My Submission File</span>
                          <a
                            href={item.submittedFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                          >
                            <FileText size={13} /> View Submitted File
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
            <div className="bg-gray-50 p-6 rounded-full">
              <FileText size={48} className="text-gray-300" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-800">No Assignments Found</h3>
              <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
                You have no pending or graded assignments for your enrolled courses right now.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
