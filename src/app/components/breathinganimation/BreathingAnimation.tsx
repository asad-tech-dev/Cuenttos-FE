'use client';

import { useEffect, useState } from 'react';
import './breathing.css';

const phases = [
  { label: 'Inhale', duration: 4000 },
  { label: 'Hold', duration: 3000 },
  { label: 'Exhale', duration: 4000 },
  { label: 'Hold', duration: 3000 },
];

export default function BreathingAnimation() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const current = phases[phaseIndex];
    const timeout = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, current.duration);

    return () => clearTimeout(timeout);
  }, [phaseIndex]);

  const strokeOffset =
    phaseIndex === 0
      ? circumference
      : phaseIndex === 1
      ? circumference / 2
      : 0;

  return (
    <div className="flex justify-center items-center">
      <div
        className="relative w-[250px] h-[250px]"
      >

        <div className="absolute inset-0 rounded-full bg-violet-2/10 backdrop-blur-xs flex items-center justify-center">
          <span className="text-xl font-semibold text-white">
            {phases[phaseIndex].label}
          </span>
        </div>

        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#5d4dbe"
            strokeWidth="8"
            opacity="0.4"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#5d4dbe"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className={`breathing-stroke stroke-animate-${phaseIndex}`}
            transform="rotate(-90 100 100)"
          />
        </svg>
      </div>
    </div>
  );
}
