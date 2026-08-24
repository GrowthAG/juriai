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
  metadataBase: new URL("https://app.juriai.adv.br"),
  title: {
    default: "JuriAI : Inteligência Forense & Gestão de Contencioso Cível",
    template: "%s · JuriAI",
  },
  description:
    "Todo escritório tem fatos que não conseguiu provar. O seu não precisa ser um deles. Matriz Fato x Prova, Diário Oficial DJEN e Jurimetria sem alucinações.",
  applicationName: "JuriAI",
  openGraph: {
    title: "JuriAI : Inteligência Forense & Gestão de Contencioso Cível",
    description:
      "Todo escritório tem fatos que não conseguiu provar. O seu não precisa ser um deles. Matriz Fato x Prova, Diário Oficial DJEN e Jurimetria sem alucinações.",
    url: "https://app.juriai.adv.br",
    siteName: "JuriAI LegalTech",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://app.juriai.adv.br/brand/og-juriai-cover.png?v=20260824v2",
        width: 1200,
        height: 630,
        alt: "JuriAI : Inteligência Forense para Advocacia Cível",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JuriAI : Inteligência Forense & Gestão de Contencioso Cível",
    description:
      "Todo escritório tem fatos que não conseguiu provar. O seu não precisa ser um deles. Matriz Fato x Prova, Diário Oficial DJEN e Jurimetria.",
    images: ["https://app.juriai.adv.br/brand/og-juriai-cover.png?v=20260824v2"],
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
