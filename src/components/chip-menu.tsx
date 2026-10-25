"use client";

import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type Option = { value: string; label: string };

/** Chip mit Icon, der ein Dropdown zur Auswahl öffnet. */
export function ChipMenu({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  align = "left",
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  align?: "left" | "right";
  highlight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-label={`${label}: ${current.label}`}
        aria-expanded={open}
        aria-controls={menuId}
        className={`flex max-w-full items-center gap-2 rounded-full border py-2 pr-3 pl-3.5 text-sm transition-colors ${
          highlight ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink"
        }`}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">
          <span className={`hidden sm:inline ${highlight ? "opacity-70" : "text-muted"}`}>{label}: </span>
          <span className="font-medium">{current.label}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          id={menuId}
          role="listbox"
          className={`absolute top-full z-30 mt-2 max-h-80 w-56 overflow-y-auto rounded-3xl border border-line bg-surface p-1.5 shadow-xl shadow-black/10 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <li role="presentation" className="px-3.5 pt-1.5 pb-1 text-xs font-medium tracking-wide text-muted uppercase">
            {label}
          </li>
          {options.map((option) => {
            const selected = option.value === current.value;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-full px-3.5 py-2 text-left text-sm ${
                    selected ? "bg-paper font-medium" : ""
                  }`}
                >
                  {option.label}
                  {selected && <Check className="size-4 text-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
