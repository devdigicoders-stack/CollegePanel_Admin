// Utility to check if a premium module is unlocked for the current college admin
export const isModuleUnlocked = (moduleKey) => {
  try {
    const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
    
    // If super admin or full premium is unlocked
    if (adminInfo.role === 'Super Admin' || adminInfo.isPremiumUnlocked) {
      return true;
    }

    const unlocked = adminInfo.unlockedModules || [];
    if (unlocked.includes('all')) {
      return true;
    }

    if (!moduleKey) return false;

    // Direct key match
    if (unlocked.includes(moduleKey)) {
      return true;
    }

    // Normalized matching
    const key = moduleKey.toLowerCase();
    if (key.includes('hostel') && unlocked.includes('hostel')) return true;
    if (key.includes('mess') && unlocked.includes('mess')) return true;
    if (key.includes('library') && unlocked.includes('library')) return true;
    if (key.includes('complaint') && unlocked.includes('complaints')) return true;
    if ((key.includes('security') || key.includes('visitor') || key.includes('in-out')) && (unlocked.includes('security') || unlocked.includes('hostel'))) return true;

    return false;
  } catch (e) {
    return false;
  }
};

export const getUnlockedModulesList = () => {
  try {
    const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
    if (adminInfo.isPremiumUnlocked || (adminInfo.unlockedModules || []).includes('all')) {
      return ['hostel', 'mess', 'library', 'complaints', 'security', 'all'];
    }
    return adminInfo.unlockedModules || [];
  } catch (e) {
    return [];
  }
};
