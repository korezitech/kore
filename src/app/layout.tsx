import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/components/session-provider"; // <-- Import it here

const fredoka = Fredoka({ 
  subsets: ["latin"],
  variable: "--font-fredoka", 
});

export const metadata: Metadata = {
  title: "KORE | Financial Operating System",
  description: "Personal and business wealth management.",
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