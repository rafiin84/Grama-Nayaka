"use client";
import Image from "next/image";
import { useState } from "react";
import { Play, WarningCircle } from "@phosphor-icons/react";
import { CREDITS } from "@/lib/credits";
import { TRAINING_VIDEOS, type TrainingVideo } from "@/lib/trainingVideos";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

/** A photo with a visible, linked credit (required by its Creative Commons licence). */
export function Photo({ src, alt, creditId, className, sizes = "(min-width: 1024px) 560px, 100vw", position = "center", priority, children, shade, creditPos = "top" }: { src: string; alt: string; creditId: string; className?: string; sizes?: string; position?: string; priority?: boolean; children?: React.ReactNode; shade?: "left" | "bottom"; creditPos?: "top" | "bottom" }) {
  const c = CREDITS[creditId];
  return (
    <figure className={cn("relative isolate overflow-hidden rounded-3xl bg-accent-soft", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="-z-10 object-cover" style={{ objectPosition: position }} />
      {shade === "left" && <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#04241c]/85 via-[#04241c]/45 to-transparent max-md:from-[#04241c]/75 max-md:to-[#04241c]/35" />}
      {shade === "bottom" && <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#04241c]/80 via-transparent to-transparent" />}
      {children}
      {c && <figcaption className={cn("absolute right-2 z-10 max-w-[85%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white/90 backdrop-blur", creditPos === "top" ? "top-2" : "bottom-2")}><a href={c.source} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">Photo: {c.author} · {c.license}</a></figcaption>}
    </figure>
  );
}

/** Click-to-play video: nothing is downloaded until the viewer presses play. */
export function TrainingVideoPlayer({ videos = TRAINING_VIDEOS }: { videos?: TrainingVideo[] }) {
  const { tr, loc } = useT(); const [i, setI] = useState(0); const [playing, setPlaying] = useState(false); const [failed, setFailed] = useState(false);
  const v = videos[i]; const credit = v.creditId ? CREDITS[v.creditId] : undefined;
  const pick = (n: number) => { setI(n); setPlaying(false); setFailed(false); };
  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
        {playing && !failed ? (
          v.youtubeId ? <iframe title={loc(v.title)} src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
          : <video key={v.id} controls autoPlay playsInline preload="auto" poster={v.poster} onError={() => setFailed(true)} className="absolute inset-0 h-full w-full bg-black object-contain"><source src={v.src} />{tr("Your browser cannot play this video.", "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಈ ವೀಡಿಯೋ ಪ್ಲೇ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.")}</video>
        ) : (
          <button type="button" onClick={() => { setFailed(false); setPlaying(true); }} aria-label={`${tr("Play", "ಪ್ಲೇ")}: ${loc(v.title)}`} className="group absolute inset-0">
            <Image src={v.poster} alt="" fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover transition group-hover:scale-[1.02]" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-saffron text-[#2b1700] shadow-lg transition group-hover:scale-110"><Play size={30} weight="fill" /></span>
            <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-left text-white"><span className="text-sm font-semibold drop-shadow">{loc(v.title)}</span><span className="shrink-0 rounded-full bg-black/55 px-2 py-0.5 text-xs">{v.minutes} {tr("min", "ನಿಮಿ")}</span></span>
          </button>
        )}
        {failed && <div role="alert" className="absolute inset-0 grid place-items-center bg-black/80 p-4 text-center text-sm text-white"><div><WarningCircle size={28} className="mx-auto text-saffron" /><p className="mt-2">{tr("This video could not be played here. Try a different browser, or check that the file is available.", "ಈ ವೀಡಿಯೋ ಇಲ್ಲಿ ಪ್ಲೇ ಆಗಲಿಲ್ಲ. ಬೇರೆ ಬ್ರೌಸರ್ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಫೈಲ್ ಲಭ್ಯವಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.")}</p></div></div>}
      </div>
      <p className="text-sm text-muted">{loc(v.summary)}</p>
      {v.sample && <p className="rounded-xl bg-saffron/15 px-3 py-2 text-xs text-foreground">{tr("Sample video. This is a licensed stock documentary, not footage of this programme's own training. The programme's recordings can be added in one list.", "ಮಾದರಿ ವೀಡಿಯೋ. ಇದು ಪರವಾನಗಿ ಪಡೆದ ಸ್ಟಾಕ್ ಸಾಕ್ಷ್ಯಚಿತ್ರ; ಈ ಕಾರ್ಯಕ್ರಮದ ಸ್ವಂತ ತರಬೇತಿ ದೃಶ್ಯವಲ್ಲ. ಕಾರ್ಯಕ್ರಮದ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳನ್ನು ಒಂದು ಪಟ್ಟಿಯಲ್ಲಿ ಸೇರಿಸಬಹುದು.")}</p>}
      {credit && <p className="text-[11px] text-muted"><a className="underline" href={credit.source} target="_blank" rel="noreferrer">{credit.title}</a> · {credit.author} · <a className="underline" href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a></p>}
      {videos.length > 1 && <ul className="grid gap-2 sm:grid-cols-2">{videos.map((x, n) => <li key={x.id}><button type="button" aria-current={n === i} onClick={() => pick(n)} className={cn("w-full rounded-xl border px-3 py-2 text-left text-sm", n === i ? "border-primary bg-accent-soft font-semibold" : "border-border")}>{loc(x.title)}</button></li>)}</ul>}
    </div>
  );
}
