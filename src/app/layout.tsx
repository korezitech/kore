import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/components/session-provider"; // <-- Import it here

const fredoka = Fredoka({ 
  subsets: ["latin"],
  variable: "--font-fredoka", 
});

// This locks the viewport and sets the mobile browser theme color
export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming when tapping inputs on iOS
};

export const metadata: Metadata = {
  title: "KORE | Financial Operating System",
  description: "Personal and business wealth management.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KORE",
  },
  icons: {
    // This is the specific icon Apple looks for
    apple: "/icon-192x192.png", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${fredoka.variable} font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased transition-colors duration-300`}>
        <AuthProvider> {/* <-- Wrap it here */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}