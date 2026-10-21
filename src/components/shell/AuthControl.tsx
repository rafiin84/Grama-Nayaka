"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaretDown, House, SignIn, SignOut } from "@phosphor-icons/react";
import { toast } from "sonner";
import { homeFor } from "@/lib/nav";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

/** Header control for the public pages: "Sign in" when signed out, a profile menu with "Log out" when signed in. */
export function AuthControl() {
  const { t, tr } = useT(); const session = usePrefs((s) => s.session); const signOut = usePrefs((s) => s.signOut); const router = useRouter();
  const [mounted, setMounted] = useState(false); const [open, setOpen] = useState(false); const box = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => { if (!open) return; const d = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); }; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); document.addEventListener("mousedown", d); document.addEventListener("keydown", k); return () => { document.removeEventListener("mousedown", d); document.removeEventListener("keydown", k); }; }, [open]);
  if (!mounted || !session) return <Link href="/signin" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:opacity-90"><SignIn size={18} weight="bold" className="sm:hidden" /><span>{tr("Sign in", "ಸೈನ್ ಇನ್")}</span></Link>;
  return (
    <div ref={box} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className={cn("flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 text-sm font-medium", open ? "border-primary ring-2 ring-primary/20" : "border-border")}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-bold text-primary-fg">{session.name[0]?.toUpperCase()}</span>
        <span className="hidden max-w-[9rem] truncate sm:inline">{session.name}</span>
        <CaretDown size={14} weight="bold" className={cn("text-primary transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl">
          <div className="px-3 py-2"><p className="truncate font-semibold">{session.name}</p><p className="text-xs text-muted">{t.roles[session.role]} · {session.phoneMasked}</p></div>
          <Link role="menuitem" href={homeFor(session.role)} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent-soft"><House size={18} />{tr("Open my home", "ನನ್ನ ಮುಖಪುಟ ತೆರೆಯಿರಿ")}</Link>
          <button role="menuitem" type="button" onClick={() => { signOut(); setOpen(false); toast.success(tr("You have been logged out", "ನೀವು ಲಾಗ್ ಔಟ್ ಆಗಿದ್ದೀರಿ")); router.replace("/"); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-danger hover:bg-accent-soft"><SignOut size={18} />{tr("Log out", "ಲಾಗ್ ಔಟ್")}</button>
        </div>
      )}
    </div>
  );
}
