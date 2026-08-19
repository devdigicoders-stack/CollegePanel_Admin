import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap, CheckCircle, MapPin, User, Users, BookOpen, ChevronRight, Check, UploadCloud, FileText, Eye } from 'lucide-react';
import axios from 'axios';

const PublicAdmissionForm = () => {
  const { collegeId } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [appNo, setAppNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '', dob: '', gender: 'Male', mobile: '', email: '',
    aadhaar: '', category: 'General', bloodGroup: '', religion: '',
    parentName: '', fatherMobile: '', fatherOccupation: '',
    motherName: '', motherMobile: '', motherOccupation: '',
    currentAddress: '', city: '', state: '', pincode: '',
    prevSchool: '', board: '', percentage: '',
    course: '', admissionType: 'Regular',
    documents: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, docName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      setLoading(true);
      // It points to VITE_API_URL/upload instead of VITE_API_URL/api/upload 
      // since VITE_API_URL includes /api already.
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, uploadData);
      const fileUrl = res.data.url;
      
      setFormData(prev => {
        const newDocs = prev.documents ? [...prev.documents] : [];
        const existingIdx = newDocs.findIndex(d => d.name === docName);
        if (existingIdx >= 0) {
          newDocs[existingIdx].url = fileUrl;
        } else {
          newDocs.push({ name: docName, url: fileUrl, status: 'Pending' });
        }
        return { ...prev, documents: newDocs };
      });
      toast.success(`${docName} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${docName}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!collegeId || collegeId === 'undefined') {
      toast.error('Invalid college ID. Please use the exact link provided by the college.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admissions/public/${collegeId}`, formData);
      setAppNo(res.data.appNo);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Inter']">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Registration Details Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">Your registration details have been successfully received by the college for verification.</p>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Registration No</p>
            <p className="text-xl font-black text-[#0A6C54]">{appNo}</p>
          </div>
          
          <p className="text-sm text-gray-600 font-medium">Please save this registration number for future reference. The college administration will verify your details shortly.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Parents Details', icon: Users },
    { id: 3, title: 'Contact & Address', icon: MapPin },
    { id: 4, title: 'Academics', icon: BookOpen },
    { id: 5, title: 'Uploads', icon: UploadCloud },
    { id: 6, title: 'Preview', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 font-['Inter']">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-[#0A6C54] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0A6C54]/20">
          <GraduationCap className="text-white" size={32} />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-800">Student Registration Portal</h1>
        <p className="text-gray-500 font-medium mt-2">Fill out the form below to complete your registration</p>
      </div>

      <div className="max-w-3xl w-full">
        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0A6C54] rounded-full -z-10 transition-all duration-300" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
          
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'border-[#0A6C54] bg-[#0A6C54] text-white shadow-md' : isCompleted ? 'border-[#0A6C54] bg-white text-[#0A6C54]' : 'border-gray-300 bg-white text-gray-400'}`}>
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </div>
                <span className={`text-[11px] font-bold ${isActive || isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} placeholder="10-digit mobile number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all">
                    <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Aadhaar Number <span className="text-red-500">*</span></label>
                  <input type="text" name="aadhaar" required value={formData.aadhaar} onChange={handleChange} placeholder="12-digit Aadhaar" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Blood Group</label>
                  <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g. O+" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Religion</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} placeholder="Religion" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Parents Details */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Parents / Guardian Details</h2>
              
              <h3 className="text-sm font-bold text-[#0A6C54] mt-2 mb-2">Father's Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Father's Name <span className="text-red-500">*</span></label>
                  <input type="text" name="parentName" required value={formData.parentName} onChange={handleChange} placeholder="Enter father's name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="fatherMobile" required value={formData.fatherMobile} onChange={handleChange} placeholder="Mobile number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Occupation</label>
                  <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="Occupation" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#0A6C54] mt-6 mb-2 border-t border-gray-100 pt-4">Mother's Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mother's Name <span className="text-red-500">*</span></label>
                  <input type="text" name="motherName" required value={formData.motherName} onChange={handleChange} placeholder="Enter mother's name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                  <input type="tel" name="motherMobile" value={formData.motherMobile} onChange={handleChange} placeholder="Mobile number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Occupation</label>
                  <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="Occupation" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>

              </div>
            </div>
          )}

          {/* Step 3: Contact & Address */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Contact & Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Current Address</label>
                  <input type="text" name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Full address" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Academics & Course */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Academics & Course</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Course Enrolled In <span className="text-red-500">*</span></label>
                  <input type="text" name="course" required value={formData.course} onChange={handleChange} placeholder="e.g. B.Tech, BCA" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Previous School/College</label>
                  <input type="text" name="prevSchool" value={formData.prevSchool} onChange={handleChange} placeholder="School name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Board/University</label>
                  <input type="text" name="board" value={formData.board} onChange={handleChange} placeholder="e.g. CBSE, State Board" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Percentage/CGPA</label>
                  <input type="text" name="percentage" value={formData.percentage} onChange={handleChange} placeholder="e.g. 85%" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Upload Documents */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Upload Documents</h2>
              <p className="text-[12px] text-gray-500 mb-4">Please upload clear, legible copies of the following documents. (Max 5MB each)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Photo */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><User size={14}/> Student Photo <span className="text-red-500">*</span></label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'Student Photo')} className="w-full text-[12px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-[#0A6C54]/10 file:text-[#0A6C54] hover:file:bg-[#0A6C54]/20 transition-all cursor-pointer" />
                  {formData.documents?.find(d => d.name === 'Student Photo') && <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1"><Check size={12}/> Uploaded Successfully</p>}
                </div>
                
                {/* Aadhaar */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><FileText size={14}/> Aadhaar Card</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'Aadhaar Card')} className="w-full text-[12px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-all cursor-pointer" />
                  {formData.documents?.find(d => d.name === 'Aadhaar Card') && <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1"><Check size={12}/> Uploaded Successfully</p>}
                </div>

                {/* Marksheet */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 md:col-span-2">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><BookOpen size={14}/> Previous Marksheet (10th/12th)</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'Marksheet')} className="w-full text-[12px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-all cursor-pointer" />
                  {formData.documents?.find(d => d.name === 'Marksheet') && <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1"><Check size={12}/> Uploaded Successfully</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Preview */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                <Eye size={20} className="text-[#0A6C54]" /> Preview Your Application
              </h2>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-[12px] mb-4">
                <strong>Important:</strong> Please review all details carefully before final submission. You cannot edit these details after submitting.
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
                
                {/* Basic Details */}
                <div>
                  <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Personal & Academic Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4">
                    <div><p className="text-[11px] text-gray-500">Full Name</p><p className="text-[13px] font-bold text-gray-800">{formData.name}</p></div>
                    <div><p className="text-[11px] text-gray-500">Mobile Number</p><p className="text-[13px] font-bold text-gray-800">{formData.mobile}</p></div>
                    <div><p className="text-[11px] text-gray-500">Aadhaar Number</p><p className="text-[13px] font-bold text-gray-800">{formData.aadhaar}</p></div>
                    <div><p className="text-[11px] text-gray-500">Course Applied</p><p className="text-[13px] font-bold text-emerald-700">{formData.course}</p></div>
                    <div><p className="text-[11px] text-gray-500">Father's Name</p><p className="text-[13px] font-bold text-gray-800">{formData.parentName}</p></div>
                    <div><p className="text-[11px] text-gray-500">Mother's Name</p><p className="text-[13px] font-bold text-gray-800">{formData.motherName}</p></div>
                    <div className="col-span-2"><p className="text-[11px] text-gray-500">Current Address</p><p className="text-[13px] font-bold text-gray-800">{formData.currentAddress || 'N/A'}, {formData.city}, {formData.state} - {formData.pincode}</p></div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="pt-5 border-t border-gray-200">
                   <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Uploaded Documents</h3>
                   <div className="flex gap-3 flex-wrap">
                     {formData.documents && formData.documents.length > 0 ? formData.documents.map((doc, idx) => (
                       <span key={idx} className="bg-emerald-50 text-emerald-700 text-[11px] px-3 py-1.5 rounded-lg border border-emerald-100 font-medium flex items-center gap-1.5 shadow-sm">
                         <CheckCircle size={12}/> {doc.name}
                       </span>
                     )) : (
                       <span className="text-[12px] text-gray-500 italic">No documents uploaded</span>
                     )}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between items-center pt-5 border-t border-gray-100">
            {currentStep > 1 ? (
              <button 
                type="button" 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            ) : <div></div>}
            
            {currentStep < steps.length ? (
              <button 
                type="button" 
                onClick={() => {
                  // Basic validation before next
                  if (currentStep === 1) {
                    if (!formData.name) { toast.error('Name is required'); return; }
                    if (!formData.mobile) { toast.error('Mobile number is required'); return; }
                    if (!formData.category) { toast.error('Category is required'); return; }
                    if (!formData.aadhaar) { toast.error('Aadhaar number is required'); return; }
                  }
                  if (currentStep === 2) {
                    if (!formData.parentName) { toast.error('Father\'s name is required'); return; }
                    if (!formData.fatherMobile) { toast.error('Father\'s mobile number is required'); return; }
                    if (!formData.motherName) { toast.error('Mother\'s name is required'); return; }
                  }
                  if (currentStep === 5) {
                    if (!formData.documents?.find(d => d.name === 'Student Photo')) {
                      toast.error('Student Photo is mandatory. Please upload it.');
                      return;
                    }
                  }
                  setCurrentStep(prev => prev + 1);
                }}
                className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#0A6C54] hover:bg-[#085a46] shadow-md shadow-[#0A6C54]/20 transition-all flex items-center gap-2"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-2.5 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
                {!loading && <Check size={16} strokeWidth={3} />}
              </button>
            )}
          </div>

        </form>
      </div>
      
      {/* Footer link for Digicoders requirement mentioned earlier */}
      <div className="mt-auto pt-10 pb-4 text-center">
         <p className="text-[12px] text-gray-400 font-medium">Crafted with ♥ by <a href="https://digicoders.in/" target="_blank" rel="noopener noreferrer" className="text-[#0A6C54] hover:underline font-bold">Team Digicoders</a></p>
      </div>
    </div>
  );
};

export default PublicAdmissionForm;
