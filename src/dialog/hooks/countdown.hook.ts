import { useEffect, useState } from 'react';

export const useCountdown = (seconds: number, onRefresh: () => void) => {
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (autoRefreshCountdown === null) {
      return;
    }

    if (autoRefreshCountdown === 0) {
      setAutoRefreshCountdown(seconds);
      onRefresh();
      return;
    }

    const a = setTimeout(() => {
      setAutoRefreshCountdown(autoRefreshCountdown! - 1);
    }, 1000);

    return () => {
      clearTimeout(a);
    };
  }, [autoRefreshCountdown]);

  const refreshCountdown = () => {
    setAutoRefreshCountdown(seconds);
  };
  const nullifyCountdown = () => {
    setAutoRefreshCountdown(null);
  };
  return {
    countdown: autoRefreshCountdown,
    refreshCountdown,
    nullifyCountdown,
  };
};
