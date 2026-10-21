import { z } from "zod";
import { ageOn } from "./userRules";

const phoneOk = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").slice(-10));
export const userFormSchema = z.object({
  name: z.string().trim().min(2, "Full name is required (2+ characters)").max(80, "Name must be 80 characters or fewer"),
  phone: z.string().trim().refine(phoneOk, "Enter a valid 10-digit mobile number starting with 6–9"),
  email: z.string().trim().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address"),
  dob: z.string().refine((v) => { if (!v) return true; const a = ageOn(v, "2026-10-20"); return Number.isFinite(a) && a >= 18 && a <= 100; }, "Date of birth must give an age between 18 and 100"),
  address: z.string().max(300, "Address must be 300 characters or fewer"),
  role: z.enum(["superAdmin", "districtAdmin", "blockAdmin", "trainingCoordinator", "trainer", "grievanceManager", "contentManager", "volunteer"]),
  district: z.string(), taluk: z.string(), gp: z.string(), villageId: z.string(), sessionId: z.string(),
  status: z.enum(["Active", "Inactive", "Suspended"]),
  reason: z.string(),
}).superRefine((v, ctx) => {
  if (v.role === "volunteer") {
    if (!v.district) ctx.addIssue({ code: "custom", path: ["district"], message: "Choose a district" });
    if (!v.taluk) ctx.addIssue({ code: "custom", path: ["taluk"], message: "Choose a block / taluk" });
    if (!v.gp) ctx.addIssue({ code: "custom", path: ["gp"], message: "Choose a Gram Panchayat" });
  } else {
    if (v.villageId) ctx.addIssue({ code: "custom", path: ["villageId"], message: "Only volunteers can be assigned to a village" });
    if (v.sessionId) ctx.addIssue({ code: "custom", path: ["sessionId"], message: "Only volunteers can be registered for training" });
  }
});
export type UserFormValues = z.infer<typeof userFormSchema>;
