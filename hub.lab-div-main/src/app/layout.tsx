import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hub de Comunicação Científica do Lab-Div",
  description: "O hub oficial de comunicação científica do Instituto de Física da Universidade de São Paulo.",
  // Adicione estas linhas abaixo na sua metadata:
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LabDiv",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans selection:bg-brand-yellow selection:text-brand-blue bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 transition-colors duration-200 antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
