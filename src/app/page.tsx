"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Certificate, HandHeart, Scales, UsersThree } from "@phosphor-icons/react";
import { useT } from "@/lib/useT";
import { LangSwitch, ThemeToggle } from "@/components/shell/Controls";

export default function Landing() {
  const { t } = useT();
  const steps = [t.j1, t.j2, t.j3, t.j4, t.j5, t.j6];
  const benefits = [
    [UsersThree, t.b1],
    [Scales, t.b2],
    [HandHeart, t.b3],
    [BookOpen, t.b4],
    [Certificate, t.b5],
  ] as const;
  return (
    <div className="min-h-screen">
      <div className="bg-deep px-4 py-1.5 text-center text-xs text-white">{t.demoBanner}</div>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <span className="text-lg font-bold text-primary">{t.appName}</span>
        <div className="flex items-center gap-2">
          <LangSwitch />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4">
        <section className="grid items-center gap-8 py-10 md:grid-cols-[1fr_minmax(0,460px)] md:py-20"><div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-saffron">{t.tagline}</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">{t.heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{t.heroBody}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-fg">
              {t.ctaRegister} <ArrowRight />
            </Link>
            <Link href="/app" className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 font-medium">
              {t.ctaContinue}
            </Link>
          </div>
          <p className="mt-4 max-w-xl text-sm text-muted">{t.nonPartisan}</p>
          </div>
          <figure aria-label="Hero image" className="w-full"><Image src="/hero.jpg" alt="A young community leader standing with arms crossed on a village street at sunset" width={1400} height={933} priority className="aspect-[3/2] w-full rounded-3xl object-cover" /><figcaption className="mt-2 text-[11px] leading-snug text-muted">Illustrative image.</figcaption></figure>
        </section>

        <section className="py-8">
          <h2 className="mb-5 text-2xl font-bold">{t.journey}</h2>
          <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {steps.map((s, i) => (
              <li key={s} className="rounded-2xl border border-border bg-card p-4">
                <span className="text-sm font-bold text-saffron">{i + 1}</span>
                <p className="mt-1 font-medium">{s}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-8">
          <h2 className="mb-5 text-2xl font-bold">{t.benefits}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map(([Icon, label]) => (
              <div key={label} className="rounded-2xl border border-border bg-accent-soft p-4">
                <Icon size={28} className="text-primary" />
                <p className="mt-3 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <h2 className="mb-5 text-2xl font-bold">{t.faq}</h2>
          <div className="space-y-3">
            {[[t.faq1q, t.faq1a], [t.faq2q, t.faq2a], [t.faq3q, t.faq3a]].map(([q, a]) => (
              <details key={q} className="rounded-2xl border border-border bg-card p-4">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="mt-2 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="mt-10 border-t border-border px-4 py-6 text-center text-sm text-muted">
        <Link href="/privacy" className="mx-3 underline">{t.privacy}</Link>
        <Link href="/app/help" className="mx-3 underline">{t.help}</Link>
      </footer>
    </div>
  );
}
