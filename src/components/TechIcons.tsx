export function TechIcon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const normalized = name.toLowerCase();

  // Python
  if (normalized.includes("python")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M63.7 2c-31 0-29.2 13.4-29.2 13.4l.1 13.9h29.6v4.2H21.8S2 31.6 2 63.8c0 32.2 17.3 31.1 17.3 31.1h10.3V80.5s-.6-17.3 17-17.3h29.4s16.4.3 16.4-16.1V18.1S94.2 2 63.7 2zm-16.1 9.4a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8z" fill="#387eb8" />
        <path d="M64.3 126c31 0 29.2-13.4 29.2-13.4l-.1-13.9H63.8v-4.2h42.4s19.8 1.9 19.8-30.3c0-32.2-17.3-31.1-17.3-31.1h-10.3v14.4s.6 17.3-17 17.3H52s-16.4-.3-16.4 16.1v29s-1.8 16.1 28.7 16.1zm16.1-9.4a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8z" fill="#ffe052" />
      </svg>
    );
  }

  // TypeScript
  if (normalized.includes("typescript")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="16" fill="#3178c6" />
        <path d="M70.9 88.5c2.3 3.9 6.2 6.6 11.5 6.6 6.3 0 10.3-3.4 10.3-8.1 0-5.4-4.4-7.4-12.2-10.8-11.2-4.9-16.4-10.4-16.4-20.5 0-11.2 8.9-19.4 22.8-19.4 9.9 0 17 3.9 21.2 11.7l-9.7 6.2c-2.4-4.5-5.5-6.6-11.5-6.6-5.8 0-9.2 3.3-9.2 7.4 0 4.8 3.6 6.9 11.5 10.3 12.3 5.3 17.2 10.9 17.2 21.3 0 12.8-9.9 20.3-24.6 20.3-12.9 0-21.6-5.9-25.7-14.7l14.8-3.7zM24 49h39.4v12.2H49.8v43.5H33.6V61.2H24V49z" fill="#ffffff" />
      </svg>
    );
  }

  // JavaScript
  if (normalized.includes("javascript")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="16" fill="#f7df1e" />
        <path d="M33.4 98.7c2.6 4.3 6.6 7.4 13.5 7.4 7.7 0 12.5-4 12.5-12.8V49.2H46.7v44c0 3.3-1.6 4.8-4.7 4.8-2.6 0-4.3-1.4-5.6-3.8l-3 4.5zM75.2 96.6c3.2 5.3 8.8 9.5 17.7 9.5 10.4 0 17.2-5.4 17.2-13.6 0-8.9-6.4-12.3-17.7-17.1-8.5-3.6-12.2-6.5-12.2-11.7 0-4.9 3.8-8.7 10.4-8.7 5.9 0 9.8 2.3 12.8 7.3l8.9-5.7c-4.9-8.4-12.5-12.3-21.7-12.3-12.4 0-20.7 7.7-20.7 18.5 0 11.2 7.1 16.3 17.9 20.8 9 3.8 13.2 6.8 13.2 12.4 0 5.6-5 9.3-11.8 9.3-8.2 0-13.1-4.6-16.1-10.4l-7.9 5.7z" fill="#000000" />
      </svg>
    );
  }

  // React
  if (normalized.includes("react")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <ellipse cx="64" cy="64" rx="20" ry="52" stroke="#61dafb" strokeWidth="6" transform="rotate(30 64 64)" />
        <ellipse cx="64" cy="64" rx="20" ry="52" stroke="#61dafb" strokeWidth="6" transform="rotate(90 64 64)" />
        <ellipse cx="64" cy="64" rx="20" ry="52" stroke="#61dafb" strokeWidth="6" transform="rotate(150 64 64)" />
        <circle cx="64" cy="64" r="10" fill="#61dafb" />
      </svg>
    );
  }

  // FastAPI
  if (normalized.includes("fastapi")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <circle cx="64" cy="64" r="60" fill="#059669" />
        <path d="M72 16L32 72h24l-8 40 48-56H72l8-40z" fill="#ffffff" />
      </svg>
    );
  }

  // Node.js
  if (normalized.includes("node")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M64 4l52 30v60l-52 30-52-30V34L64 4z" fill="#339933" />
        <path d="M64 16l42 24v48L64 112 22 88V40l42-24z" fill="#222222" />
        <path d="M54 44v34l22-12V44l-22 12z" fill="#83cd29" />
      </svg>
    );
  }

  // Next.js
  if (normalized.includes("next")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <circle cx="64" cy="64" r="60" fill="#000000" stroke="#3b82f6" strokeWidth="3" />
        <path d="M44 40v48h10V56.2l32.2 31.8h8.8V40H85v31.8L52.8 40H44z" fill="#ffffff" />
      </svg>
    );
  }

  // Docker
  if (normalized.includes("docker")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <rect x="36" y="38" width="16" height="14" rx="2" fill="#2496ed" />
        <rect x="56" y="38" width="16" height="14" rx="2" fill="#2496ed" />
        <rect x="76" y="38" width="16" height="14" rx="2" fill="#2496ed" />
        <rect x="16" y="56" width="16" height="14" rx="2" fill="#2496ed" />
        <rect x="36" y="56" width="16" height="14" rx="2" fill="#2496ed" />
        <rect x="56" y="56" width="16" height="14" rx="2" fill="#2496ed" />
        <rect x="76" y="56" width="16" height="14" rx="2" fill="#2496ed" />
        <rect x="96" y="56" width="16" height="14" rx="2" fill="#2496ed" />
        <path d="M124 68c-2.4-1.2-11.4-1.8-17.6 3.4-3.8-3.4-9.6-4.6-15.6-3.8-5.6-18-20.2-22-20.2-22s-2.6 9-2.2 16.6c-5.8 3.4-10.4 9.2-13.6 15.8H4C1.8 78 0 83.2 0 88.8c0 20.4 17.6 36.8 39.2 36.8 36.2 0 66.8-21.4 75.8-49.8 4.2.4 8.6-.2 9-7.8z" fill="#2496ed" />
      </svg>
    );
  }

  // AWS
  if (normalized.includes("aws")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M39 42h13l12 36 12-36h13l-19 50H58L39 42z" fill="#ffffff" />
        <path d="M22 96c26 18 64 18 84 0 3-2 6 2 4 4-22 20-66 20-92 0-3-2 1-6 4-4z" fill="#ff9900" />
      </svg>
    );
  }

  // PostgreSQL
  if (normalized.includes("postgres")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M64 12c-28 0-48 18-48 44 0 20 12 34 26 40v20l18-12c1.3.1 2.6.2 4 .2 28 0 48-18 48-44s-20-48-48-48z" fill="#336791" />
        <circle cx="50" cy="46" r="6" fill="#ffffff" />
        <circle cx="78" cy="46" r="6" fill="#ffffff" />
        <path d="M52 74c8 8 16 8 24 0" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // Oracle Database
  if (normalized.includes("oracle")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M42 28h44c23 0 42 16 42 36s-19 36-42 36H42C19 100 0 84 0 64s19-36 42-36zm44 56c14 0 24-8.8 24-20s-10-20-24-20H42C28 44 18 52.8 18 64s10 20 24 20h44z" fill="#f80000" />
      </svg>
    );
  }

  // Redis
  if (normalized.includes("redis")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M16 40l48-24 48 24-48 24-48-24z" fill="#dc382d" />
        <path d="M16 40v48l48 24V64L16 40z" fill="#a41e11" />
        <path d="M112 40v48l-48 24V64l48-24z" fill="#c62828" />
        <circle cx="64" cy="40" r="8" fill="#ffffff" opacity="0.8" />
      </svg>
    );
  }

  // Tailwind CSS
  if (normalized.includes("tailwind")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M32 48c5.3-21.3 21.3-26.7 37.3-16 10.7 7.1 16 16 26.7 16 8 0 16-5.3 21.3-16-5.3 21.3-21.3 26.7-37.3 16-10.7-7.1-16-16-26.7-16-8 0-16 5.3-21.3 16zm-32 32c5.3-21.3 21.3-26.7 37.3-16 10.7 7.1 16 16 26.7 16 8 0 16-5.3 21.3-16-5.3 21.3-21.3 26.7-37.3 16-10.7-7.1-16-16-26.7-16-8 0-16 5.3-21.3 16z" fill="#38bdf8" />
      </svg>
    );
  }

  // Redux
  if (normalized.includes("redux")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <circle cx="64" cy="64" r="50" fill="#764abc" />
        <path d="M42 42c12-12 32-12 44 0s12 32 0 44-32 12-44 0" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        <circle cx="64" cy="64" r="12" fill="#ffffff" />
      </svg>
    );
  }

  // MongoDB
  if (normalized.includes("mongo")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M64 4c-4 32-28 44-28 72 0 24 16 48 28 48s28-24 28-48c0-28-24-40-28-72z" fill="#47a248" />
        <path d="M64 4v120c12 0 28-24 28-48 0-28-24-40-28-72z" fill="#499d4a" />
      </svg>
    );
  }

  // SQLite
  if (normalized.includes("sqlite")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <path d="M20 30c0-12 20-20 44-20s44 8 44 20v68c0 12-20 20-44 20s-44-8-44-20V30z" fill="#003b57" />
        <path d="M20 30c0 12 20 20 44 20s44-8 44-20" fill="#00adef" />
        <ellipse cx="64" cy="30" rx="44" ry="20" fill="#00adef" />
      </svg>
    );
  }

  // Applied AI / Machine Learning
  if (normalized.includes("ai") || normalized.includes("ml") || normalized.includes("inference") || normalized.includes("llm") || normalized.includes("rag")) {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="24" fill="#6366f1" />
        <circle cx="64" cy="64" r="28" stroke="#ffffff" strokeWidth="6" />
        <circle cx="64" cy="64" r="12" fill="#ffffff" />
        <line x1="64" y1="12" x2="64" y2="36" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <line x1="64" y1="92" x2="64" y2="116" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <line x1="12" y1="64" x2="36" y2="64" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <line x1="92" y1="64" x2="116" y2="64" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }

  // Default fallback code icon
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}
