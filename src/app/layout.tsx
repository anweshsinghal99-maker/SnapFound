import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapFound · Multimodal AI Lost & Found Radar",
  description: "Zero-Typing Multimodal AI Campus Asset Recovery HUD powered by Gemini 2.5 Flash & Supabase pgvector.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

