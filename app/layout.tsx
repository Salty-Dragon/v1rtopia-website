import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "v1rtopia - A Custom SMP Built for Legends",
  description: "Join v1rtopia, a custom Minecraft SMP built for grinders, builders, and legends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
