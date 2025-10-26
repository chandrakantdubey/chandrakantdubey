import { useState, useEffect } from "react";

interface BottomStatusBarProps {
  currentTheme: string;
  currentSection: string;
  sections: string[];
  onNavigate: (sectionId: string) => void;
}

const BottomStatusBar = ({
  currentTheme,
  currentSection,
  sections,
  onNavigate,
}: BottomStatusBarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 md:h-8 bg-[var(--color-primary)] text-[var(--color-bg-alt)] z-50 flex items-center justify-between px-2 md:px-4 text-xs md:text-sm font-bold">
      <div className="flex items-center gap-1 md:gap-2">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => onNavigate(section)}
            className={`px-2 py-1 rounded-md transition-colors duration-200 ${
              currentSection === section
                ? "bg-black/50 text-white"
                : "hover:bg-black/20"
            }`}
          >
            {section.replace("-", " ").toUpperCase()}
          </button>
        ))}
      </div>
      <div className="hidden md:flex items-center gap-4">
        <span>{`THEME: ${currentTheme.toUpperCase()}`}</span>
        <span>{formatTime(time)}</span>
      </div>
    </footer>
  );
};

export default BottomStatusBar;
