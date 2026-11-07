export function ChakraIcon({ className = "w-6 h-6", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg
      className={`${className} ${animated ? "animate-[spin_40s_linear_infinite]" : ""}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer concentric rings */}
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
      {/* Central hub */}
      <circle cx="50" cy="50" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="4.5" fill="currentColor" />
      {/* 24 radial spokes (each 15 degrees) */}
      {[...Array(24)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2="50"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${i * 15} 50 50)`}
          strokeDasharray="38"
          strokeDashoffset="-11"
        />
      ))}
    </svg>
  );
}
