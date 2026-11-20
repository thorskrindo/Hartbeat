import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hartbeat",
  description: "How every team is really doing, and the one thing to do next."
};
export const viewport: Viewport = { themeColor: "#04060B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Carlito:wght@400;700&display=swap" />
      </head>
      <body>
        <div className="sky" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
