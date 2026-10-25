"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

let nextId = 0;
const row = (text = "") => ({ id: nextId++, text });

/**
 * Eingabe als Liste: ein Feld pro Eintrag, mit Hinzufügen und Entfernen.
 * Wird als ein verstecktes Feld (Einträge zeilenweise) mit dem Formular abgeschickt.
 */
export function ListInput({
  name,
  initial,
  placeholder,
  addLabel,
}: {
  name: string;
  initial: string[];
  placeholder: string;
  addLabel: string;
}) {
  const [items, setItems] = useState(() => (initial.length ? initial.map((text) => row(text)) : [row()]));
  const [focusId, setFocusId] = useState<number | null>(null);
  const fields = useRef(new Map<number, HTMLInputElement>());

  useEffect(() => {
    if (focusId !== null) fields.current.get(focusId)?.focus();
  }, [focusId]);

  function insertAfter(index: number) {
    const added = row();
    setItems((current) => [...current.slice(0, index + 1), added, ...current.slice(index + 1)]);
    setFocusId(added.id);
  }

  function remove(index: number) {
    setItems((current) => (current.length === 1 ? [row()] : current.filter((_, i) => i !== index)));
  }

  function update(index: number, text: string) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, text } : item)));
  }

  // Enter springt in ein neues Feld.
  function onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      insertAfter(index);
    }
  }

  const value = items
    .map((item) => item.text.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .join("\n");

  const fieldClass =
    "min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 py-2.5 outline-none placeholder:text-muted/70 focus:border-accent";

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-start gap-2">
            <input
              ref={(el) => {
                if (el) fields.current.set(item.id, el);
                else fields.current.delete(item.id);
              }}
              value={item.text}
              onChange={(e) => update(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
              enterKeyHint="next"
              placeholder={index === 0 ? placeholder : ""}
              aria-label={`Zutat ${index + 1}`}
              className={fieldClass}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label="Entfernen"
              className="mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-full text-muted"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => insertAfter(items.length - 1)}
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-4 py-2 text-sm font-medium text-muted"
      >
        <Plus className="size-4" />
        {addLabel}
      </button>
    </div>
  );
}
