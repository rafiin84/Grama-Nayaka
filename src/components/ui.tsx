"use client";
import { forwardRef, useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WarningCircle, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "saffron";
const tones: Record<Tone, string> = {
  neutral: "bg-border/60 text-foreground", success: "bg-success/15 text-success", warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger", info: "bg-navy/10 text-navy dark:bg-sky-400/15 dark:text-sky-300", saffron: "bg-saffron/15 text-warning",
};
export const Badge = ({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>
);
export const statusTone = (s: string): Tone =>
  /Approved|Closed|Present|Completed|Published|Granted|granted|Passed|Verified/.test(s) ? "success"
  : /Not Selected|Absent|Escalated|Overdue|Withdrawn|Rejected|declined|Cancelled|Follow-up Due|Reopened/.test(s) ? "danger"
  : /Review|Pending|Late|Draft|In Progress|Shortlisted|Closure/.test(s) ? "warning" : /Submitted|Open|Scheduled|Upcoming/.test(s) ? "info" : "neutral";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" };
export const Button = forwardRef<HTMLButtonElement, BtnProps>(({ variant = "primary", size = "md", className, ...p }, ref) => (
  <button ref={ref} {...p} className={cn("inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-6 py-3.5 text-base" : "px-4 py-2.5 text-sm",
    variant === "primary" && "bg-primary text-primary-fg hover:opacity-90", variant === "secondary" && "border border-border bg-card hover:bg-accent-soft",
    variant === "ghost" && "hover:bg-accent-soft", variant === "danger" && "bg-danger text-white hover:opacity-90", className)} />
));
Button.displayName = "Button";

export const Card = ({ className, children, ...p }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...p} className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>{children}</div>
);
export const PageHeader = ({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-bold md:text-3xl">{title}</h1>{sub && <p className="mt-1 max-w-2xl text-sm text-muted">{sub}</p>}</div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);
export const Stat = ({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: Tone }) => (
  <Card title={hint}><p className="text-sm text-muted">{label}</p><p className={cn("mt-1 text-2xl font-bold", tone === "danger" && "text-danger", tone === "success" && "text-success")}>{value}</p>{hint && <p className="mt-1 text-xs text-muted">{hint}</p>}</Card>
);
export const Progress = ({ value, label }: { value: number; label?: string }) => (
  <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-2 w-full overflow-hidden rounded-full bg-border">
    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, value)}%` }} />
  </div>
);
export const Skeleton = ({ className }: { className?: string }) => <div aria-hidden className={cn("animate-pulse rounded-xl bg-border/70", className)} />;
export const Loading = () => (<div role="status" aria-live="polite" className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>);
export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <Card className="py-10 text-center"><p className="font-semibold">{title}</p>{hint && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{hint}</p>}{action && <div className="mt-4">{action}</div>}</Card>
);
export function ErrorBox({ error, retry }: { error: unknown; retry?: () => void }) {
  const { tr } = useT();
  return (<Card className="border-danger/40 text-center"><WarningCircle className="mx-auto text-danger" size={28} /><p className="mt-2 font-semibold">{tr("Something went wrong", "ಏನೋ ತಪ್ಪಾಗಿದೆ")}</p><p className="text-sm text-muted">{(error as Error)?.message}</p>{retry && <Button className="mt-3" variant="secondary" onClick={retry}>{tr("Retry", "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ")}</Button>}</Card>);
}
/** Standard loading / error / empty / success wrapper for queries. */
export function QState<R>({ q, children, isEmpty, empty }: { q: { data?: R; isLoading: boolean; error: unknown; refetch: () => void }; children: (d: R) => ReactNode; isEmpty?: (d: R) => boolean; empty?: ReactNode }) {
  if (q.error) return <ErrorBox error={q.error} retry={() => q.refetch()} />;
  if (q.isLoading || q.data === undefined) return <Loading />;
  if (isEmpty?.(q.data)) return <>{empty}</>;
  return <>{children(q.data)}</>;
}

export function Field({ label, error, hint, children, required }: { label: string; error?: string; hint?: string; children: (id: string, ariaProps: object) => ReactNode; required?: boolean }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">{label}{required && <span aria-hidden className="text-danger"> *</span>}</label>
      {children(id, { "aria-invalid": !!error, "aria-describedby": error ? `${id}-e` : hint ? `${id}-h` : undefined })}
      {hint && !error && <p id={`${id}-h`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}
const inputCls = "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-base placeholder:text-muted/70 disabled:opacity-60 aria-[invalid=true]:border-danger";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, r) => <input ref={r} {...p} className={cn(inputCls, className)} />);
Input.displayName = "Input";
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...p }, r) => <select ref={r} {...p} className={cn(inputCls, className)} />);
Select.displayName = "Select";
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, r) => <textarea ref={r} rows={4} {...p} className={cn(inputCls, className)} />);
Textarea.displayName = "Textarea";
export const Check = ({ label, ...p }: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="flex items-start gap-3 text-sm"><input type="checkbox" {...p} className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]" /><span>{label}</span></label>
);

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); document.addEventListener("keydown", h); ref.current?.focus(); return () => document.removeEventListener("keydown", h); }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 outline-none sm:max-w-lg sm:rounded-3xl">
            <div className="mb-3 flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{title}</h2><button aria-label="Close" onClick={onClose} className="rounded-full p-1 hover:bg-accent-soft"><X size={20} /></button></div>
            <div className="space-y-3">{children}</div>
            {footer && <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function Confirm({ open, onClose, onConfirm, title, body, confirmLabel, danger, busy }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; body: ReactNode; confirmLabel: string; danger?: boolean; busy?: boolean }) {
  const { tr } = useT();
  return (<Modal open={open} onClose={onClose} title={title} footer={<><Button variant="secondary" onClick={onClose}>{tr("Cancel", "ರದ್ದುಮಾಡಿ")}</Button><Button variant={danger ? "danger" : "primary"} disabled={busy} onClick={onConfirm}>{busy ? "…" : confirmLabel}</Button></>}><div className="text-sm text-muted">{body}</div></Modal>);
}
export function Tabs<K extends string>({ tabs, value, onChange }: { tabs: { id: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={cn("relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium", value === t.id ? "text-primary-fg" : "text-muted")}>
          {value === t.id && <motion.span layoutId={`tab-${tabs.map((x) => x.id).join("")}`} className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", damping: 30, stiffness: 400 }} />}
          <span className="relative">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
/** Scrollable table on small screens. */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (<div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-border bg-accent-soft/60 text-xs uppercase text-muted"><tr>{head.map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{children}</tbody></table></div>);
}
export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;
export const DemoNote = ({ children }: { children: ReactNode }) => (<p className="rounded-xl border border-saffron/40 bg-saffron/10 px-3 py-2 text-xs text-foreground">{children}</p>);
