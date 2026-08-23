"use client";

import { useState } from "react";

interface EntityInputProps {
  onSubmit: (entity: string) => void;
  disabled: boolean;
  /** Pre-fill with the last queried entity when returning to idle after results */
  initialValue?: string;
}

export function EntityInput({
  onSubmit,
  disabled,
  initialValue = "",
}: EntityInputProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
  };

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <div className="relative flex-1">
        <input
          id="entity-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a brand or entity name…"
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-md
            bg-card text-foreground
            border border-border
            placeholder:text-muted-foreground/60
            focus:outline-none focus:ring-1 focus:ring-muted-foreground/40 focus:border-muted-foreground/40
            disabled:opacity-50 disabled:cursor-not-allowed
            text-sm font-sans
            transition-colors duration-200
          `}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <button
        id="run-button"
        type="submit"
        disabled={!canSubmit}
        className={`
          px-5 py-3 rounded-md
          font-data text-sm font-medium tracking-wide
          transition-all duration-200
          cursor-pointer
          ${
            canSubmit
              ? "bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/80"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }
        `}
      >
        Run Analysis
      </button>
    </form>
  );
}
