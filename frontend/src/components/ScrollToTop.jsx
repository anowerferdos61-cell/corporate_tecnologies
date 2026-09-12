import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically scrolls window to top on route change
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Use smooth scroll for better UX, but instant for initial mount/hard refreshes
    const isInitialLoad = !sessionStorage.getItem('ct_initial_load');
    
    if (isInitialLoad) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      sessionStorage.setItem('ct_initial_load', 'true');
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [pathname, search]);

  return null;
}

