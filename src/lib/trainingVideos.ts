import type { L } from "./types";

/**
 * Videos shown in the home-page "training programme" player.
 * - `src`: a file under /public (mp4 or webm), or `youtubeId` for a privacy-enhanced YouTube embed.
 * - Replace or extend this list with the programme's own training recordings; keep `sample: true` only for stock clips.
 * The bundled clip is a licensed documentary about women in village councils. It is NOT footage of this programme's training.
 */
export interface TrainingVideo { id: string; title: L; summary: L; src?: string; youtubeId?: string; poster: string; minutes: number; sample?: boolean; creditId?: string }
export const TRAINING_VIDEOS: TrainingVideo[] = [
  {
    id: "women-in-panchayat",
    title: { en: "Women in village councils (sample film)", kn: "ಗ್ರಾಮ ಸಭೆಗಳಲ್ಲಿ ಮಹಿಳೆಯರು (ಮಾದರಿ ಚಿತ್ರ)" },
    summary: { en: "A short documentary on how villagers, especially women, take part in Panchayat governance.", kn: "ಹಳ್ಳಿಗರು, ವಿಶೇಷವಾಗಿ ಮಹಿಳೆಯರು, ಪಂಚಾಯತ್ ಆಡಳಿತದಲ್ಲಿ ಹೇಗೆ ಭಾಗವಹಿಸುತ್ತಾರೆ ಎಂಬ ಕಿರು ಸಾಕ್ಷ್ಯಚಿತ್ರ." },
    src: "/videos/women-in-panchayat.webm", poster: "/videos/women-in-panchayat-poster.jpg", minutes: 5, sample: true, creditId: "video",
  },
];
