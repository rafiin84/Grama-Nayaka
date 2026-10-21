"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as Ph from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefs } from "@/lib/store";
import { useT } from "@/lib/useT";
import { canOpen, homeFor, navFor } from "@/lib/nav";
import { roleUsers, useDb } from "@/lib/db";
import type { Role } from "@/lib/types";
import { LangSwitch, ThemeToggle } from "./Controls";
import { ScopeSwitcher } from "./ScopeSwitcher";
import { actorName, scopeLabel } from "@/lib/scope";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/ui";

const Icon = ({ name, ...p }: { name: string; size?: number; weight?: "fill" | "regular" }) => {
  const C = (Ph as unknown as Record<string, React.ComponentType<{ size?: number; weight?: string }>>)[name] ?? Ph.Circle;
  return <C {...p} />;
};
const roles: Role[] = ["participant", "trainer", "coordinator", "grievance", "content", "local", "ac", "district", "state"];

function Offline() {
  const { tr } = useT();
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(navigator.onLine); const a = () => setOn(true), b = () => setOn(false); addEventListener("online", a); addEventListener("offline", b); return () => { removeEventListener("online", a); removeEventListener("offline", b); }; }, []);
  if (on) return null;
  return <div role="status" className="bg-warning px-3 py-1 text-center text-xs font-medium text-white">{tr("You are offline. Changes are kept only in this demo session and are not synced.", "ನೀವು ಆಫ್‌ಲೈನ್ ಇದ್ದೀರಿ. ಬದಲಾವಣೆಗಳು ಈ ಡೆಮೊ ಅವಧಿಯಲ್ಲಿ ಮಾತ್ರ ಇರುತ್ತವೆ; ಸಿಂಕ್ ಆಗುವುದಿಲ್ಲ.")}</div>;
}

function ProfileMenu() {
  const { t, tr } = useT();
  const role = usePrefs((s) => s.role); const setRole = usePrefs((s) => s.setRole); const session = usePrefs((s) => s.session); const signOut = usePrefs((s) => s.signOut); const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-fg">{actorName(role)[0]}</span>
        <span className="hidden sm:inline">{actorName(role)}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-border bg-card p-3 shadow-lg">
          <p className="text-sm font-semibold">{actorName(role)}</p><p className="mb-2 text-xs text-muted">{t.roles[role]} · {role === "participant" ? roleUsers[role].label : scopeLabel(role, tr)}</p>
          <p className="mb-1 rounded-lg bg-saffron/15 px-2 py-1 text-xs font-semibold text-warning">{t.roleSwitcher}</p>
          <div className="grid gap-1">
            {roles.map((r) => (
              <button key={r} role="menuitemradio" aria-checked={r === role} onClick={() => { setRole(r); setOpen(false); router.push(homeFor(r)); }} className={cn("rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent-soft", r === role && "bg-accent-soft font-semibold")}>{t.roles[r]}</button>
            ))}
          </div>
          <div className="mt-2 border-t border-border pt-2">{session ? <><p className="px-2 pb-1 text-xs text-muted">{tr("Signed in", "ಸೈನ್ ಇನ್")}: {session.name} · {session.phoneMasked}</p><button role="menuitem" onClick={() => { signOut(); setOpen(false); router.push("/"); }} className="block w-full rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-danger hover:bg-accent-soft">{tr("Log out", "ಲಾಗ್ ಔಟ್")}</button></> : <Link href="/signin" className="block rounded-lg px-2 py-1.5 text-sm font-semibold text-primary hover:bg-accent-soft">{tr("Sign in", "ಸೈನ್ ಇನ್")}</Link>}
          <Link href="/" className="block rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-accent-soft">{tr("Public home", "ಸಾರ್ವಜನಿಕ ಮುಖಪುಟ")}</Link></div>
        </div>
      )}
    </div>
  );
}

function SearchBox() {
  const { tr, lang } = useT(); const role = usePrefs((s) => s.role); const router = useRouter();
  const rbac = useDb((s) => s.rbac); const [q, setQ] = useState(""); const nav = navFor(role, rbac);
  const people = useDb((s) => s.participants); const apps = useDb((s) => s.applications); const courses = useDb((s) => s.courses);
  const results = useMemo(() => {
    const k = q.trim().toLowerCase(); if (!k) return [];
    const r: { label: string; href: string }[] = nav.filter((n) => (n.en + n.kn).toLowerCase().includes(k)).map((n) => ({ label: lang === "kn" ? n.kn : n.en, href: n.href }));
    if (role === "participant") courses.filter((c) => (c.title.en + c.title.kn).toLowerCase().includes(k)).forEach((c) => r.push({ label: c.title[lang], href: `/app/learning/${c.id}` }));
    else if (role !== "trainer") { people.filter((p) => (p.name + p.id).toLowerCase().includes(k)).forEach((p) => r.push({ label: `${p.name} · ${p.id}`, href: `/admin/participants?q=${p.id}` })); apps.filter((a) => (a.name + a.id).toLowerCase().includes(k)).slice(0, 3).forEach((a) => r.push({ label: `${a.id} · ${a.name}`, href: `/admin/applications?q=${a.id}` })); }
    return r.slice(0, 7);
  }, [q, nav, people, apps, courses, role, lang]);
  return (
    <div className="relative hidden w-64 md:block">
      <label className="sr-only" htmlFor="gsearch">Search</label>
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"><Ph.MagnifyingGlass size={16} /><input id="gsearch" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search…", "ಹುಡುಕಿ…")} className="w-full bg-transparent text-sm outline-none" /></div>
      {results.length > 0 && <ul className="absolute z-40 mt-1 w-full rounded-xl border border-border bg-card p-1 shadow-lg">{results.map((r) => <li key={r.href + r.label}><button className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent-soft" onClick={() => { setQ(""); router.push(r.href); }}>{r.label}</button></li>)}</ul>}
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { t, lang, tr } = useT();
  const role = usePrefs((s) => s.role); const path = usePathname(); const router = useRouter();
  const unread = useDb((s) => s.notifications.filter((n) => !n.read).length);
  const [mounted, setMounted] = useState(false); const [drawer, setDrawer] = useState(false); const [more, setMore] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { setDrawer(false); setMore(false); }, [path]);
  const rbac = useDb((s) => s.rbac); const isP = role === "participant"; const sess = usePrefs((st) => st.session); const appl = !!sess?.applicant && isP; const nav = navFor(role, rbac).filter((n) => !appl || ["/app", "/app/status", "/app/help"].includes(n.href));
  const label = (n: { en: string; kn: string }) => (lang === "kn" ? n.kn : n.en);
  const gated = appl && !["/app", "/app/status", "/app/help"].includes(path);
  const allowed = mounted ? canOpen(role, path, rbac) : true;
  const crumbs = path.split("/").filter(Boolean);
  const notifHref = isP ? "/app/notifications" : role === "trainer" ? "/admin/notifications" : "/admin";
  if (!mounted) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen md:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:p-2">Skip to content</a>
      {/* desktop sidebar */}
      <aside className={cn("no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card p-3 md:flex", collapsed ? "w-[68px]" : "w-64")}>
        <div className="mb-4 flex items-center justify-between px-1"><Link href="/" className="font-bold text-primary">{collapsed ? "GN" : t.appName}</Link><button aria-label="Collapse sidebar" onClick={() => setCollapsed(!collapsed)} className="rounded-full p-1 hover:bg-accent-soft"><Ph.SidebarSimple size={18} /></button></div>
        <nav aria-label="Primary" className="flex-1 space-y-0.5 overflow-y-auto">
          {nav.map((n, i) => { const active = n.href === path || (n.href !== "/app" && n.href !== "/admin" && path.startsWith(n.href)); const split = n.group && i > 0 && nav[i - 1].group !== n.group; return (
            <div key={n.href}>{split && <div className="mx-3 my-2 border-t border-border" />}<Link href={n.href} title={label(n)} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm", active ? "bg-accent-soft font-semibold text-primary" : "text-muted hover:bg-accent-soft")}><Icon name={n.icon} size={20} weight={active ? "fill" : "regular"} />{!collapsed && label(n)}</Link></div>); })}
        </nav>
        {!collapsed && <p className="mt-2 rounded-lg bg-saffron/15 p-2 text-[11px] text-foreground">{t.demoBanner}</p>}
      </aside>

      <div className="min-w-0 flex-1">
        <Offline />
        <header className="no-print sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/90 px-3 py-2 backdrop-blur md:px-6">
          {!isP && <button aria-label="Menu" className="rounded-full p-2 md:hidden" onClick={() => setDrawer(true)}><Ph.List size={22} /></button>}
          <Link href="/" className={cn("font-bold text-primary md:hidden", !isP && "hidden sm:block")}>{t.appName}</Link>
          {!isP && <ScopeSwitcher className="hidden max-w-[22rem] md:block" />}
          <div className="flex-1" />
          <SearchBox />
          <LangSwitch /><ThemeToggle />
          <button aria-label={`${t.nav.notifications}${unread ? `, ${unread}` : ""}`} onClick={() => router.push(notifHref)} className="relative rounded-full border border-border bg-card p-2"><Ph.Bell size={18} />{unread > 0 && role === "participant" && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{unread}</span>}</button>
          <ProfileMenu />
        </header>
        <div className="bg-deep px-3 py-1 text-center text-[11px] text-white md:hidden">{t.demoBanner}</div>
        {!isP && <div className="border-b border-border bg-background px-3 py-2 md:hidden"><ScopeSwitcher /></div>}

        {!isP && <nav aria-label="Breadcrumb" className="hidden px-6 pt-4 text-xs text-muted md:block">{crumbs.map((c, i) => <span key={i}>{i > 0 && " / "}{i === crumbs.length - 1 ? <span className="text-foreground">{c}</span> : c}</span>)}</nav>}

        <main id="main" className={cn("mx-auto px-4 py-5 md:px-6", "max-w-none lg:px-8", isP && "pb-28 md:pb-8")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={path} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
              {gated ? (<Card className="mx-auto max-w-md py-10 text-center"><h1 className="text-xl font-bold">{tr("Opens after approval", "ಅನುಮೋದನೆಯ ನಂತರ ತೆರೆಯುತ್ತದೆ")}</h1><p className="mt-1 text-sm text-muted">{tr("This part of the app is for approved volunteers. Your application is being reviewed by people; registering does not guarantee selection.", "ಈ ಭಾಗ ಅನುಮೋದಿತ ಸ್ವಯಂಸೇವಕರಿಗೆ. ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಜನರು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ; ನೋಂದಣಿ ಆಯ್ಕೆಯ ಖಾತರಿಯಲ್ಲ.")}</p><Link href="/app/status" className="mt-4 inline-block"><Button>{tr("See my application status", "ನನ್ನ ಅರ್ಜಿ ಸ್ಥಿತಿ ನೋಡಿ")}</Button></Link></Card>) : allowed ? children : (
                <Card className="mx-auto max-w-md py-10 text-center"><Ph.LockKey size={34} className="mx-auto text-danger" /><h1 className="mt-3 text-xl font-bold">{tr("Permission denied", "ಪ್ರವೇಶ ನಿರಾಕರಿಸಲಾಗಿದೆ")}</h1><p className="mt-1 text-sm text-muted">{t.denied}</p><p className="mt-1 text-xs text-muted">{t.roles[role]}</p><Link href={homeFor(role)} className="mt-4 inline-block"><Button>{tr("Go to my home", "ನನ್ನ ಮುಖಪುಟಕ್ಕೆ")}</Button></Link></Card>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* participant bottom nav */}
      {isP && (
        <nav aria-label="Primary" className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card md:hidden">
          <ul className="grid grid-cols-6">
            {nav.filter((n) => n.primary).map((n) => { const active = n.href === path || (n.href !== "/app" && path.startsWith(n.href)); return (
              <li key={n.href}><Link href={n.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px]", active ? "font-semibold text-primary" : "text-muted")}><Icon name={n.icon} size={22} weight={active ? "fill" : "regular"} /><span className="max-w-full truncate px-0.5">{label(n)}</span></Link></li>); })}
            <li><button onClick={() => setMore(true)} className="flex w-full flex-col items-center gap-0.5 py-2 text-[11px] text-muted"><Ph.DotsThreeOutline size={22} />{t.nav.more}</button></li>
          </ul>
        </nav>
      )}
      <AnimatePresence>
        {(more || drawer) && (
          <motion.div className="fixed inset-0 z-50 bg-black/50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setMore(false); setDrawer(false); }}>
            <motion.div initial={{ y: more ? 80 : 0, x: more ? 0 : -300 }} animate={{ y: 0, x: 0 }} exit={{ y: more ? 80 : 0, x: more ? 0 : -300 }} transition={{ type: "spring", damping: 28, stiffness: 300 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Menu"
              className={cn("absolute bg-card p-4", more ? "inset-x-0 bottom-0 rounded-t-3xl" : "inset-y-0 left-0 w-72 overflow-y-auto")}>
              <ul className="grid gap-1">{(more ? nav.filter((n) => !n.primary) : nav).map((n) => (<li key={n.href}><Link href={n.href} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent-soft"><Icon name={n.icon} size={22} />{label(n)}</Link></li>))}</ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
