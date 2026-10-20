import type { Metadata } from "next";
import { Inter, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const kannada = Noto_Sans_Kannada({ variable: "--font-kannada", subsets: ["kannada"] });

export const metadata: Metadata = {
  title: "Grama Nayaka · ಗ್ರಾಮ ನಾಯಕ",
  description: "Learn. Lead. Transform your community. (Prototype with demo data)",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kn" suppressHydrationWarning>
      <body className={`${inter.variable} ${kannada.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
