const fs = require('fs');

let content = fs.readFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/components/Sidebar.jsx', 'utf8');

const target = \  const filteredMenuGroups = menuGroups.filter(group => {
    if (group.name === 'Main' || group.name === 'Other') {
      if (userRole === 'Student') {
        return group.name === 'Main';
      }
      return true;
    }
    if (userRole === 'college_admin' || userRole === 'Principal') {
      return true;
    }
    
    const roleMapping = {
      'HOD': ['Academic'],
      'Teacher': ['Academic'],
      'Accountant': ['Financial'],
      'Librarian': ['Library'],
      'Hostel Warden': ['Hostel Warden'],
      'Mess Manager': ['Mess'],
      'Lab Assistant': ['Lab'],
      'Workshop Instructor': ['Workshop'],
      'Placement Officer': ['Placement'],
      'Scholarship Coordinator': ['Scholarship'],
      'Receptionist': ['Receptionist'],
      'Security/Gate Operator': ['Security'],
      'Student': ['Student Portal']
    };
    
    const allowedGroups = roleMapping[userRole] || [];
    return allowedGroups.includes(group.name);
  });\;

const replacement = \  const userPermissions = adminInfo.permissions || [];
  
  const filteredMenuGroups = menuGroups.map(group => {
    // Principal and college_admin see everything
    if (userRole === 'college_admin' || userRole === 'Principal') {
      return group;
    }
    
    // Students see Main and Student Portal
    if (userRole === 'Student') {
      if (group.name === 'Main' || group.name === 'Student Portal') return group;
      return null;
    }

    // Role-Based Access Control logic based on permissions array
    if (group.name === 'Main') return group; // Dashboard is usually visible or controlled by 'View Dashboard'
    
    // Group to Permission mapping
    const groupPermissionCategories = {
      'Admissions': ['View Admissions', 'Add Admission', 'Edit Admission', 'Delete Admission', 'Approve Admission'],
      'Financial': ['View Fees', 'Collect Fees', 'Generate Receipt', 'View Fee Reports', 'Manage Fee Structure'],
      'Academic': ['View Students', 'Add Student', 'Edit Student', 'Delete Student', 'Export Students', 'View Teachers', 'Add Teacher', 'Edit Teacher', 'Delete Teacher', 'Assign Subjects', 'View Courses', 'Manage Courses', 'View Departments', 'Manage Departments', 'View Subjects', 'Manage Subjects', 'View Sections', 'Manage Sections', 'View Attendance', 'Mark Attendance', 'Edit Attendance', 'View Attendance Reports', 'View Exams', 'Create Exam', 'Edit Exam', 'Delete Exam', 'Enter Marks', 'View Results'],
      'HR & Admin': ['View Employees', 'Add Employee', 'Edit Employee', 'Delete Employee', 'View Credentials', 'Manage Roles', 'Manage Permissions', 'System Configuration'],
      'Library': ['View Books', 'Add Book', 'Edit Book', 'Delete Book', 'Issue Book', 'Return Book'],
      'Hostel Warden': ['View Hostels', 'Manage Rooms', 'Manage Allocations', 'View Hostel Reports'],
      'Security': ['View Security Dashboard', 'Log Student Entry/Exit', 'Scan Gate Pass', 'Log Vehicle Registry', 'Log Security Incident'],
      'Student Portal': ['View Portal Dashboard', 'Submit Course Assignments', 'View Semester Results', 'Pay Fees Online', 'Apply For Outings'],
      'Other': ['View All Reports', 'Export Reports', 'Generate Custom Reports']
    };

    const categoryPermissions = groupPermissionCategories[group.name];
    if (categoryPermissions) {
      // If the user has AT LEAST ONE permission related to this group, show the group
      const hasPermission = categoryPermissions.some(p => userPermissions.includes(p));
      if (hasPermission) return group;
    }
    
    return null;
  }).filter(Boolean);\;

content = content.replace(target, replacement);

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/components/Sidebar.jsx', content, 'utf8');
console.log('Sidebar.jsx successfully patched via node');
