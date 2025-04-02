import { useEffect, useRef, useState } from 'react';

export const useBackToTop = () => {
  const [displayScrollToTop, setDisplayBackToTop] = useState(false);

  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (list.current !== null && list.current !== undefined) {
      list.current.onscroll = (event: any) => handleScroll(event);
    }
  }, [list]);

  const handleScroll = (event: any) => {
    setDisplayBackToTop(event.target.scrollTop !== 0);
  };

  return {
    displayScrollToTop,
    list,
    handleScroll,
  };
};
