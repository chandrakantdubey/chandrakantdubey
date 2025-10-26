
import React, { useState } from 'react';

interface TerminalWindowProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
  onCommand?: (command: string) => void;
  autoFocus?: boolean;
  className?: string;
}

export const TerminalWindow = ({ title, icon, children, fullWidth = false, onCommand, autoFocus = false, className }: TerminalWindowProps) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onCommand) {
      e.preventDefault();
      onCommand(input);
      setInput('');
    }
  };
  
  return (
    <div className={`
      border border-[var(--color-border)] rounded-lg 
      shadow-[0_0_25px_var(--color-shadow)] bg-black/70 backdrop-blur-sm
      flex flex-col
      ${fullWidth ? 'w-full' : ''}
      ${className || ''}
    `}>
      <div className="flex items-center justify-between bg-gray-900/50 border-b border-[var(--color-border)] px-4 py-2 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <p className="text-sm text-[var(--color-text-tertiary)]">terminal@portfolio</p>
        <div className="w-16"></div> {/* Spacer */}
      </div>
      <div className="p-4 md:p-6 font-mono flex-grow flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 text-[var(--color-text-primary)] mb-4 flex-shrink-0">
          {icon}
          <span className="text-[var(--color-text-tertiary)]">$</span>
          <span>{title}</span>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          {children}
        </div>
        <div className="mt-4 flex gap-2 items-center flex-shrink-0">
            <span className="text-[var(--color-text-primary)]">$</span>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none p-0 text-[var(--color-text-primary)] focus:outline-none focus:ring-0 terminal-input"
                spellCheck="false"
                autoComplete="off"
                autoFocus={autoFocus}
                placeholder="Enter a command... (try 'help')"
            />
        </div>
      </div>
    </div>
  );
};
