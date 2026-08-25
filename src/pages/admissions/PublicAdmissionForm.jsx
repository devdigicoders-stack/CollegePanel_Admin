import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GraduationCap, CheckCircle, MapPin, User, Users, BookOpen, ChevronRight, Check, UploadCloud, FileText, Eye, Copy } from 'lucide-react';
import axios from 'axios';

const PublicAdmissionForm = () => {
  const { collegeId } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [appNo, setAppNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formOptions, setFormOptions] = useState({
    branches: [],
    sessions: [],
    years: [],
    courses: []
  });

  useEffect(() => {
    if (collegeId) {
      axios.get(`${import.meta.env.VITE_API_URL}/admissions/public/${collegeId}/form-options`)
        .then(res => setFormOptions(res.data))
        .catch(err => console.error('Error fetching options', err));
    }
  }, [collegeId]);

  const [formData, setFormData] = useState({
    name: '', dob: '', gender: 'Male', mobile: '', email: '',
    aadhaar: '', category: 'General', bloodGroup: '', religion: '',
    parentName: '', fatherMobile: '', fatherOccupation: '',
    motherName: '', motherMobile: '', motherOccupation: '',
    currentAddress: '', city: '', state: '', pincode: '',
    prevSchool: '', board: '', percentage: '',
    course: '', branch: '', year: '', session: '', admissionType: 'Regular',
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
    
    if (currentStep !== steps.length) {
      return;
    }
    
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

  const handleCopyCredentials = () => {
    const loginLink = window.location.origin + '/login';
    const message = `🎓 Welcome to the Student Portal!

Your registration has been successfully submitted. You can now log in to track your admission status.

🔐 Login Credentials:
Username: ${appNo}
Password: ${formData.dob}

🔗 Login Link: ${loginLink}

⚠️ Important: Please allow Location and Camera permissions when logging in for identity verification.`;

    navigator.clipboard.writeText(message)
      .then(() => toast.success('Credentials copied to clipboard!'))
      .catch(() => toast.error('Failed to copy credentials'));
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
            <p className="text-xl font-black text-primary">{appNo}</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl mb-6 text-left relative">
            <button 
              onClick={handleCopyCredentials}
              className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-500 hover:text-primary hover:border-primary/30 transition-all flex items-center gap-1.5"
              title="Copy Login Details"
            >
              <Copy size={16} />
              <span className="text-xs font-semibold hidden sm:inline">Copy</span>
            </button>

            <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
              <User size={18} />
              Student Portal Access
            </h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              You can track your admission status and access your dashboard by logging into the Student Portal.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <span><strong>Username:</strong> Your Registration No. ({appNo})</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <span><strong>Password:</strong> Your Date of Birth (YYYY-MM-DD)</span>
              </li>
            </ul>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
              <p className="text-xs text-yellow-800 font-medium">
                <strong>Important:</strong> You must allow <strong>Location and Camera permissions</strong> when logging into the portal for identity verification.
              </p>
            </div>

            <a 
              href="/login" 
              className="block w-full text-center bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary-hover transition-colors"
            >
              Go to Student Login
            </a>
          </div>

          <button onClick={() => window.location.reload()} className="w-full text-center text-primary font-semibold text-sm hover:underline">
            Submit Another Application
          </button>
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
      
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <GraduationCap className="text-white" size={32} />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-primary mb-2 tracking-wide">
          {formOptions.collegeName ? formOptions.collegeName.toUpperCase() : 'LOADING...'}
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Student Registration Form
        </h2>
        <p className="text-gray-500 font-medium mt-2">Fill out the form below to complete your registration</p>
      </div>

      <div className="max-w-3xl w-full">
        <div className="flex justify-between items-start sm:items-center mb-8 relative px-2">
          <div className="absolute left-6 right-6 sm:left-10 sm:right-10 top-4 sm:top-1/2 sm:-translate-y-1/2 h-1 bg-gray-200 rounded-full z-0"></div>
          <div className="absolute left-6 sm:left-10 top-4 sm:top-1/2 sm:-translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300" style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 48px)` }}></div>
          
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-1 sm:px-2 z-10 w-12 sm:w-auto">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'border-primary bg-primary text-white shadow-md' : isCompleted ? 'border-primary bg-white text-primary' : 'border-gray-300 bg-white text-gray-400'}`}>
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                </div>
                <span className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight ${isActive || isCompleted ? 'text-gray-800' : 'text-gray-400'} ${isActive ? 'block' : 'hidden sm:block'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} placeholder="10-digit mobile number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Adhar Number <span className="text-red-500">*</span></label>
                  <input type="text" name="aadhaar" required value={formData.aadhaar} onChange={handleChange} placeholder="12-digit Adhar" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Blood Group</label>
                  <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g. O+" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Religion</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} placeholder="Religion" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Parents / Guardian Details</h2>
              <h3 className="text-sm font-bold text-primary mt-2 mb-2">Father's Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Father's Name <span className="text-red-500">*</span></label>
                  <input type="text" name="parentName" required value={formData.parentName} onChange={handleChange} placeholder="Enter father's name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="fatherMobile" required value={formData.fatherMobile} onChange={handleChange} placeholder="Mobile number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Occupation</label>
                  <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="Occupation" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-primary mt-6 mb-2 border-t border-gray-100 pt-4">Mother's Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mother's Name <span className="text-red-500">*</span></label>
                  <input type="text" name="motherName" required value={formData.motherName} onChange={handleChange} placeholder="Enter mother's name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                  <input type="tel" name="motherMobile" value={formData.motherMobile} onChange={handleChange} placeholder="Mobile number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Occupation</label>
                  <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="Occupation" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Contact & Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Current Address</label>
                  <input type="text" name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Full address" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-5">Academics & Course</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Course Enrolled In <span className="text-red-500">*</span></label>
                  <select name="course" required value={formData.course} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="">Select Course</option>
                    {formOptions.courses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Branch / Specialization <span className="text-red-500">*</span></label>
                  <select name="branch" required value={formData.branch} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="">Select Branch</option>
                    {formOptions.branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Year <span className="text-red-500">*</span></label>
                  <select name="year" required value={formData.year} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="">Select Year</option>
                    {formOptions.years.map((y, i) => <option key={i} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Session <span className="text-red-500">*</span></label>
                  <select name="session" required value={formData.session} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="">Select Session</option>
                    {formOptions.sessions.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Previous School/College</label>
                  <input type="text" name="prevSchool" value={formData.prevSchool} onChange={handleChange} placeholder="School name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Previous Board/University</label>
                  <input type="text" name="board" value={formData.board} onChange={handleChange} placeholder="e.g. CBSE, State Board" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Previous Percentage/CGPA</label>
                  <input type="text" name="percentage" value={formData.percentage} onChange={handleChange} placeholder="e.g. 85%" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
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
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'Student Photo')} className="w-full text-[12px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
                  {formData.documents?.find(d => d.name === 'Student Photo') && <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1"><Check size={12}/> Uploaded Successfully</p>}
                </div>
                
                {/* Adhar Front */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><FileText size={14}/> Adhar Front Side</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'Adhar Front Side')} className="w-full text-[12px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-all cursor-pointer" />
                  {formData.documents?.find(d => d.name === 'Adhar Front Side') && <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1"><Check size={12}/> Uploaded Successfully</p>}
                </div>

                {/* Adhar Back */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><FileText size={14}/> Adhar Back Side</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'Adhar Back Side')} className="w-full text-[12px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-all cursor-pointer" />
                  {formData.documents?.find(d => d.name === 'Adhar Back Side') && <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1"><Check size={12}/> Uploaded Successfully</p>}
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
                <Eye size={20} className="text-primary" /> Preview Your Application
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
                    <div><p className="text-[11px] text-gray-500">Adhar Number</p><p className="text-[13px] font-bold text-gray-800">{formData.aadhaar}</p></div>
                    <div><p className="text-[11px] text-gray-500">Course Applied</p><p className="text-[13px] font-bold text-emerald-700">{formData.course}</p></div>
                    <div><p className="text-[11px] text-gray-500">Branch</p><p className="text-[13px] font-bold text-gray-800">{formData.branch}</p></div>
                    <div><p className="text-[11px] text-gray-500">Year / Session</p><p className="text-[13px] font-bold text-gray-800">{formData.year} ({formData.session})</p></div>
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
                    if (!formData.aadhaar) { toast.error('Adhar number is required'); return; }
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
                className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/20 transition-all flex items-center gap-2"
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
      
      {/* Footer link for DigiCoders requirement mentioned earlier */}
      <div className="mt-auto pt-10 pb-4 text-center">
         <p className="text-[12px] text-gray-400 font-medium">Crafted with ♥ by <a href="https://DigiCoders.in/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Team DigiCoders</a></p>
      </div>
    </div>
  );
};

export default PublicAdmissionForm;
