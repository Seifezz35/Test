import { useEffect, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  formatter?: (value: number) => string;
};

export const AnimatedNumber = ({ value, formatter = (input) => input.toString() }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startTime = 0;
    const duration = 700;

    const tick = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(value * progress);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{formatter(displayValue)}</span>;
};
