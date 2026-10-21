/** Attribution for third-party media used on the public pages. Licences require these credits to stay visible. */
export interface Credit { id: string; title: string; author: string; license: string; licenseUrl: string; source: string; note?: string }
const C = (id: string, title: string, author: string, license: string, licenseUrl: string, source: string, note = "Resized and cropped for display."): Credit => ({ id, title, author, license, licenseUrl, source, note });
export const CREDITS: Record<string, Credit> = {
  about: C("about", "Rural women and cattle on a village road in Raichur", "Vraj Acharya, WELL Labs", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Rural_women_and_cattle_on_a_village_road_in_Raichur.jpg"),
  how: C("how", "Women self help group foundation", "Pondicherry17", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Women_self_help_group_foundation.jpg"),
  features: C("features", "Village Women at a Crossroads – Near Mysore", "Adam Jones (Adam63)", "CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0", "https://commons.wikimedia.org/wiki/File:Village_Women_at_a_Crossroads_-_Near_Mysore_-_India.JPG"),
  impact: C("impact", "Women Farmers Sowing in Karnataka, India", "Vraj Acharya, WELL Labs", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Women_Farmers_Sowing_in_Karnataka,_India.jpg", "Resized, cropped and darkened for use as a background."),
  journey: C("journey", "Maravanthe Gram Panchayat Office", "Rohan Pinto", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Maravanthe_Gram_Panchayat_Office.jpg"),
  learning: C("learning", "India – Faces – Rural women driving their own change 1", "McKay Savage", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0", "https://commons.wikimedia.org/wiki/File:India_-_Faces_-_Rural_women_driving_their_own_change_1_(2229752965).jpg"),
  video: C("video", "Women in Panchayat (documentary, 2012)", "Indian Diplomacy", "CC BY 3.0", "https://creativecommons.org/licenses/by/3.0", "https://commons.wikimedia.org/wiki/File:Women_in_Panchayat.webm", "Poster image is a frame from the film."),
};
