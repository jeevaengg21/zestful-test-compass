import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchPriorities, 
  fetchStatuses, 
  refreshLookupData 
} from '@/store/slices/lookupSlice';
import { 
  selectAllPriorities, 
  selectAllStatuses, 
  selectLookupLoading, 
  selectLookupErrors,
  selectLookupLastFetched 
} from '@/store/selectors';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useLookupData = () => {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const priorities = useAppSelector(selectAllPriorities);
  const statuses = useAppSelector(selectAllStatuses);
  const loading = useAppSelector(selectLookupLoading);
  const errors = useAppSelector(selectLookupErrors);
  const lastFetched = useAppSelector(selectLookupLastFetched);

  // Initial data fetch
  useEffect(() => {
    const now = Date.now();
    const shouldFetchPriorities = !lastFetched.priorities || 
      (now - lastFetched.priorities) > REFRESH_INTERVAL;
    const shouldFetchStatuses = !lastFetched.statuses || 
      (now - lastFetched.statuses) > REFRESH_INTERVAL;

    if (shouldFetchPriorities && priorities.length === 0) {
      dispatch(fetchPriorities());
    }
    
    if (shouldFetchStatuses && statuses.length === 0) {
      dispatch(fetchStatuses({ category: 'test_case' }));
    }
  }, [dispatch, priorities.length, statuses.length, lastFetched]);

  // Set up automatic refresh
  useEffect(() => {
    const startAutoRefresh = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        dispatch(refreshLookupData());
      }, REFRESH_INTERVAL);
    };

    // Start auto-refresh only if we have initial data
    if (priorities.length > 0 && statuses.length > 0) {
      startAutoRefresh();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, priorities.length, statuses.length]);

  const refreshNow = () => {
    dispatch(refreshLookupData());
  };

  return {
    priorities,
    statuses,
    loading,
    errors,
    lastFetched,
    refreshNow,
    isLoading: loading.priorities || loading.statuses,
    hasErrors: !!(errors.priorities || errors.statuses)
  };
};