interface NeofetchProps {
  name: string;
  summary: string;
}

const asciiArt = `
      ██████╗ ██████╗
      ██╔═══╝ ██╔══██╗
      ██║     ██║  ██║
      ██║     ██║  ██║
      ██████╗ ██████╔╝
      ╚═════╝ ╚═════╝
`;

export const Neofetch = ({ name, summary }: NeofetchProps) => {
  const info = {
    User: name.split(" ")[0].toLowerCase(),
    Hostname: "portfolio.dev",
    OS: "WebApp OS x86_64",
    Kernel: "6.1.0-cd-generic",
    Shell: "react-bash 5.2.1",
    DE: "TailwindCSS",
    Terminal: "Browser",
    CPU: "Imagination @ 1.21GHz",
    Status: "Available for Hire",
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
      <pre className="text-sm font-bold text-[var(--color-text-primary)] leading-tight flex-shrink-0">
        {asciiArt}
      </pre>
      <div className="flex-grow">
        <div className="space-y-1 text-sm">
          {Object.entries(info).map(([key, value]) => (
            <div key={key}>
              <span className="font-bold text-[var(--color-text-primary)]">
                {key}:{" "}
              </span>
              <span className="text-[var(--color-text-secondary)]">
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-[var(--color-border)] pt-4">
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
};
