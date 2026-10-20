// Fictional demo geography. Assembly constituencies are modelled as a separate relation
// (they list the taluks they overlap with) rather than as children of districts.
export const districts = ["Mysuru", "Mandya", "Tumakuru", "Belagavi", "Kalaburagi"];
export const taluks: { name: string; district: string }[] = [
  { name: "Nanjangud", district: "Mysuru" }, { name: "Hunsur", district: "Mysuru" },
  { name: "Maddur", district: "Mandya" }, { name: "Pandavapura", district: "Mandya" },
  { name: "Sira", district: "Tumakuru" }, { name: "Gubbi", district: "Tumakuru" },
  { name: "Gokak", district: "Belagavi" }, { name: "Athani", district: "Belagavi" },
  { name: "Sedam", district: "Kalaburagi" }, { name: "Chincholi", district: "Kalaburagi" },
];
export const gps: { name: string; taluk: string }[] = [
  { name: "Hosahalli GP", taluk: "Nanjangud" }, { name: "Kadakola GP", taluk: "Nanjangud" },
  { name: "Bilikere GP", taluk: "Hunsur" }, { name: "Kebbehundi GP", taluk: "Maddur" },
  { name: "Hirisave GP", taluk: "Pandavapura" }, { name: "Dugganahalli GP", taluk: "Sira" },
  { name: "Chelur GP", taluk: "Gubbi" }, { name: "Konnur GP", taluk: "Gokak" },
  { name: "Aigali GP", taluk: "Athani" }, { name: "Mulkhed GP", taluk: "Sedam" }, { name: "Kodli GP", taluk: "Chincholi" },
];
// AC ↔ taluk is many-to-many and need not nest under one district.
export const acs: { name: string; taluks: string[] }[] = [
  { name: "Demo AC – Nanjangud North", taluks: ["Nanjangud", "Hunsur"] },
  { name: "Demo AC – Maddur", taluks: ["Maddur", "Pandavapura"] },
  { name: "Demo AC – Sira–Gubbi", taluks: ["Sira", "Gubbi"] },
  { name: "Demo AC – Gokak", taluks: ["Gokak", "Athani"] },
  { name: "Demo AC – Sedam", taluks: ["Sedam", "Chincholi"] },
  { name: "Demo AC – Mandya–Nanjangud Border", taluks: ["Pandavapura", "Nanjangud"] },
];
export const districtOf = (taluk: string) => taluks.find((t) => t.name === taluk)?.district ?? "";
export const GRIEVANCE_CATEGORIES = [
  { id: "water", kn: "ಕುಡಿಯುವ ನೀರು", en: "Water" }, { id: "roads", kn: "ರಸ್ತೆಗಳು", en: "Roads" },
  { id: "sanitation", kn: "ನೈರ್ಮಲ್ಯ", en: "Sanitation" }, { id: "lighting", kn: "ಬೀದಿ ದೀಪ", en: "Street lighting" },
  { id: "facilities", kn: "ಸಾರ್ವಜನಿಕ ಸೌಲಭ್ಯ", en: "Public facilities" }, { id: "documents", kn: "ದಾಖಲೆ / ಸೇವಾ ಪ್ರವೇಶ", en: "Documentation / service access" },
  { id: "education", kn: "ಶಿಕ್ಷಣ", en: "Education" }, { id: "health", kn: "ಆರೋಗ್ಯ ಪ್ರವೇಶ", en: "Health access" }, { id: "other", kn: "ಇತರೆ", en: "Other" },
];
