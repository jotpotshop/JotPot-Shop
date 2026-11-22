import React, { useEffect, useState } from 'react';
import { formatDynamicBangladeshDateGreeting } from '../utils/bangladeshDate';

const DISPLAY_DURATION_MS = 3800;
const TRANSITION_DURATION_MS = 320;

export const HeaderGreeting: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dateMessage, setDateMessage] = useState(() =>
    formatDynamicBangladeshDateGreeting(new Date())
  );

  // Refresh dynamic Bangladesh date periodically so overnight sessions roll seamlessly
  useEffect(() => {
    const refreshDate = () => {
      const next = formatDynamicBangladeshDateGreeting(new Date());
      setDateMessage(prev => (prev !== next ? next : prev));
    };

    const clockInterval = window.setInterval(refreshDate, 60_000);
    return () => window.clearInterval(clockInterval);
  }, []);

  // Respect prefers-reduced-motion; smoothly fade-slide between the 3 messages
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let fadeTimer: number | undefined;
    const cycleTimer = window.setInterval(() => {
      if (prefersReduced) {
        setActiveIndex(prev => (prev + 1) % 3);
        return;
      }
      setIsTransitioning(true);
      fadeTimer = window.setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % 3);
        setIsTransitioning(false);
      }, TRANSITION_DURATION_MS);
    }, DISPLAY_DURATION_MS);

    return () => {
      window.clearInterval(cycleTimer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, []);

  const messages = [
    'আসসালামু আলাইকুম স্যার😊',
    dateMessage,
    'আপনার দিনটা শুভ হোক🥰',
  ];

  const currentMessage = messages[activeIndex] || messages[0];

  return (
    <div
      className="mt-1 min-h-[18px] flex items-center max-w-full overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <p
        className={`text-[10.5px] sm:text-[11.5px] font-medium text-[#4b5563] leading-snug tracking-normal transition-all duration-300 ease-out truncate sm:whitespace-normal ${
          isTransitioning
            ? 'opacity-0 translate-y-1'
            : 'opacity-100 translate-y-0'
        }`}
        title={currentMessage}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-[#881337] mr-1.5 align-middle shrink-0"
          aria-hidden="true"
        />
        <span>{currentMessage}</span>
      </p>
    </div>
  );
};
