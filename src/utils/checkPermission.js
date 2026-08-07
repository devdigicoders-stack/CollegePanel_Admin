export const checkPermission = (requiredPermission) => {
  try {
    const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
    
    // college_admin, Admin, and College Admin always have all permissions
    if (adminInfo.role === 'college_admin' || adminInfo.role === 'Admin' || adminInfo.role === 'College Admin') {
      return true;
    }

    // Default to empty array if no permissions are found
    const userPermissions = adminInfo.permissions || [];
    
    // Check if the exact permission string exists in the user's permissions array
    return userPermissions.includes(requiredPermission);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};
