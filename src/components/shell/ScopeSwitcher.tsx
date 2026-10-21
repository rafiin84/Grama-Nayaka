"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CaretDown, Check, MagnifyingGlass, MapPinLine } from "@phosphor-icons/react";
import { toast } from "sonner";
import { usePrefs } from "@/lib/store";
import { scopeGroups } from "@/lib/scope";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

/** Shows the current scope as "Scope: <bold value> ⌄" and lets the user change it in a dropdown right there. */
export function ScopeSwitcher({ className }: { className?: string }) {
  const { tr } = useT(); const role = usePrefs((s) => s.role); const value = usePrefs((s) => s.scopeSel[role]) ?? "all"; const setScope = usePrefs((s) => s.setScope);
  const { groups, locked } = scopeGroups(role, tr);
  const all = groups.flatMap((g) => g.options); const current = all.find((o) => o.value === value) ?? all[0];
  const [open, setOpen] = useState(false); const [q, setQ] = useState(""); const box = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const listId = useId();
  const searchable = all.length > 8; const kw = q.trim().toLowerCase();
  const shown = groups.map((g) => ({ ...g, options: g.options.filter((o) => !kw || (o.label + (o.hint ?? "")).toLowerCase().includes(kw)) })).filter((g) => g.options.length);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    const t = setTimeout(() => (box.current?.querySelector<HTMLElement>(`[role=option][aria-selected=true]`) ?? box.current?.querySelector<HTMLElement>("[role=option]"))?.focus(), 30);
    return () => { document.removeEventListener("mousedown", onDown); clearTimeout(t); };
  }, [open]);
  const close = () => { setOpen(false); setQ(""); trigger.current?.focus(); };
  const move = (dir: 1 | -1) => { const opts = [...(box.current?.querySelectorAll<HTMLElement>("[role=option]") ?? [])]; const i = opts.indexOf(document.activeElement as HTMLElement); opts[(i + dir + opts.length) % opts.length]?.focus(); };
  const pick = (v: string, label: string) => { if (v !== value) { setScope(role, v); toast.success(`${tr("Scope", "ವ್ಯಾಪ್ತಿ")}: ${label}`); } setOpen(false); setQ(""); trigger.current?.focus(); };

  return (
    <div ref={box} className={cn("relative", className)} onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); close(); } else if (open && e.key === "ArrowDown") { e.preventDefault(); move(1); } else if (open && e.key === "ArrowUp") { e.preventDefault(); move(-1); } }}>
      <button ref={trigger} type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} onClick={() => setOpen(!open)}
        className={cn("flex w-full max-w-full items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-left text-sm transition hover:bg-accent-soft", open ? "border-primary ring-2 ring-primary/20" : "border-border")}>
        <MapPinLine size={18} weight="duotone" className="shrink-0 text-primary" />
        <span className="shrink-0 text-muted">{tr("Scope", "ವ್ಯಾಪ್ತಿ")}:</span>
        <b className="min-w-0 flex-1 truncate font-bold text-foreground">{current?.label}</b>
        <CaretDown size={16} weight="bold" className={cn("shrink-0 text-primary transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {searchable && <div className="flex items-center gap-2 border-b border-border px-3 py-2"><MagnifyingGlass size={16} className="text-muted" /><input aria-label={tr("Search scope", "ವ್ಯಾಪ್ತಿ ಹುಡುಕಿ")} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); (box.current?.querySelector("[role=option]") as HTMLElement | null)?.focus(); } }} placeholder={tr("Search districts or Gram Panchayats…", "ಜಿಲ್ಲೆ ಅಥವಾ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಹುಡುಕಿ…")} className="w-full bg-transparent text-sm outline-none" /></div>}
          <div id={listId} role="listbox" aria-label={tr("Scope", "ವ್ಯಾಪ್ತಿ")} className="max-h-[60vh] overflow-y-auto p-1.5">
            {shown.length === 0 && <p className="px-3 py-4 text-sm text-muted">{tr("No match", "ಹೊಂದಿಕೆ ಇಲ್ಲ")}</p>}
            {shown.map((g) => (
              <div key={g.label} role="group" aria-label={g.label} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted">{g.label}</p>
                {g.options.map((o) => { const on = o.value === (current?.value ?? value); return (
                  <button key={o.value} type="button" role="option" aria-selected={on} onClick={() => pick(o.value, o.label)} className={cn("flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm outline-none hover:bg-accent-soft focus-visible:bg-accent-soft", on && "bg-accent-soft")}>
                    <span className="min-w-0"><span className={cn("block truncate", on ? "font-bold" : "font-medium")}>{o.label}</span>{o.hint && <span className="block truncate text-xs text-muted">{o.hint}</span>}</span>
                    {on && <Check size={18} weight="bold" className="shrink-0 text-primary" />}
                  </button>); })}
              </div>))}
          </div>
          {locked && <p className="border-t border-border bg-accent-soft/60 px-3 py-2 text-xs text-muted">{tr("Your role is limited to this area, so there is nothing else to switch to.", "ನಿಮ್ಮ ಪಾತ್ರ ಈ ಪ್ರದೇಶಕ್ಕೆ ಸೀಮಿತ; ಬದಲಿಸಲು ಬೇರೆ ಆಯ್ಕೆ ಇಲ್ಲ.")}</p>}
        </div>
      )}
    </div>
  );
}
