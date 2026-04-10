import { useEffect, useRef, useState } from "react";

export const usePullToRefresh = (onRefresh: () => Promise<void> | void) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const distanceRef = useRef(0);

  useEffect(() => {
    let startY = 0;
    let dragging = false;

    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 0) return;
      dragging = true;
      startY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!dragging) return;
      const next = Math.max(0, event.touches[0].clientY - startY);
      distanceRef.current = Math.min(next, 100);
      setPullDistance(Math.min(next, 100));
    };

    const handleTouchEnd = async () => {
      if (!dragging) return;
      dragging = false;

      if (distanceRef.current > 70) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }

      distanceRef.current = 0;
      setPullDistance(0);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh]);

  return {
    pullDistance,
    refreshing
  };
};
