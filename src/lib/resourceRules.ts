import { z } from "zod";
import type { Audience, LearningResource, MediaRef, ResourceType } from "./types";

export const RESOURCE_TYPES: { id: ResourceType; en: string; kn: string; mode: "file" | "url" }[] = [
  { id: "videoFile", en: "Video (upload)", kn: "ವೀಡಿಯೋ (ಅಪ್‌ಲೋಡ್)", mode: "file" },
  { id: "videoLink", en: "Video (link, e.g. YouTube)", kn: "ವೀಡಿಯೋ (ಲಿಂಕ್)", mode: "url" },
  { id: "pdf", en: "PDF", kn: "PDF", mode: "file" },
  { id: "document", en: "Document / presentation", kn: "ದಾಖಲೆ / ಪ್ರಸ್ತುತಿ", mode: "file" },
  { id: "link", en: "Website / external link", kn: "ವೆಬ್‌ಸೈಟ್ / ಬಾಹ್ಯ ಲಿಂಕ್", mode: "url" },
];
export const AUDIENCES: { id: Audience; en: string; kn: string }[] = [
  { id: "volunteers", en: "Volunteers", kn: "ಸ್ವಯಂಸೇವಕರು" }, { id: "trainers", en: "Trainers", kn: "ತರಬೇತುದಾರರು" },
  { id: "coordinators", en: "Coordinators", kn: "ಸಂಯೋಜಕರು" }, { id: "admins", en: "Administrators", kn: "ಆಡಳಿತಾಧಿಕಾರಿಗಳು" },
];
export const FILE_RULES: Record<"videoFile" | "pdf" | "document" | "thumb", { exts: string[]; maxMB: number; label: string }> = {
  videoFile: { exts: ["mp4", "webm"], maxMB: 80, label: "MP4 or WebM, up to 80 MB" },
  pdf: { exts: ["pdf"], maxMB: 20, label: "PDF, up to 20 MB" },
  document: { exts: ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"], maxMB: 20, label: "PDF, Word, PowerPoint or Excel, up to 20 MB" },
  thumb: { exts: ["png", "jpg", "jpeg", "webp"], maxMB: 2, label: "PNG, JPG or WebP, up to 2 MB" },
};
export function validateFile(kind: keyof typeof FILE_RULES, f: { name: string; size: number }): string | null {
  const r = FILE_RULES[kind]; const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  if (!r.exts.includes(ext)) return `Unsupported file type. Allowed: ${r.label}.`;
  if (f.size > r.maxMB * 1024 * 1024) return `File is larger than ${r.maxMB} MB.`;
  if (f.size === 0) return "File is empty.";
  return null;
}
/** Extracts a YouTube video id from common URL shapes; null if it is not a YouTube link. */
export function youtubeId(url: string): string | null {
  try { const u = new URL(url); const h = u.hostname.replace(/^www\./, "");
    if (h === "youtu.be") return u.pathname.slice(1).match(/^[\w-]{11}$/)?.[0] ?? null;
    if (h === "youtube.com" || h === "m.youtube.com" || h === "youtube-nocookie.com") { const v = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1]; return v && /^[\w-]{11}$/.test(v) ? v : null; }
  } catch { /* not a URL */ }
  return null;
}
const isHttps = (v: string) => { try { return new URL(v).protocol === "https:"; } catch { return false; } };

export const resourceSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title must be 120 characters or fewer"),
  short: z.string().trim().min(10, "Short description must be at least 10 characters").max(200, "Short description must be 200 characters or fewer"),
  full: z.string().trim().max(3000, "Full description must be 3000 characters or fewer"),
  categoryId: z.string().min(1, "Choose a category"),
  topic: z.string().trim().min(2, "Topic is required").max(60, "Topic must be 60 characters or fewer"),
  type: z.enum(["videoFile", "videoLink", "pdf", "document", "link"]),
  url: z.string().trim().optional(),
  hasFile: z.boolean(),
  language: z.enum(["kn", "en", "both"]),
  audience: z.array(z.enum(["volunteers", "trainers", "coordinators", "admins"])).min(1, "Choose at least one audience"),
  order: z.number({ message: "Display order must be a number" }).int("Whole number only").min(0, "0 or more").max(9999, "9999 or less"),
  status: z.enum(["Draft", "Published", "Scheduled", "Archived"]),
  publishDate: z.string().optional(),
}).superRefine((v, ctx) => {
  const mode = RESOURCE_TYPES.find((t) => t.id === v.type)?.mode;
  const needsContent = v.status === "Published" || v.status === "Scheduled";
  if (mode === "url") {
    if (v.url && !isHttps(v.url)) ctx.addIssue({ code: "custom", path: ["url"], message: "Enter a valid https:// link" });
    else if (!v.url && needsContent) ctx.addIssue({ code: "custom", path: ["url"], message: "A link is required to publish" });
    else if (v.url && v.type === "videoLink" && !youtubeId(v.url) && !/\.(mp4|webm)(\?|$)/i.test(v.url)) ctx.addIssue({ code: "custom", path: ["url"], message: "Use a YouTube link or a direct .mp4/.webm link" });
  } else if (!v.hasFile && needsContent) ctx.addIssue({ code: "custom", path: ["hasFile"], message: "Upload a file to publish" });
  if (v.status === "Scheduled") { if (!v.publishDate) ctx.addIssue({ code: "custom", path: ["publishDate"], message: "Choose the date it should go live" }); }
});
export type ResourceForm = z.infer<typeof resourceSchema>;

/** Participants see a resource only when published (or scheduled and due), and only if it targets them. */
export const isLive = (r: Pick<LearningResource, "status" | "publishDate">, today: string) => r.status === "Published" ? !r.publishDate || r.publishDate <= today : r.status === "Scheduled" ? !!r.publishDate && r.publishDate <= today : false;
export const visibleTo = (r: LearningResource, aud: Audience, today: string) => isLive(r, today) && r.audience.includes(aud);
export const mediaKind = (m?: MediaRef) => (m?.mime ?? "").split("/")[0];
