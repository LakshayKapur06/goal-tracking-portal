import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Goal Setting & Tracking Portal",
  description: "In-House Goal Setting & Tracking Portal for alignment and visibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <div className="app-container">
            <Navigation />
            <main className="main-content">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
