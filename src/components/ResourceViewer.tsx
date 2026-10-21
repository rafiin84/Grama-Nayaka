"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowSquareOut, DownloadSimple, FilePdf, FileText, Globe, Play, VideoCamera, WarningCircle } from "@phosphor-icons/react";
import { Badge, Button, Card } from "@/components/ui";
import { AUDIENCES, RESOURCE_TYPES, youtubeId } from "@/lib/resourceRules";
import { useMediaUrl } from "@/lib/useBlobUrl";
import { useT } from "@/lib/useT";
import type { LearningResource, ResourceType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const typeIcon: Record<ResourceType, typeof Globe> = { videoFile: VideoCamera, videoLink: VideoCamera, pdf: FilePdf, document: FileText, link: Globe };
export const typeLabel = (t: ResourceType, lang: "kn" | "en") => RESOURCE_TYPES.find((x) => x.id === t)?.[lang] ?? t;

/** Thumbnail with a type icon fallback. */
export function ResourceThumb({ r, className }: { r: Pick<LearningResource, "thumb" | "type" | "title">; className?: string }) {
  const { url } = useMediaUrl(r.thumb); const Icon = typeIcon[r.type];
  return <div className={cn("relative grid place-items-center overflow-hidden rounded-xl bg-accent-soft text-primary", className)}>{url ? <Image src={url} alt="" fill unoptimized sizes="240px" className="object-cover" /> : <Icon size={28} weight="duotone" />}</div>;
}

export function ResourceViewer({ r }: { r: LearningResource }) {
  const { tr, lang } = useT(); const file = useMediaUrl(r.file); const poster = useMediaUrl(r.thumb); const [play, setPlay] = useState(false); const [failed, setFailed] = useState(false);
  const yt = r.type === "videoLink" && r.url ? youtubeId(r.url) : null;
  const missing = (r.type === "videoFile" || r.type === "pdf" || r.type === "document") && (file.missing || (!r.file && true));
  return (
    <div className="space-y-4">
      {(r.type === "videoFile" || r.type === "videoLink") && (
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
          {r.type === "videoFile" && file.url && !failed && <video controls preload="metadata" poster={poster.url ?? undefined} onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-contain"><source src={file.url} />{tr("Your browser cannot play this video.", "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಈ ವೀಡಿಯೋ ಪ್ಲೇ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.")}</video>}
          {r.type === "videoLink" && yt && (play ? <iframe title={r.title} src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" /> : <button type="button" onClick={() => setPlay(true)} aria-label={`${tr("Play", "ಪ್ಲೇ")}: ${r.title}`} className="group absolute inset-0"><Image src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" fill unoptimized sizes="720px" className="object-cover" /><span className="absolute inset-0 bg-black/30" /><span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-saffron text-[#2b1700] transition group-hover:scale-110"><Play size={30} weight="fill" /></span></button>)}
          {r.type === "videoLink" && !yt && r.url && !failed && <video controls preload="metadata" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-contain"><source src={r.url} /></video>}
          {(failed || missing || (r.type === "videoFile" && !file.url && file.missing)) && <div role="alert" className="absolute inset-0 grid place-items-center bg-black/85 p-4 text-center text-sm text-white"><div><WarningCircle size={28} className="mx-auto text-saffron" /><p className="mt-2">{file.missing ? tr("This uploaded file is not available in this browser (files are stored per browser in this prototype).", "ಈ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ (ಈ ಮಾದರಿಯಲ್ಲಿ ಫೈಲ್‌ಗಳು ಬ್ರೌಸರ್ ಪ್ರತಿ ಉಳಿಯುತ್ತವೆ).") : tr("This video could not be played here.", "ಈ ವೀಡಿಯೋ ಇಲ್ಲಿ ಪ್ಲೇ ಆಗಲಿಲ್ಲ.")}</p></div></div>}
        </div>
      )}
      {r.type === "pdf" && (file.url ? <div className="space-y-2"><iframe title={r.title} src={file.url} className="h-[70vh] w-full rounded-2xl border border-border bg-white" /><a href={file.url} download={r.file?.name} className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline"><DownloadSimple />{tr("Download PDF", "PDF ಡೌನ್‌ಲೋಡ್")}</a></div> : <Card className="text-sm text-muted">{file.missing ? tr("This uploaded file is not available in this browser.", "ಈ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ.") : tr("No file attached yet.", "ಇನ್ನೂ ಫೈಲ್ ಜೋಡಿಸಿಲ್ಲ.")}</Card>)}
      {r.type === "document" && <Card className="flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-3"><FileText size={32} className="text-primary" weight="duotone" /><span><b className="block">{r.file?.name ?? "—"}</b><span className="text-xs text-muted">{r.file ? `${(r.file.size / 1024).toFixed(0)} KB` : tr("No file attached yet.", "ಇನ್ನೂ ಫೈಲ್ ಜೋಡಿಸಿಲ್ಲ.")}</span></span></span>{file.url ? <a href={file.url} download={r.file?.name}><Button><DownloadSimple />{tr("Download", "ಡೌನ್‌ಲೋಡ್")}</Button></a> : file.missing && <span className="text-xs text-danger">{tr("File not in this browser", "ಫೈಲ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿಲ್ಲ")}</span>}</Card>}
      {r.type === "link" && r.url && <Card className="flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-3"><Globe size={32} className="text-primary" weight="duotone" /><span><b className="block break-all">{hostOf(r.url)}</b><span className="text-xs text-muted">{tr("Opens an external website in a new tab. Its content is not managed by this app.", "ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಬಾಹ್ಯ ವೆಬ್‌ಸೈಟ್ ತೆರೆಯುತ್ತದೆ. ಅದರ ವಿಷಯವನ್ನು ಈ ಆ್ಯಪ್ ನಿರ್ವಹಿಸುವುದಿಲ್ಲ.")}</span></span></span><a href={r.url} target="_blank" rel="noopener noreferrer"><Button><ArrowSquareOut />{tr("Open website", "ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಿರಿ")}</Button></a></Card>}
      {r.type === "videoLink" && r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline"><ArrowSquareOut />{tr("Open the video's own page", "ವೀಡಿಯೋದ ಮೂಲ ಪುಟ ತೆರೆಯಿರಿ")}</a>}
      <div className="flex flex-wrap gap-2 text-xs"><Badge tone="info">{typeLabel(r.type, lang)}</Badge><Badge>{r.language === "both" ? "ಕನ್ನಡ + English" : r.language === "kn" ? "ಕನ್ನಡ" : "English"}</Badge>{r.audience.map((a) => <Badge key={a}>{AUDIENCES.find((x) => x.id === a)?.[lang]}</Badge>)}</div>
      {r.credit && <p className="text-xs text-muted">{tr("Credit", "ಕ್ರೆಡಿಟ್")}: {r.credit}</p>}
    </div>
  );
}
function hostOf(u: string) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } }
