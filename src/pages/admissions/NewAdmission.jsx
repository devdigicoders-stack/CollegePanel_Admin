import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check, Upload, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const steps = ['Personal Details','Parent/Guardian','Address','Academic Details','Course Selection','Document Upload','Eligibility Details','Fee Plan','Review','Submit'];

const SelectField = ({ label, options, name, value, onChange }) => (
  <div>
    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label} <span className="text-red-500">*</span></label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
        <option value="">Select {label}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
    </div>
  </div>
);

const InputField = ({ label, type = 'text', placeholder, name, value, onChange, required = false }) => (
  <div>
    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
  </div>
);

const NewAdmission = () => {
  if (!checkPermission('Add Admission')) {
    return <AccessDenied />;
  }
  const currentYear = new Date().getFullYear();
  const defaultSession = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  const dynamicSessions = [
    `${currentYear - 1}-${(currentYear).toString().slice(-2)}`,
    `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
    `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
    `${currentYear + 2}-${(currentYear + 3).toString().slice(-2)}`
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAppNo, setSubmittedAppNo] = useState('');
  const [formData, setFormData] = useState({
    // Personal
    studentName: '', dob: '', gender: 'Male', mobile: '', email: '', aadhaar: '', category: 'General', religion: 'Hindu', nationality: 'Indian', bloodGroup: 'O+',
    // Parent
    fatherName: '', fatherMobile: '', fatherOccupation: '', motherName: '', motherMobile: '', motherOccupation: '', guardianName: '', guardianMobile: '', annualIncome: '', parentEducation: '10th Pass',
    // Address
    currentAddress: '', city: '', district: '', state: '', pincode: '', permanentAddress: '', permanentCity: '', permanentPincode: '',
    // Academic
    prevSchool: '', board: '', passingYear: '', percentage: '', qualification: '10th Pass', stream: 'Science', entranceName: '', entranceScore: '', rank: '', gapYear: 'No Gap',
    // Course
    course: '', department: '', semester: '', admissionType: 'Regular', academicSession: defaultSession, hostelRequired: 'No', transportRequired: 'No', hostelType: '',
    // Eligibility
    scholarshipApplicable: 'No', incomeCertificateNo: '', casteCertificateNo: '',
    // Fee
    feePlan: 'Full Payment', paymentMode: 'Cash'
  });

  const handleFileUpload = async (e, docName) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      setUploadingDoc(docName);
      const res = await axiosInstance.post(`/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedDocs(prev => ({ ...prev, [docName]: res.data.url }));
      toast.success(`${docName} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading file', error);
      toast.error('Error uploading file');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleFieldChange = (name, value) => {
    if (name === 'department' && value === '+ Add New Department') { setShowDeptModal(true); return; }
    if (name === 'course' && value === '+ Add New Course') { setShowCourseModal(true); return; }
    if (name === 'semester' && value === '+ Add New Semester') { setShowSemModal(true); return; }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [feeStructure, setFeeStructure] = useState(null);
  const [feeFetched, setFeeFetched] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const [quickFeeData, setQuickFeeData] = useState({
    admissionFee: '', tuitionFee: '', registrationFee: '', examFee: '', labFee: '', installments: 1
  });
  const [quickFeeLoading, setQuickFeeLoading] = useState(false);

  // Quick Add Modals States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptData, setNewDeptData] = useState({ name: '', hod: '' });
  const [isDeptSubmitting, setIsDeptSubmitting] = useState(false);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourseData, setNewCourseData] = useState({ code: '', name: '', department: '', duration: '', totalSemesters: '' });
  const [isCourseSubmitting, setIsCourseSubmitting] = useState(false);

  const [showSemModal, setShowSemModal] = useState(false);
  const [newSemData, setNewSemData] = useState({ semesterNumber: '', courseName: '', startDate: '', endDate: '' });
  const [isSemSubmitting, setIsSemSubmitting] = useState(false);

  const fetchDepartments = async () => { try { const res = await axiosInstance.get(`/academics/departments`); setDepartments(res.data || []); } catch (e) { console.error(e); } };
  const fetchCourses = async () => { try { const res = await axiosInstance.get(`/academics/courses`); setCourses(res.data || []); } catch (e) { console.error(e); } };
  const fetchSemesters = async () => { try { const res = await axiosInstance.get(`/academics/semesters`); setSemesters(res.data || []); } catch (e) { console.error(e); } };

  const handleDeptSubmit = async (e) => {
    e.preventDefault(); setIsDeptSubmitting(true);
    try { await axiosInstance.post('/academics/departments', newDeptData); toast.success('Department added!'); await fetchDepartments(); setFormData(p => ({...p, department: newDeptData.name})); setShowDeptModal(false); setNewDeptData({name:'', hod:''}); } catch (err) { toast.error(err.response?.data?.message || 'Error adding department'); } finally { setIsDeptSubmitting(false); }
  };
  const handleCourseSubmit = async (e) => {
    e.preventDefault(); setIsCourseSubmitting(true);
    try { await axiosInstance.post('/academics/courses', newCourseData); toast.success('Course added!'); await fetchCourses(); setFormData(p => ({...p, course: newCourseData.name})); setShowCourseModal(false); setNewCourseData({code:'', name:'', department:'', duration:'', totalSemesters:''}); } catch (err) { toast.error(err.response?.data?.message || 'Error adding course'); } finally { setIsCourseSubmitting(false); }
  };
  const handleSemSubmit = async (e) => {
    e.preventDefault(); setIsSemSubmitting(true);
    try { await axiosInstance.post('/academics/semesters', newSemData); toast.success('Semester added!'); await fetchSemesters(); setFormData(p => ({...p, semester: newSemData.semesterNumber})); setShowSemModal(false); setNewSemData({semesterNumber:'', courseName:'', startDate:'', endDate:''}); } catch (err) { toast.error(err.response?.data?.message || 'Error adding semester'); } finally { setIsSemSubmitting(false); }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, deptRes, semRes, schRes] = await Promise.all([
          axiosInstance.get(`/academics/courses`),
          axiosInstance.get(`/academics/departments`),
          axiosInstance.get(`/academics/semesters`),
          axiosInstance.get(`/scholarships/schemes`).catch(() => ({data: []}))
        ]);
        
        setCourses(courseRes.data || []);
        setDepartments(deptRes.data || []);
        setSemesters(semRes.data || []);
        setScholarships(schRes.data?.data || schRes.data || []);
      } catch (error) {
        console.error('Error fetching dynamic data', error);
        toast.error('Failed to load academic data. Please refresh.');
      }
    };
    fetchData();
  }, []);

  const fetchFeeStructure = async () => {
    if (formData.course && formData.semester) {
      try {
        setFeeFetched(false);
        const res = await axiosInstance.get(`/fees/fee-structures`, {
          params: { course: formData.course, semester: formData.semester }
        });
        setFeeStructure(res.data.data?.[0] || null);
        setFeeFetched(true);
      } catch (error) {
        console.error('Error fetching fee structure', error);
        setFeeStructure(null);
        setFeeFetched(true);
      }
    } else {
      setFeeStructure(null);
      setFeeFetched(false);
    }
  };

  useEffect(() => {
    fetchFeeStructure();
  }, [formData.course, formData.semester]);

  const handleQuickFeeSubmit = async (e) => {
    e.preventDefault();
    setQuickFeeLoading(true);
    try {
      const payload = {
        courseName: formData.course,
        semester: formData.semester,
        admissionFee: Number(quickFeeData.admissionFee) || 0,
        tuitionFee: Number(quickFeeData.tuitionFee) || 0,
        registrationFee: Number(quickFeeData.registrationFee) || 0,
        examFee: Number(quickFeeData.examFee) || 0,
        labFee: Number(quickFeeData.labFee) || 0,
        installments: Number(quickFeeData.installments) || 1
      };
      payload.total = payload.admissionFee + payload.tuitionFee + payload.registrationFee + payload.examFee + payload.labFee;
      
      await axiosInstance.post('/fees/fee-structures', payload);
      toast.success('Fee structure configured successfully');
      await fetchFeeStructure();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to configure fee structure');
    } finally {
      setQuickFeeLoading(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.studentName || !formData.dob || !formData.gender || !formData.mobile || !formData.email || !formData.aadhaar || !formData.category) {
          toast.error('Please fill all required personal details');
          return false;
        }
        return true;
      case 1:
        if (!formData.fatherName || !formData.fatherMobile) {
          toast.error("Please fill Father's Name and Mobile");
          return false;
        }
        return true;
      case 2:
        if (!formData.currentAddress || !formData.city || !formData.state || !formData.pincode) {
          toast.error('Please fill required current address fields');
          return false;
        }
        return true;
      case 3:
        if (!formData.prevSchool || !formData.passingYear || !formData.percentage || !formData.qualification) {
          toast.error('Please fill required academic details');
          return false;
        }
        return true;
      case 4:
        if (!formData.course || !formData.department || !formData.semester || !formData.academicSession) {
          toast.error('Please select Course, Department, Semester, and Session');
          return false;
        }
        return true;
      case 5:
        return true; // Document upload optional for demo
      case 6:
        return true; // Scholarship optional
      case 7:
        if (!feeStructure) {
          toast.error('No Fee Structure configured for this course and semester. Please contact admin.');
          return false;
        }
        if (!formData.feePlan || !formData.paymentMode) {
          toast.error('Please select Fee Plan and Payment Mode');
          return false;
        }
        return true;
      case 8:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 8) {
        // Final submit
        try {
          const appNo = `APP/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
          await axiosInstance.post(`/admissions`, {
            ...formData,
            name: formData.studentName,
            parentName: formData.fatherName,
            appNo,
            stage: 'Application',
            status: 'Pending Verification',
            documents: Object.keys(uploadedDocs).map(name => ({ name, url: uploadedDocs[name], status: 'Pending' }))
          });
          setSubmittedAppNo(appNo);
          setSubmitted(true);
          setCurrentStep(9);
          toast.success('Admission application submitted successfully!');
        } catch (error) {
          console.error('Error submitting admission', error);
          toast.error(error.response?.data?.message || 'Error submitting admission');
        }
      } else {
        setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Student Full Name" name="studentName" value={formData.studentName} onChange={(e) => handleFieldChange('studentName', e.target.value)} required />
          <InputField label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={(e) => handleFieldChange('dob', e.target.value)} required />
          <SelectField label="Gender" options={['Male','Female','Other']} name="gender" value={formData.gender} onChange={(e) => handleFieldChange('gender', e.target.value)} />
          <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={(e) => handleFieldChange('mobile', e.target.value)} required />
          <InputField label="Email Address" name="email" value={formData.email} onChange={(e) => handleFieldChange('email', e.target.value)} required />
          <InputField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={(e) => handleFieldChange('aadhaar', e.target.value)} required />
          <SelectField label="Category" options={['General','OBC','SC','ST','EWS']} name="category" value={formData.category} onChange={(e) => handleFieldChange('category', e.target.value)} />
          <SelectField label="Religion" options={['Hindu','Muslim','Christian','Sikh','Other']} name="religion" value={formData.religion} onChange={(e) => handleFieldChange('religion', e.target.value)} />
          <InputField label="Nationality" placeholder="Indian" name="nationality" value={formData.nationality} onChange={(e) => handleFieldChange('nationality', e.target.value)} />
          <SelectField label="Blood Group" options={['A+','A-','B+','B-','O+','O-','AB+','AB-']} name="bloodGroup" value={formData.bloodGroup} onChange={(e) => handleFieldChange('bloodGroup', e.target.value)} />
        </div>
      );
      case 1: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={(e) => handleFieldChange('fatherName', e.target.value)} required />
          <InputField label="Father's Mobile" name="fatherMobile" value={formData.fatherMobile} onChange={(e) => handleFieldChange('fatherMobile', e.target.value)} required />
          <InputField label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={(e) => handleFieldChange('fatherOccupation', e.target.value)} />
          <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={(e) => handleFieldChange('motherName', e.target.value)} />
          <InputField label="Mother's Mobile" name="motherMobile" value={formData.motherMobile} onChange={(e) => handleFieldChange('motherMobile', e.target.value)} />
          <InputField label="Mother's Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={(e) => handleFieldChange('motherOccupation', e.target.value)} />
          <InputField label="Guardian Name (if different)" name="guardianName" value={formData.guardianName} onChange={(e) => handleFieldChange('guardianName', e.target.value)} />
          <InputField label="Guardian Mobile" name="guardianMobile" value={formData.guardianMobile} onChange={(e) => handleFieldChange('guardianMobile', e.target.value)} />
          <InputField label="Annual Family Income" name="annualIncome" value={formData.annualIncome} onChange={(e) => handleFieldChange('annualIncome', e.target.value)} />
          <SelectField label="Parent Education" options={['Below 10th','10th Pass','12th Pass','Graduate','Post Graduate']} name="parentEducation" value={formData.parentEducation} onChange={(e) => handleFieldChange('parentEducation', e.target.value)} />
        </div>
      );
      case 2: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><InputField label="Current Address" name="currentAddress" value={formData.currentAddress} onChange={(e) => handleFieldChange('currentAddress', e.target.value)} required /></div>
          <InputField label="City" name="city" value={formData.city} onChange={(e) => handleFieldChange('city', e.target.value)} required />
          <InputField label="District" name="district" value={formData.district} onChange={(e) => handleFieldChange('district', e.target.value)} />
          <InputField label="State" name="state" value={formData.state} onChange={(e) => handleFieldChange('state', e.target.value)} required />
          <InputField label="PIN Code" name="pincode" value={formData.pincode} onChange={(e) => handleFieldChange('pincode', e.target.value)} required />
          <div className="md:col-span-2"><InputField label="Permanent Address (if different)" name="permanentAddress" value={formData.permanentAddress} onChange={(e) => handleFieldChange('permanentAddress', e.target.value)} /></div>
          <InputField label="Permanent City" name="permanentCity" value={formData.permanentCity} onChange={(e) => handleFieldChange('permanentCity', e.target.value)} />
          <InputField label="Permanent PIN Code" name="permanentPincode" value={formData.permanentPincode} onChange={(e) => handleFieldChange('permanentPincode', e.target.value)} />
        </div>
      );
      case 3: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Previous School/College Name" name="prevSchool" value={formData.prevSchool} onChange={(e) => handleFieldChange('prevSchool', e.target.value)} required />
          <InputField label="Board/University" name="board" value={formData.board} onChange={(e) => handleFieldChange('board', e.target.value)} />
          <InputField label="Passing Year" name="passingYear" value={formData.passingYear} onChange={(e) => handleFieldChange('passingYear', e.target.value)} required />
          <InputField label="Percentage/CGPA" name="percentage" value={formData.percentage} onChange={(e) => handleFieldChange('percentage', e.target.value)} required />
          <SelectField label="Qualification" options={['10th Pass','12th Pass','Diploma','Graduate']} name="qualification" value={formData.qualification} onChange={(e) => handleFieldChange('qualification', e.target.value)} />
          <SelectField label="Stream" options={['Science','Commerce','Arts','Vocational']} name="stream" value={formData.stream} onChange={(e) => handleFieldChange('stream', e.target.value)} />
          <InputField label="Entrance Exam Name (if any)" name="entranceName" value={formData.entranceName} onChange={(e) => handleFieldChange('entranceName', e.target.value)} />
          <InputField label="Entrance Exam Score" name="entranceScore" value={formData.entranceScore} onChange={(e) => handleFieldChange('entranceScore', e.target.value)} />
          <InputField label="Rank (if any)" name="rank" value={formData.rank} onChange={(e) => handleFieldChange('rank', e.target.value)} />
          <SelectField label="Gap Year" options={['No Gap','1 Year','2 Years','More than 2 Years']} name="gapYear" value={formData.gapYear} onChange={(e) => handleFieldChange('gapYear', e.target.value)} />
        </div>
      );
      case 4: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Course" options={[...courses.map(c => c.name || c.courseName || c.title || c), '+ Add New Course']} name="course" value={formData.course} onChange={(e) => handleFieldChange('course', e.target.value)} />
          <SelectField label="Department" options={[...departments.map(d => d.name || d.departmentName || d), '+ Add New Department']} name="department" value={formData.department} onChange={(e) => handleFieldChange('department', e.target.value)} />
          <SelectField label="Semester" options={[...semesters.map(s => s.semesterNumber?.toString() || s.name || s.semesterName || s), '+ Add New Semester']} name="semester" value={formData.semester} onChange={(e) => handleFieldChange('semester', e.target.value)} />
          <SelectField label="Admission Type" options={['Regular','Lateral Entry','Management Quota','NRI Quota']} name="admissionType" value={formData.admissionType} onChange={(e) => handleFieldChange('admissionType', e.target.value)} />
          <SelectField label="Academic Session" options={dynamicSessions} name="academicSession" value={formData.academicSession} onChange={(e) => handleFieldChange('academicSession', e.target.value)} />
          <SelectField label="Hostel Required" options={['Yes','No']} name="hostelRequired" value={formData.hostelRequired} onChange={(e) => handleFieldChange('hostelRequired', e.target.value)} />
          <SelectField label="Transport Required" options={['Yes','No']} name="transportRequired" value={formData.transportRequired} onChange={(e) => handleFieldChange('transportRequired', e.target.value)} />
          <InputField label="Preferred Hostel Type" placeholder="e.g. Single Room" name="hostelType" value={formData.hostelType} onChange={(e) => handleFieldChange('hostelType', e.target.value)} />
        </div>
      );
      case 5: return (
        <div className="space-y-4">
          <p className="text-[13px] text-gray-600">Upload required documents. Accepted formats: PDF, JPG, PNG (Max 2MB each)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Photograph','Signature','Aadhaar Card','10th Marksheet','12th Marksheet','Transfer Certificate','Migration Certificate','Character Certificate','Caste Certificate','Income Certificate','Domicile Certificate','Medical Certificate'].map(doc => (
              <div key={doc} className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-between hover:border-[#0A6C54] transition-colors">
                <div>
                  <p className="text-[13px] font-medium text-gray-700">{doc}</p>
                  {uploadedDocs[doc] ? (
                    <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${uploadedDocs[doc]}`} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-blue-600 hover:underline">View Uploaded File</a>
                  ) : (
                    <p className="text-[11px] text-gray-500">PDF, JPG, PNG • Max 2MB</p>
                  )}
                </div>
                {uploadingDoc === doc ? (
                  <span className="text-[12px] font-medium text-gray-500">Uploading...</span>
                ) : uploadedDocs[doc] ? (
                  <span className="text-[12px] font-medium text-green-600 flex items-center gap-1"><Check size={14}/> Uploaded</span>
                ) : (
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 flex items-center gap-1.5">
                    <Upload size={13} /> Upload
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc)} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      );
      case 6: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Applying for Scholarship?" options={['Yes','No']} name="scholarshipApplicable" value={formData.scholarshipApplicable} onChange={(e) => handleFieldChange('scholarshipApplicable', e.target.value)} />
          {formData.scholarshipApplicable === 'Yes' && (
            <>
              <InputField label="Income Certificate No." name="incomeCertificateNo" value={formData.incomeCertificateNo} onChange={(e) => handleFieldChange('incomeCertificateNo', e.target.value)} />
              <InputField label="Caste Certificate No." name="casteCertificateNo" value={formData.casteCertificateNo} onChange={(e) => handleFieldChange('casteCertificateNo', e.target.value)} />
            </>
          )}
          <div className="md:col-span-2">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Eligibility Documents</label>
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0A6C54] transition-colors">
              {uploadingDoc === 'Scholarship Document' ? (
                <p className="text-[13px] text-gray-500">Uploading...</p>
              ) : uploadedDocs['Scholarship Document'] ? (
                <div>
                  <Check size={20} className="mx-auto text-green-500 mb-2" />
                  <p className="text-[13px] text-green-600 font-medium mb-1">Document Uploaded Successfully</p>
                  <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${uploadedDocs['Scholarship Document']}`} target="_blank" rel="noreferrer" className="text-[12px] text-blue-600 hover:underline">View Document</a>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-[13px] text-gray-600 hover:text-[#0A6C54]">Click to upload certificates (Income/Caste)</p>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'Scholarship Document')} />
                </label>
              )}
            </div>
          </div>
        </div>
      );
      case 7: 
        if (!formData.course || !formData.semester) {
          return <div className="p-12 text-center text-gray-500 text-[13px]">Please select Course and Semester in Step 5 first.</div>;
        }

        if (feeFetched && !feeStructure) {
          return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-5 text-center">
                <h3 className="text-red-600 font-bold text-[15px] mb-1">No Fee Structure Configured</h3>
                <p className="text-gray-500 text-[13px]">Please configure the fee structure for <b>{formData.course} ({formData.semester})</b> to proceed.</p>
              </div>
              <form onSubmit={handleQuickFeeSubmit} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Admission Fee', key: 'admissionFee' },
                    { label: 'Tuition Fee', key: 'tuitionFee' },
                    { label: 'Registration Fee', key: 'registrationFee' },
                    { label: 'Exam Fee', key: 'examFee' },
                    { label: 'Lab Fee', key: 'labFee' }
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                      <input type="number" placeholder="0" value={quickFeeData[f.key]} onChange={e => setQuickFeeData({ ...quickFeeData, [f.key]: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">No. of Installments</label>
                    <input type="number" min="1" value={quickFeeData.installments} onChange={e => setQuickFeeData({ ...quickFeeData, installments: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-[14px] font-bold text-gray-800">
                    Total Fee: <span className="text-[#0A6C54]">₹{['admissionFee', 'tuitionFee', 'registrationFee', 'examFee', 'labFee'].reduce((sum, key) => sum + (Number(quickFeeData[key]) || 0), 0).toLocaleString()}</span>
                  </div>
                  <button type="submit" disabled={quickFeeLoading} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-70">
                    {quickFeeLoading ? 'Saving...' : 'Save & Continue'}
                  </button>
                </div>
              </form>
            </div>
          );
        }

        if (!feeFetched) {
          return <SkeletonLoader type="table" rows={5} cols={5} />;
        }

        const maxInstallments = feeStructure.installments || 1;
        const feePlanOptions = ['Full Payment'];
        for (let i = 2; i <= maxInstallments; i++) {
          feePlanOptions.push(`${i} Installments`);
        }

        const breakdown = [
          { label: 'Admission Fee', amount: feeStructure.admissionFee || 0 },
          { label: 'Tuition Fee', amount: feeStructure.tuitionFee || 0 },
          { label: 'Registration Fee', amount: feeStructure.registrationFee || 0 },
          { label: 'Exam Fee', amount: feeStructure.examFee || 0 },
          { label: 'Lab Fee', amount: feeStructure.labFee || 0 },
        ].filter(f => f.amount > 0);

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Fee Plan" options={feePlanOptions} name="feePlan" value={formData.feePlan} onChange={(e) => handleFieldChange('feePlan', e.target.value)} />
              <SelectField label="Payment Mode" options={['Cash','UPI','Bank Transfer','Cheque','DD']} name="paymentMode" value={formData.paymentMode} onChange={(e) => handleFieldChange('paymentMode', e.target.value)} />
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="text-[14px] font-bold text-gray-800 mb-4">Fee Breakdown</h4>
              <div className="space-y-2">
                {breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-[13px] text-gray-600">{item.label}</span>
                    <span className="text-[13px] font-semibold text-gray-800">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 pt-3">
                  <span className="text-[14px] font-bold text-gray-800">Total</span>
                  <span className="text-[14px] font-bold text-[#0A6C54]">₹{feeStructure.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 8: 
        const renderSection = (title, stepIndex, dataItems) => (
          <div key={title} className="bg-gray-50 rounded-xl p-5 relative border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h4 className="text-[14px] font-bold text-gray-800">{title}</h4>
              <button 
                onClick={() => setCurrentStep(stepIndex)}
                className="text-[12px] font-semibold text-[#0A6C54] hover:underline flex items-center gap-1"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dataItems.map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
                  <p className="text-[13px] font-semibold text-gray-800 break-words">{value || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        );

        return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0A6C54]/5 p-5 rounded-xl border border-[#0A6C54]/10">
            {uploadedDocs['Photograph'] ? (
              <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${uploadedDocs['Photograph']}`} alt="Student" className="w-20 h-20 rounded-lg object-cover border border-[#0A6C54]/20 shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center text-gray-400 border border-gray-200 text-[10px] text-center p-2">
                No Photo Uploaded
              </div>
            )}
            <div className="text-center md:text-left">
              <h3 className="text-[18px] font-bold text-gray-800">{formData.studentName || 'Student Name'}</h3>
              <p className="text-[13px] text-gray-600 font-medium mt-0.5">{formData.course || 'Course Not Selected'} • {formData.academicSession}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[11px] text-gray-600">{formData.mobile || 'No Mobile'}</span>
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-[11px] text-gray-600">{formData.email || 'No Email'}</span>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-gray-600 font-medium">Please review all details carefully before final submission.</p>
          
          <div className="space-y-4">
            {renderSection('Personal Details', 0, [
              ['Name', formData.studentName], ['DOB', formData.dob], ['Gender', formData.gender], 
              ['Mobile', formData.mobile], ['Email', formData.email], ['Aadhaar', formData.aadhaar], 
              ['Category', formData.category], ['Religion', formData.religion], ['Nationality', formData.nationality], ['Blood Group', formData.bloodGroup]
            ])}
            
            {renderSection('Parent/Guardian', 1, [
              ["Father's Name", formData.fatherName], ["Father's Mobile", formData.fatherMobile], ["Father's Occ.", formData.fatherOccupation],
              ["Mother's Name", formData.motherName], ["Mother's Mobile", formData.motherMobile], ["Mother's Occ.", formData.motherOccupation],
              ['Guardian Name', formData.guardianName], ['Guardian Mobile', formData.guardianMobile],
              ['Annual Income', formData.annualIncome], ['Parent Education', formData.parentEducation]
            ])}

            {renderSection('Address Details', 2, [
              ['Current Address', formData.currentAddress], ['City', formData.city], ['State', formData.state], ['PIN Code', formData.pincode],
              ['Permanent Address', formData.permanentAddress], ['Perm. City', formData.permanentCity], ['Perm. PIN Code', formData.permanentPincode]
            ])}

            {renderSection('Academic Details', 3, [
              ['Previous School', formData.prevSchool], ['Board/University', formData.board], ['Passing Year', formData.passingYear], 
              ['Percentage', formData.percentage], ['Qualification', formData.qualification], ['Stream', formData.stream],
              ['Entrance Exam', formData.entranceName], ['Score', formData.entranceScore], ['Rank', formData.rank], ['Gap Year', formData.gapYear]
            ])}

            {renderSection('Course Selection', 4, [
              ['Course', formData.course], ['Department', formData.department], ['Semester', formData.semester],
              ['Admission Type', formData.admissionType], ['Session', formData.academicSession],
              ['Hostel Required', formData.hostelRequired], ['Transport Required', formData.transportRequired], ['Hostel Type', formData.hostelType]
            ])}

            <div className="bg-gray-50 rounded-xl p-5 relative border border-gray-100">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                <h4 className="text-[14px] font-bold text-gray-800">Uploaded Documents</h4>
                <button onClick={() => setCurrentStep(5)} className="text-[12px] font-semibold text-[#0A6C54] hover:underline flex items-center gap-1">Edit</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.keys(uploadedDocs).length > 0 ? Object.keys(uploadedDocs).map(doc => (
                  <div key={doc} className="flex items-center gap-2">
                    <Check size={14} className="text-green-600 flex-shrink-0" />
                    <span className="text-[12px] text-gray-700 truncate" title={doc}>{doc}</span>
                  </div>
                )) : (
                  <span className="text-[12px] text-gray-500">No documents uploaded</span>
                )}
              </div>
            </div>

            {renderSection('Eligibility Details', 6, [
              ['Applying for Scholarship', formData.scholarshipApplicable], 
              ['Income Cert No.', formData.incomeCertificateNo], 
              ['Caste Cert No.', formData.casteCertificateNo]
            ])}

            {renderSection('Fee Plan', 7, [
              ['Fee Plan', formData.feePlan], ['Payment Mode', formData.paymentMode], 
              ['Total Fee', feeStructure ? `₹${feeStructure.total?.toLocaleString()}` : 'N/A']
            ])}
          </div>
        </div>
      );
      case 9: return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-600" />
          </div>
          <h3 className="text-[20px] font-bold text-gray-800 mb-2">Admission Submitted Successfully!</h3>
          <p className="text-[14px] text-gray-600 mb-6">Application No: <span className="font-bold text-[#0A6C54]">{submittedAppNo || 'Generating...'}</span></p>
          <p className="text-[13px] text-gray-500">The admission will be reviewed and you will be notified once approved.</p>
          <button onClick={() => { 
            setCurrentStep(0); 
            setSubmitted(false); 
            setSubmittedAppNo(''); 
            setFormData({
              studentName: '', dob: '', gender: 'Male', mobile: '', email: '', aadhaar: '', category: 'General', religion: 'Hindu', nationality: 'Indian', bloodGroup: 'O+',
              fatherName: '', fatherMobile: '', fatherOccupation: '', motherName: '', motherMobile: '', motherOccupation: '', guardianName: '', guardianMobile: '', annualIncome: '', parentEducation: '10th Pass',
              currentAddress: '', city: '', district: '', state: '', pincode: '', permanentAddress: '', permanentCity: '', permanentPincode: '',
              prevSchool: '', board: '', passingYear: '', percentage: '', qualification: '10th Pass', stream: 'Science', entranceName: '', entranceScore: '', rank: '', gapYear: 'No Gap',
              course: '', department: '', semester: '', admissionType: 'Regular', academicSession: defaultSession, hostelRequired: 'No', transportRequired: 'No', hostelType: '',
              scholarshipApplicable: 'No', incomeCertificateNo: '', casteCertificateNo: '',
              feePlan: 'Full Payment', paymentMode: 'Cash'
            }); 
            setUploadedDocs({}); 
          }}
            className="mt-6 bg-[#0A6C54] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#085a46]">
            New Admission
          </button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">New Admission</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Fill all details to create a new admission</p>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4 border-b border-gray-100 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <button
                onClick={() => {
                  // Only allow clicking backward or to the currently available step without validating forward skips
                  if (idx <= currentStep) setCurrentStep(idx);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                  idx === currentStep ? 'bg-[#0A6C54] text-white' :
                  idx < currentStep ? 'bg-green-100 text-green-700 cursor-pointer' :
                  'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60'
                }`}
                disabled={idx > currentStep}
              >
                {idx < currentStep ? <Check size={13} /> : <span>{idx + 1}</span>}
                {step}
              </button>
              {idx < steps.length - 1 && <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentStep < 9 && <h3 className="text-[15px] font-bold text-gray-800 mb-5">Step {currentStep + 1}: {steps[currentStep]}</h3>}
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep < 9 && !submitted && (
        <div className="p-6 border-t border-gray-100 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold"
          >
            {currentStep === 8 ? 'Submit Admission' : 'Next'}
          </button>
        </div>
      )}

      {/* Quick Add Modals */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Add New Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-5 space-y-4">
              <InputField label="Department Name" value={newDeptData.name} onChange={e => setNewDeptData({...newDeptData, name: e.target.value})} required />
              <InputField label="HOD Name" value={newDeptData.hod} onChange={e => setNewDeptData({...newDeptData, hod: e.target.value})} required />
              <button type="submit" disabled={isDeptSubmitting} className="w-full bg-[#0A6C54] text-white py-2.5 rounded-lg text-[13px] font-semibold">{isDeptSubmitting ? 'Adding...' : 'Add Department'}</button>
            </form>
          </div>
        </div>
      )}
      
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Add New Course</h3>
              <button onClick={() => setShowCourseModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Course Code" value={newCourseData.code} onChange={e => setNewCourseData({...newCourseData, code: e.target.value})} required />
                <InputField label="Course Name" value={newCourseData.name} onChange={e => setNewCourseData({...newCourseData, name: e.target.value})} required />
                <SelectField label="Department" options={departments.map(d => d.name || d.departmentName || d)} name="department" value={newCourseData.department} onChange={e => setNewCourseData({...newCourseData, department: e.target.value})} />
                <InputField label="Duration (Years)" type="number" value={newCourseData.duration} onChange={e => setNewCourseData({...newCourseData, duration: e.target.value})} required />
                <InputField label="Total Semesters" type="number" value={newCourseData.totalSemesters} onChange={e => setNewCourseData({...newCourseData, totalSemesters: e.target.value})} required />
              </div>
              <button type="submit" disabled={isCourseSubmitting} className="w-full bg-[#0A6C54] text-white py-2.5 rounded-lg text-[13px] font-semibold">{isCourseSubmitting ? 'Adding...' : 'Add Course'}</button>
            </form>
          </div>
        </div>
      )}

      {showSemModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Add New Semester</h3>
              <button onClick={() => setShowSemModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSemSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Semester Number" type="number" value={newSemData.semesterNumber} onChange={e => setNewSemData({...newSemData, semesterNumber: e.target.value})} required />
                <SelectField label="Course" options={courses.map(c => c.name || c.courseName || c.title || c)} name="courseName" value={newSemData.courseName} onChange={e => setNewSemData({...newSemData, courseName: e.target.value})} />
                <InputField label="Start Date" type="date" value={newSemData.startDate} onChange={e => setNewSemData({...newSemData, startDate: e.target.value})} required />
                <InputField label="End Date" type="date" value={newSemData.endDate} onChange={e => setNewSemData({...newSemData, endDate: e.target.value})} required />
              </div>
              <button type="submit" disabled={isSemSubmitting} className="w-full bg-[#0A6C54] text-white py-2.5 rounded-lg text-[13px] font-semibold">{isSemSubmitting ? 'Adding...' : 'Add Semester'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAdmission;
