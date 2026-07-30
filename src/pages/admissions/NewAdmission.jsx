import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Upload } from 'lucide-react';

const steps = ['Personal Details','Parent/Guardian','Address','Academic Details','Course Selection','Document Upload','Scholarship','Fee Plan','Review','Submit'];

const NewAdmission = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const SelectField = ({ label, options }) => (
    <div>
      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <select className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
          <option value="">Select {label}</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
      </div>
    </div>
  );

  const InputField = ({ label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Student Full Name" />
          <InputField label="Date of Birth" type="date" />
          <SelectField label="Gender" options={['Male','Female','Other']} />
          <InputField label="Mobile Number" />
          <InputField label="Email Address" />
          <InputField label="Aadhaar Number" />
          <SelectField label="Category" options={['General','OBC','SC','ST','EWS']} />
          <SelectField label="Religion" options={['Hindu','Muslim','Christian','Sikh','Other']} />
          <InputField label="Nationality" placeholder="Indian" />
          <SelectField label="Blood Group" options={['A+','A-','B+','B-','O+','O-','AB+','AB-']} />
        </div>
      );
      case 1: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Father's Name" />
          <InputField label="Father's Mobile" />
          <InputField label="Father's Occupation" />
          <InputField label="Mother's Name" />
          <InputField label="Mother's Mobile" />
          <InputField label="Mother's Occupation" />
          <InputField label="Guardian Name (if different)" />
          <InputField label="Guardian Mobile" />
          <InputField label="Annual Family Income" />
          <SelectField label="Parent Education" options={['Below 10th','10th Pass','12th Pass','Graduate','Post Graduate']} />
        </div>
      );
      case 2: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><InputField label="Current Address" /></div>
          <InputField label="City" />
          <InputField label="District" />
          <InputField label="State" />
          <InputField label="PIN Code" />
          <div className="md:col-span-2"><InputField label="Permanent Address (if different)" /></div>
          <InputField label="Permanent City" />
          <InputField label="Permanent PIN Code" />
        </div>
      );
      case 3: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Previous School/College Name" />
          <InputField label="Board/University" />
          <InputField label="Passing Year" />
          <InputField label="Percentage/CGPA" />
          <SelectField label="Qualification" options={['10th Pass','12th Pass','Diploma','Graduate']} />
          <SelectField label="Stream" options={['Science','Commerce','Arts','Vocational']} />
          <InputField label="Entrance Exam Name (if any)" />
          <InputField label="Entrance Exam Score" />
          <InputField label="Rank (if any)" />
          <SelectField label="Gap Year" options={['No Gap','1 Year','2 Years','More than 2 Years']} />
        </div>
      );
      case 4: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Course" options={['Diploma in CE','Diploma in IT','Diploma in ME','Diploma in EE']} />
          <SelectField label="Department" options={['Civil Engineering','Information Technology','Mechanical Engineering','Electrical Engineering']} />
          <SelectField label="Semester" options={['1st Semester','2nd Semester','3rd Semester (Lateral Entry)']} />
          <SelectField label="Admission Type" options={['Regular','Lateral Entry','Management Quota','NRI Quota']} />
          <SelectField label="Academic Session" options={['2024-25','2025-26']} />
          <SelectField label="Hostel Required" options={['Yes','No']} />
          <SelectField label="Transport Required" options={['Yes','No']} />
          <InputField label="Preferred Hostel Type" placeholder="e.g. Single Room" />
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
                  <p className="text-[11px] text-gray-500">PDF, JPG, PNG • Max 2MB</p>
                </div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 flex items-center gap-1.5">
                  <Upload size={13} /> Upload
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </div>
      );
      case 6: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Scholarship Applicable" options={['Yes','No']} />
          <SelectField label="Scholarship Type" options={['Government','College','Merit','Sports','Other']} />
          <InputField label="Scholarship Scheme Name" />
          <InputField label="Annual Family Income" />
          <InputField label="Expected Scholarship Amount" />
          <SelectField label="Scholarship Status" options={['Applied','Approved','Pending','Not Applied']} />
          <div className="md:col-span-2">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Scholarship Documents</label>
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0A6C54] transition-colors">
              <Upload size={20} className="mx-auto text-gray-400 mb-2" />
              <p className="text-[13px] text-gray-600">Upload scholarship documents</p>
              <input type="file" className="hidden" />
            </div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Fee Plan" options={['Full Payment','2 Installments','3 Installments','4 Installments']} />
            <SelectField label="Payment Mode" options={['Cash','UPI','Bank Transfer','Cheque','DD']} />
          </div>
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="text-[14px] font-bold text-gray-800 mb-4">Fee Breakdown</h4>
            <div className="space-y-2">
              {[
                { label: 'Admission Fee', amount: '₹5,000' },
                { label: 'Tuition Fee', amount: '₹25,000' },
                { label: 'Registration Fee', amount: '₹2,000' },
                { label: 'Exam Fee', amount: '₹1,500' },
                { label: 'Lab Fee', amount: '₹3,000' },
                { label: 'Library Fee', amount: '₹1,000' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-[13px] text-gray-600">{item.label}</span>
                  <span className="text-[13px] font-semibold text-gray-800">{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 pt-3">
                <span className="text-[14px] font-bold text-gray-800">Total</span>
                <span className="text-[14px] font-bold text-[#0A6C54]">₹37,500</span>
              </div>
            </div>
          </div>
        </div>
      );
      case 8: return (
        <div className="space-y-6">
          <p className="text-[13px] text-gray-600">Please review all details before submitting.</p>
          {[
            { title: 'Personal Details', items: [['Name','Aarav Singh'],['DOB','2006-05-15'],['Gender','Male'],['Mobile','9876543210'],['Category','General']] },
            { title: 'Course Details', items: [['Course','Diploma in CE'],['Session','2024-25'],['Admission Type','Regular'],['Hostel','Yes']] },
            { title: 'Fee Details', items: [['Total Fee','₹37,500'],['Fee Plan','2 Installments'],['Payment Mode','UPI']] },
          ].map(section => (
            <div key={section.title} className="bg-gray-50 rounded-xl p-5">
              <h4 className="text-[14px] font-bold text-gray-800 mb-3">{section.title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {section.items.map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] text-gray-500">{label}</p>
                    <p className="text-[13px] font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
      case 9: return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-600" />
          </div>
          <h3 className="text-[20px] font-bold text-gray-800 mb-2">Admission Submitted Successfully!</h3>
          <p className="text-[14px] text-gray-600 mb-6">Application No: <span className="font-bold text-[#0A6C54]">APP/2024/089</span></p>
          <p className="text-[13px] text-gray-500">The admission will be reviewed and you will be notified once approved.</p>
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
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                  idx === currentStep ? 'bg-[#0A6C54] text-white' :
                  idx < currentStep ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-500'
                }`}
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
        <h3 className="text-[15px] font-bold text-gray-800 mb-5">Step {currentStep + 1}: {steps[currentStep]}</h3>
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep < 9 && (
        <div className="p-6 border-t border-gray-100 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold"
          >
            {currentStep === 8 ? 'Submit Admission' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewAdmission;
