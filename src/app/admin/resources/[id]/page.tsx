"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, PencilSimple } from "@phosphor-icons/react";
import { Badge, Button, Card, Confirm, Empty, PageHeader, QState, statusTone } from "@/components/ui";
import { ResourceThumb, ResourceViewer } from "@/components/ResourceViewer";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { isLive } from "@/lib/resourceRules";
import { today } from "@/lib/derive";
import { useCan } from "@/lib/useCan";
import { useT } from "@/lib/useT";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>(); const { tr, loc } = useT(); const act = useAct(); const router = useRouter(); const { can } = useCan(); const [del, setDel] = useState(false);
  const q = useMock(["resource", id], () => { const d = getDb(); const r = d.resources.find((x) => x.id === id); return r ? { r, cat: d.resourceCategories.find((c) => c.id === r.categoryId) } : null; });
  return (
    <div className="space-y-4">
      <Link href="/admin/resources" className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft />{tr("All resources", "ಎಲ್ಲಾ ಸಂಪನ್ಮೂಲಗಳು")}</Link>
      <QState q={q} isEmpty={(d) => !d} empty={<Empty title={tr("Resource not found", "ಸಂಪನ್ಮೂಲ ಸಿಗಲಿಲ್ಲ")} />}>{(d) => { const { r, cat } = d!; const live = isLive(r, today);
        return (<>
          <PageHeader title={r.title} sub={`${r.id} · ${cat ? loc(cat.name) : "—"} · ${r.topic}`} actions={<><Badge tone={statusTone(r.status === "Published" ? "Published" : r.status === "Draft" ? "Draft" : r.status === "Scheduled" ? "Pending" : "Withdrawn")}>{r.status}</Badge>{can("resources", "edit") && <Link href={`/admin/resources/${r.id}/edit`}><Button><PencilSimple />{tr("Edit", "ತಿದ್ದಿ")}</Button></Link>}</>} />
          <Card className="flex flex-wrap gap-4"><ResourceThumb r={r} className="h-20 w-32 shrink-0" /><div className="min-w-0 flex-1 space-y-1 text-sm"><p>{r.short}</p><p className="text-xs text-muted">{r.publishDate ? `${tr("Publish date", "ಪ್ರಕಟಣೆ ದಿನಾಂಕ")}: ${r.publishDate} · ` : ""}{tr("Display order", "ಕ್ರಮ")} {r.order} · {tr("Updated", "ನವೀಕರಿಸಿದ")} {r.updatedAt}</p><p className="text-xs">{live ? <span className="text-success">{tr("Visible to the selected audience now.", "ಆಯ್ದ ಪ್ರೇಕ್ಷಕರಿಗೆ ಈಗ ಕಾಣುತ್ತದೆ.")}</span> : <span className="text-muted">{tr("Not visible to volunteers (not published yet or archived).", "ಸ್ವಯಂಸೇವಕರಿಗೆ ಕಾಣುವುದಿಲ್ಲ (ಇನ್ನೂ ಪ್ರಕಟಿಸಿಲ್ಲ ಅಥವಾ ಆರ್ಕೈವ್).")}</span>}</p></div></Card>
          {r.full && <Card className="whitespace-pre-line text-sm">{r.full}</Card>}
          <ResourceViewer r={r} />
          <Card className="flex flex-wrap gap-2">
            {can("resources", "edit") && (r.status === "Published" ? <Button variant="secondary" onClick={() => act(() => api.resources.setStatus(r.id, "Draft"), tr("Unpublished (draft)", "ಪ್ರಕಟಣೆ ಹಿಂತೆಗೆದಿದೆ (ಕರಡು)"))}>{tr("Unpublish", "ಪ್ರಕಟಣೆ ಹಿಂಪಡೆಯಿರಿ")}</Button> : r.status !== "Archived" ? <Button onClick={() => act(() => api.resources.setStatus(r.id, "Published"), tr("Published", "ಪ್ರಕಟಿಸಲಾಗಿದೆ"))}>{tr("Publish now", "ಈಗ ಪ್ರಕಟಿಸಿ")}</Button> : null)}
            {can("resources", "edit") && (r.status === "Archived" ? <Button variant="secondary" onClick={() => act(() => api.resources.setStatus(r.id, "Draft"), tr("Restored as draft", "ಕರಡಾಗಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ"))}>{tr("Restore", "ಮರುಸ್ಥಾಪಿಸಿ")}</Button> : <Button variant="secondary" onClick={() => act(() => api.resources.setStatus(r.id, "Archived"), tr("Archived", "ಆರ್ಕೈವ್ ಮಾಡಲಾಗಿದೆ"))}>{tr("Archive", "ಆರ್ಕೈವ್")}</Button>)}
            {can("resources", "delete") && <Button variant="danger" onClick={() => setDel(true)}>{tr("Delete", "ಅಳಿಸಿ")}</Button>}
          </Card>
          <Confirm open={del} onClose={() => setDel(false)} danger onConfirm={async () => { const x = await act(() => api.resources.remove(r.id), tr("Resource deleted", "ಸಂಪನ್ಮೂಲ ಅಳಿಸಲಾಗಿದೆ")); if (x !== undefined) router.push("/admin/resources"); }} title={tr("Delete this resource?", "ಈ ಸಂಪನ್ಮೂಲ ಅಳಿಸುವಿರಾ?")} confirmLabel={tr("Delete", "ಅಳಿಸಿ")} body={tr("Its uploaded file and thumbnail are removed too. Consider archiving instead if you may need it later.", "ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್ ಮತ್ತು ಥಂಬ್‌ನೇಲ್ ಸಹ ತೆಗೆಯಲಾಗುತ್ತದೆ. ಮುಂದೆ ಬೇಕಾಗಬಹುದಾದರೆ ಆರ್ಕೈವ್ ಮಾಡಿ.")} />
        </>); }}</QState>
    </div>
  );
}
