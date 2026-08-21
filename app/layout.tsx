import type { Metadata } from "next";
import { Inter, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Trio tipográfico da marca (Brutalismo Editorial):
// Inter para UI e corpo, Lora para títulos e abertura editorial,
// JetBrains Mono para IDs, prazos e números de processo.
// next/font self-hospeda as fontes; nenhuma requisição externa em runtime.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JuriAI",
    template: "%s · JuriAI",
  },
  description:
    "Plataforma juridica anti-alucinacao para escritorios de advocacia civel B2B. A IA sugere, o advogado aprova, tudo rastreado.",
  applicationName: "JuriAI",
  openGraph: {
    title: "JuriAI",
    description:
      "Plataforma juridica anti-alucinacao para escritorios de advocacia civel B2B.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col lg:flex-row">{children}</body>
    </html>
  );
}
