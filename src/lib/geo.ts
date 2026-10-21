import { districts, gps, taluks } from "./seed-geo";
export const talukOptions = (district?: string) => taluks.filter((t) => !district || t.district === district).map((t) => t.name);
export const gpOptions = (taluk?: string) => gps.filter((g) => !taluk || g.taluk === taluk).map((g) => g.name);
export { districts };
