import { useState, useEffect } from "react";

const bootMessages = [
  "Initiating boot sequence...",
  "Loading kernel modules...",
  "[ OK ] Kernel loaded.",
  "Mounting virtual filesystem...",
  "[ OK ] Filesystem mounted at /dev/root.",
  "Starting network services...",
  "[ OK ] Network interface eth0 configured.",
  "Pinging portfolio.dev...",
  "Pong! Connection established.",
  "Initializing UI components...",
  "[ OK ] UI initialized.",
  "Compiling JIT assets...",
  "Launching graphical shell...",
  "Welcome, user.",
];

interface BootloaderProps {
  onBootComplete: () => void;
}

export const Bootloader = ({ onBootComplete }: BootloaderProps) => {
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const totalDuration = 4000;
    const interval = totalDuration / bootMessages.length;

    bootMessages.forEach((msg, index) => {
      setTimeout(() => {
        setLog((prev) => [...prev, msg]);
        setProgress(Math.round(((index + 1) / bootMessages.length) * 100));
      }, index * interval);
    });

    setTimeout(() => {
      setIsFading(true);
      setTimeout(onBootComplete, 500);
    }, totalDuration);
  }, [onBootComplete]);

  const progressBarWidth = 50;
  const filledChars = Math.round((progress / 100) * progressBarWidth);
  const emptyChars = progressBarWidth - filledChars;

  return (
    <div
      id="bootloader"
      className={`fixed inset-0 bg-[var(--color-bg-alt)] text-[var(--color-text-primary)] font-mono flex flex-col justify-between p-4 z-[100] ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div>
        {log.map((line, index) => (
          <p key={index} className="text-sm md:text-base">
            &gt; {line}
          </p>
        ))}
        {log.length < bootMessages.length && (
          <span className="w-2 h-5 bg-[var(--color-primary)] animate-blink inline-block ml-2"></span>
        )}
      </div>

      <div className="w-full">
        <p className="text-center">Loading system... {progress}%</p>
        <div className="w-full flex justify-center mt-2">
          <span className="text-[var(--color-text-primary)]">
            [{"█".repeat(filledChars)}
            {"-".repeat(emptyChars)}]
          </span>
        </div>
      </div>
    </div>
  );
};
