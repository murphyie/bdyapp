import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/hooks/useBirthdayData';

export function useCelebrationAccess() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  
  // Parse birthday date from settings, fallback to January 18, 2026
  const birthdayDate = useMemo(() => {
    if (settings?.birthday_date) {
      // Parse the date string (format: YYYY-MM-DD)
      const [year, month, day] = settings.birthday_date.split('-').map(Number);
      // Create date at midnight local time
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    return new Date(2026, 0, 18, 0, 0, 0, 0);
  }, [settings?.birthday_date]);
  
  const [accessState, setAccessState] = useState<{
    hasAccess: boolean;
    checked: boolean;
  }>({ hasAccess: false, checked: false });

  useEffect(() => {
    // Don't check access until settings are loaded
    if (settingsLoading) {
      return;
    }
    
    const checkAccess = () => {
      const now = new Date();
      
      // Compare dates properly - birthday is reached if current date >= birthday date
      const dateReached = now >= birthdayDate;
      
      // Testing mode bypasses date check
      const testingEnabled = settings?.testing_mode === true;
      
      const access = dateReached || testingEnabled;
      
      setAccessState({ hasAccess: access, checked: true });
    };
    
    // Check immediately
    checkAccess();
    
    // Re-check every second (for countdown and date change)
    const interval = setInterval(checkAccess, 1000);
    return () => clearInterval(interval);
  }, [settings, settingsLoading, birthdayDate]);

  // Still loading if settings are loading OR if access hasn't been checked yet
  const isLoading = settingsLoading || !accessState.checked;

  return { 
    hasAccess: accessState.hasAccess, 
    isLoading, 
    birthdayDate,
    isTestingMode: settings?.testing_mode === true,
    settings
  };
}
