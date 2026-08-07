import { useState, useEffect } from 'react';
import { Search, Receipt, Printer, Mail, ChevronDown, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const FeeCollection = () => {
  if (!checkPermission('Collect Fees') && !checkPermission('Generate Receipt')) {
    return <AccessDenied />;
  }
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Collect');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [students, setStudents] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '', studentName: '', enrollNo: '', amount: '', mode: 'Cash', status: 'Completed', feeHeads: '', remarks: ''
  });

  const fetchCollections = async () => {
    setLoadingCollections(true);
    try {
      const res = await axiosInstance.get('/fees/collections');
      setCollections(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch collections');
    } finally {
      setLoadingCollections(false);
    }
  };

  const searchStudents = async () => {
    if (!studentSearch) return;
    setLoadingStudents(true);
    try {
      const res = await axiosInstance.get('/fees/student-fees', { params: { search: studentSearch } });
      setStudents(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to search students');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'History') {
      fetchCollections();
    }
  }, [activeTab]);

  useEffect(() => {
    if (location.state?.student) {
      setSelectedStudent(location.state.student);
      
      // If a specific amount or feeHead was passed, pre-fill it
      if (location.state?.amount || location.state?.feeHead) {
        setFormData(prev => ({ 
          ...prev, 
          amount: location.state?.amount || prev.amount,
          feeHeads: location.state?.feeHead || prev.feeHeads
        }));
      }
      
      // Clear the state so it doesn't persist on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleCollect = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        studentId: selectedStudent._id || selectedStudent.id,
        studentName: selectedStudent.studentName || selectedStudent.name,
        enrollNo: selectedStudent.enrollNo,
        amount: Number(formData.amount),
        mode: formData.mode,
        status: formData.status,
        feeHeads: formData.feeHeads ? [{ head: formData.feeHeads, amount: Number(formData.amount) }] : [],
        remarks: formData.remarks
      };
      await axiosInstance.post('/fees/collections', payload);
      toast.success('Fee collected successfully');
      setSelectedStudent(null);
      setStudentSearch('');
      setFormData({ studentId: '', studentName: '', enrollNo: '', amount: '', mode: 'Cash', status: 'Completed', feeHeads: '', remarks: '' });
      setActiveTab('History');
      fetchCollections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to collect fee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`h-full flex flex-col font-['Inter'] ${printData ? 'print:hidden' : ''}`}>
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col flex-1">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 pt-2">
          {['Collect', 'History'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-[14px] font-semibold transition-colors relative ${
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

      {/* Collect Tab */}
      {activeTab === 'Collect' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Student Search */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">Search Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by enrollment no., name, mobile..." 
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>
              {studentSearch && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  {loadingStudents ? (
                    <div className="p-4 text-center text-gray-500 text-[13px]">Searching...</div>
                  ) : students.length > 0 ? (
                    students.map(student => (
                      <div 
                        key={student._id || student.id}
                        onClick={() => { setSelectedStudent(student); setStudentSearch(''); }}
                        className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      >
                        <p className="text-[13px] font-medium text-gray-800">{student.studentName || student.name}</p>
                        <p className="text-[11px] text-gray-600">{student.enrollNo} • {student.course}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-[13px]">No students found</div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-600">Student Name</p>
                    <p className="text-[13px] font-semibold text-gray-800">{selectedStudent.studentName || selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Enrollment No.</p>
                    <p className="text-[13px] font-semibold text-gray-800">{selectedStudent.enrollNo}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Total Due</p>
                    <p className="text-[13px] font-semibold text-red-600">₹{(selectedStudent.pending || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Already Paid</p>
                    <p className="text-[13px] font-semibold text-green-600">₹{(selectedStudent.paid || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            {selectedStudent && (
              <form onSubmit={handleCollect} className="space-y-4 border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-bold text-gray-800">Payment Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Fee Head</label>
                    <div className="relative">
                      <select value={formData.feeHeads} onChange={e => setFormData({ ...formData, feeHeads: e.target.value })}
                        className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                        <option value="">Select Fee Head</option>
                        <option>Tuition Fee</option>
                        <option>Exam Fee</option>
                        <option>Lab Fee</option>
                        <option>Library Fee</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Amount</label>
                    <input 
                      type="number" 
                      placeholder="Enter amount" 
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Payment Mode</label>
                    <div className="relative">
                      <select value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value})}
                        className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Card</option>
                        <option>Bank Transfer</option>
                        <option>Cheque</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Transaction No.</label>
                    <input 
                      type="text" 
                      placeholder="Enter transaction no." 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Remarks</label>
                    <textarea 
                      placeholder="Add any remarks..." 
                      rows="2"
                      value={formData.remarks}
                      onChange={e => setFormData({ ...formData, remarks: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={submitting} className="flex-1 bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    <Receipt size={16} /> {submitting ? 'Processing...' : 'Collect & Generate Receipt'}
                  </button>
                  <button type="button" onClick={() => { setSelectedStudent(null); setFormData({ studentId: '', studentName: '', enrollNo: '', amount: '', mode: 'Cash', status: 'Completed', feeHeads: '', remarks: '' }); }} className="px-6 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Clear
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'History' && (
        <div className="flex-1 overflow-x-auto p-6">
          {loadingCollections ? (
            <SkeletonLoader type="table" rows={5} cols={7} />
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Receipt No.</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Student Name</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Amount</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Date</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Payment Mode</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Status</th>
                  <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map(collection => (
                  <tr key={collection._id || collection.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{collection.receiptNo}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-800">{collection.studentName}</td>
                    <td className="py-3 px-4 text-[13px] font-semibold text-gray-800">₹{(collection.amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{collection.date ? new Date(collection.date).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600">{collection.mode}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                        {collection.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setPrintData(collection)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Print">
                          <Printer size={16} className="text-gray-600" />
                        </button>
                        <button onClick={() => toast.success('Sending email...')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Email">
                          <Mail size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loadingCollections && collections.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500 text-[13px]">No collections found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
      </div>

      {/* Awesome Printable Receipt Modal */}
      {printData && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 sm:p-6 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col print:shadow-none print:max-h-none print:w-full print:block">
            
            {/* Action Bar (Hidden on Print) */}
            <div className="bg-white border-b border-gray-100 p-4 px-6 flex items-center justify-between print:hidden z-10 flex-shrink-0 rounded-t-2xl">
              <h3 className="font-bold text-gray-800 text-[15px]">Fee Receipt</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors">
                  <Printer size={16}/> Print
                </button>
                <button onClick={() => setPrintData(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-5 sm:p-12 overflow-y-auto flex-1 print:p-0 bg-white" id="printable-receipt">
              <div className="border border-gray-200 rounded-2xl p-6 sm:p-10 print:border-none print:p-0">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-6 mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0A6C54] tracking-tight">DIGITAL COLLEGE</h1>
                    <p className="text-[13px] text-gray-500 mt-2 font-medium">123 Education Lane, Tech City, 10001</p>
                    <p className="text-[13px] text-gray-500 mt-0.5 font-medium">Phone: +1 234 567 8900 | Email: accounts@college.edu</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-wider">FEE RECEIPT</h2>
                    <p className="text-[13px] font-semibold text-gray-600 mt-3">Receipt No: <span className="text-gray-900 font-bold">{printData.receiptNo}</span></p>
                    <p className="text-[13px] font-semibold text-gray-500 mt-0.5">Date: <span className="text-gray-800">{new Date(printData.date).toLocaleDateString('en-GB')}</span></p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 print:bg-transparent print:border-none print:p-0">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Student Details</p>
                    <p className="font-bold text-gray-900 text-[16px]">{printData.studentName}</p>
                    <p className="text-[13px] text-gray-600 mt-1">Enrollment No: <span className="font-semibold text-gray-800">{printData.enrollNo}</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 print:bg-transparent print:border-none print:p-0 text-right">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Payment Details</p>
                    <p className="text-[13px] text-gray-600">Payment Mode: <span className="font-semibold text-gray-800">{printData.mode}</span></p>
                    <p className="text-[13px] text-gray-600 mt-1">Status: <span className="font-bold text-green-600">{printData.status}</span></p>
                  </div>
                </div>

                {/* Amount Table */}
                <table className="w-full mb-10">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200">
                      <th className="py-3 px-4 text-left text-[13px] font-bold text-gray-800">Description / Fee Head</th>
                      <th className="py-3 px-4 text-right text-[13px] font-bold text-gray-800">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printData.feeHeads && printData.feeHeads.length > 0 ? printData.feeHeads.map((fh, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-[14px] font-medium text-gray-700">{fh.head}</td>
                        <td className="py-4 px-4 text-[14px] font-bold text-gray-900 text-right">₹{(fh.amount || printData.amount).toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr className="border-b border-gray-100">
                        <td className="py-4 px-4 text-[14px] font-medium text-gray-700">Fee Payment</td>
                        <td className="py-4 px-4 text-[14px] font-bold text-gray-900 text-right">₹{(printData.amount || 0).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="py-4 px-4 text-right font-bold text-gray-800 text-[14px]">Total Amount Received</td>
                      <td className="py-4 px-4 text-right font-black text-xl text-[#0A6C54]">₹{(printData.amount || 0).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Footer Signatures */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center sm:items-end gap-8 mt-12 pt-6 border-t border-gray-200">
                  <div className="max-w-full sm:max-w-[60%] text-center sm:text-left">
                    <p className="text-[11px] text-gray-500 italic">This is a computer generated receipt and does not require a physical signature.</p>
                  </div>
                  <div className="text-center w-full sm:w-auto flex flex-col items-center">
                    <div className="w-40 border-b-2 border-gray-400 mb-2"></div>
                    <p className="text-[13px] font-bold text-gray-700">Authorized Signatory</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCollection;




