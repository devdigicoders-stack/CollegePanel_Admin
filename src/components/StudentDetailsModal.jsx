import React from 'react';
import { X, User, Calendar, Users, Phone, Mail, MapPin, Building, GraduationCap, BookOpen, Award, CheckCircle, Clock, XCircle, FileText, ExternalLink } from 'lucide-react';

const StudentDetailsModal = ({ isOpen, onClose, student, actions, type = 'pending' }) => {
  if (!isOpen || !student) return null;

  const StatusIcon = type === 'approved' ? CheckCircle : type === 'rejected' ? XCircle : Clock;
  const statusColors = type === 'approved' ? 'text-emerald-500 bg-emerald-50' : type === 'rejected' ? 'text-red-500 bg-red-50' : 'text-amber-500 bg-amber-50';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 font-['Inter']">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 ${statusColors}`}>
              {student.documents?.find(d => d.name === 'Student Photo') ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${student.documents.find(d => d.name === 'Student Photo').url}`} 
                  alt="Student" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={28} strokeWidth={2.5} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">Student Details</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[13px] text-gray-500 font-medium font-mono bg-gray-100 px-2 py-0.5 rounded-md">
                  {student.appNo}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-[13px] text-gray-500 font-medium">
                  {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              
              {/* Personal Information */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <User size={14} /> Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[12px] text-gray-500 mb-1 font-medium">Full Name</p>
                    <p className="text-[14px] font-bold text-gray-800">{student.name}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[12px] text-gray-500 mb-1 font-medium">Date of Birth</p>
                    <p className="text-[14px] font-bold text-gray-800 flex items-center gap-1.5">
                      {student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[12px] text-gray-500 mb-1 font-medium">Gender</p>
                    <p className="text-[14px] font-bold text-gray-800">{student.gender || 'N/A'}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[12px] text-gray-500 mb-1 font-medium">Category</p>
                    <p className="text-[14px] font-bold text-gray-800 flex items-center gap-1.5">
                      {student.category || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[12px] text-gray-500 mb-1 font-medium">Aadhaar Number</p>
                    <p className="text-[14px] font-bold text-gray-800 flex items-center gap-1.5">
                      {student.aadhaar || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[12px] text-gray-500 mb-1 font-medium">Blood Group</p>
                    <p className="text-[14px] font-bold text-gray-800 flex items-center gap-1.5">
                      {student.bloodGroup || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[12px] text-gray-500 mb-1 font-medium">Religion</p>
                    <p className="text-[14px] font-bold text-gray-800 flex items-center gap-1.5">
                      {student.religion || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parents / Guardian Details */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Users size={14} /> Parents / Guardian Details
                </h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-[12px] font-bold text-[#0A6C54] mb-3">Father's Information</h5>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[12px] text-gray-500 mb-1 font-medium">Name</p>
                        <p className="text-[14px] font-bold text-gray-800">{student.parentName || 'N/A'}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[12px] text-gray-500 mb-1 font-medium">Mobile Number</p>
                        <p className="text-[14px] font-bold text-gray-800">{student.fatherMobile || 'N/A'}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[12px] text-gray-500 mb-1 font-medium">Occupation</p>
                        <p className="text-[14px] font-bold text-gray-800">{student.fatherOccupation || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-50">
                    <h5 className="text-[12px] font-bold text-[#0A6C54] mb-3">Mother's Information</h5>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[12px] text-gray-500 mb-1 font-medium">Name</p>
                        <p className="text-[14px] font-bold text-gray-800">{student.motherName || 'N/A'}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[12px] text-gray-500 mb-1 font-medium">Mobile Number</p>
                        <p className="text-[14px] font-bold text-gray-800">{student.motherMobile || 'N/A'}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[12px] text-gray-500 mb-1 font-medium">Occupation</p>
                        <p className="text-[14px] font-bold text-gray-800">{student.motherOccupation || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Phone size={14} /> Contact Details
                </h4>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 font-medium">Mobile Number</p>
                      <p className="text-[14px] font-bold text-gray-800">{student.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 font-medium">Email Address</p>
                      <p className="text-[14px] font-bold text-gray-800">{student.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 pt-2 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0 mt-1">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 font-medium mb-1">Current Address</p>
                      <p className="text-[14px] font-bold text-gray-800 leading-snug">
                        {student.currentAddress || 'N/A'}
                        {student.city && `, ${student.city}`}
                        {student.state && `, ${student.state}`}
                        {student.pincode && ` - ${student.pincode}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Course & Academics */}
              <div className="bg-gradient-to-br from-[#0A6C54] to-[#064e3b] p-6 rounded-2xl shadow-lg relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                
                <h4 className="text-[11px] font-black text-white/70 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <GraduationCap size={16} className="text-emerald-300" /> Course Enrolled In
                </h4>
                
                <div className="mb-2">
                  <p className="text-3xl font-black text-white tracking-tight leading-none">{student.course}</p>
                </div>
                <p className="text-emerald-100 text-[13px] font-medium flex items-center gap-1.5 mt-4">
                  <StatusIcon size={14} /> 
                  Status: {type === 'approved' ? 'Approved & Registered' : type === 'rejected' ? 'Rejected' : 'Pending Review'}
                </p>
              </div>

              {/* Previous Academic Details */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <BookOpen size={14} /> Previous Education
                </h4>
                <div className="space-y-5">
                  <div>
                    <p className="text-[12px] text-gray-500 mb-1 font-medium">Previous School / College</p>
                    <div className="flex items-center gap-3">
                      <Building size={16} className="text-gray-400" />
                      <p className="text-[14px] font-bold text-gray-800">{student.prevSchool || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1 font-medium">Board / University</p>
                      <p className="text-[14px] font-bold text-gray-800">{student.board || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1 font-medium">Marks / Percentage</p>
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-max px-3 py-1 rounded-lg">
                        <Award size={14} />
                        <span className="text-[14px] font-black">{student.percentage || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              {student.documents && student.documents.filter(d => d.name !== 'Student Photo').length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <FileText size={14} /> Uploaded Documents
                  </h4>
                  <div className="space-y-3">
                    {student.documents.filter(d => d.name !== 'Student Photo').map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <FileText size={14} />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-800">{doc.name}</p>
                            <p className="text-[11px] text-gray-500 font-medium">Uploaded Successfully</p>
                          </div>
                        </div>
                        <a 
                          href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${doc.url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[11px] font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Footer Actions */}
        {actions && (
          <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0">
            {actions}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDetailsModal;
