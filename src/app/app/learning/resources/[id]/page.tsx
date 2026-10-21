"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { Empty, PageHeader, QState } from "@/components/ui";
import { ResourceViewer } from "@/components/ResourceViewer";
import { useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { visibleTo } from "@/lib/resourceRules";
import { today } from "@/lib/derive";
import { useT } from "@/lib/useT";

export default function ResourcePage() {
  const { id } = useParams<{ id: string }>(); const { tr, loc } = useT();
  const q = useMock(["lib-resource", id], () => { const d = getDb(); const r = d.resources.find((x) => x.id === id); return r && visibleTo(r, "volunteers", today) ? { r, cat: d.resourceCategories.find((c) => c.id === r.categoryId) } : null; });
  return (
    <div className="space-y-4">
      <Link href="/app/learning" className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft />{tr("Courses", "ಕೋರ್ಸ್‌ಗಳು")}</Link>
      <QState q={q} isEmpty={(d) => !d} empty={<Empty title={tr("This resource is not available", "ಈ ಸಂಪನ್ಮೂಲ ಲಭ್ಯವಿಲ್ಲ")} hint={tr("It may have been unpublished or moved.", "ಇದನ್ನು ಪ್ರಕಟಣೆ ಹಿಂಪಡೆದಿರಬಹುದು ಅಥವಾ ಸರಿಸಿರಬಹುದು.")} />}>{(d) => <><PageHeader title={d!.r.title} sub={`${d!.cat ? loc(d!.cat.name) : ""} · ${d!.r.topic}`} /><p className="text-sm">{d!.r.short}</p>{d!.r.full && <p className="whitespace-pre-line text-sm text-muted">{d!.r.full}</p>}<ResourceViewer r={d!.r} /></>}</QState>
    </div>
  );
}
