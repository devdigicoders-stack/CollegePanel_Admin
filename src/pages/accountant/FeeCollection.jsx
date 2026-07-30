import React, { useState } from 'react';
import { Search, Plus, Receipt, Printer, Mail, ChevronDown } from 'lucide-react';

const FeeCollection = () => {
  const [activeTab, setActiveTab] = useState('Collect');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const students = [
    { id: 1, enrollNo: 'OP/23/CE/001', name: 'Aarav Singh', course: 'Diploma in CE', totalDue: 15000, paid: 20000 },
    { id: 2, enrollNo: 'OP/23/CE/002', name: 'Neha Verma', course: 'Diploma in CE', totalDue: 12000, paid: 25000 },
    { id: 3, enrollNo: 'OP/23/IT/001', name: 'Vikram Patel', course: 'Diploma in IT', totalDue: 18000, paid: 22500 },
  ];

  const collections = [
    { id: 1, receiptNo: 'RCP/2024/001', studentName: 'Aarav Singh', amount: '₹15,000', date: '2024-02-15', mode: 'Bank Transfer', status: 'Completed' },
    { id: 2, receiptNo: 'RCP/2024/002', studentName: 'Neha Verma', amount: '₹12,000', date: '2024-02-14', mode: 'UPI', status: 'Completed' },
    { id: 3, receiptNo: 'RCP/2024/003', studentName: 'Vikram Patel', amount: '₹18,000', date: '2024-02-13', mode: 'Cash', status: 'Completed' },
    { id: 4, receiptNo: 'RCP/2024/004', studentName: 'Muskan Jain', amount: '₹8,500', date: '2024-02-12', mode: 'Card', status: 'Completed' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>
              {studentSearch && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  {students.map(student => (
                    <div 
                      key={student.id}
                      onClick={() => { setSelectedStudent(student); setStudentSearch(''); }}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="text-[13px] font-medium text-gray-800">{student.name}</p>
                      <p className="text-[11px] text-gray-600">{student.enrollNo} • {student.course}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-600">Student Name</p>
                    <p className="text-[13px] font-semibold text-gray-800">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Enrollment No.</p>
                    <p className="text-[13px] font-semibold text-gray-800">{selectedStudent.enrollNo}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Total Due</p>
                    <p className="text-[13px] font-semibold text-red-600">₹{selectedStudent.totalDue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Already Paid</p>
                    <p className="text-[13px] font-semibold text-green-600">₹{selectedStudent.paid.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            {selectedStudent && (
              <div className="space-y-4 border border-gray-200 rounded-lg p-6">
                <h3 className="text-[14px] font-bold text-gray-800">Payment Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Fee Head</label>
                    <div className="relative">
                      <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Payment Mode</label>
                    <div className="relative">
                      <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Receipt size={16} /> Collect & Generate Receipt
                  </button>
                  <button className="px-6 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'History' && (
        <div className="flex-1 overflow-x-auto p-6">
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
                <tr key={collection.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{collection.receiptNo}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-800">{collection.studentName}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-gray-800">{collection.amount}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{collection.date}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{collection.mode}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                      {collection.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Print">
                        <Printer size={16} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Email">
                        <Mail size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeCollection;
