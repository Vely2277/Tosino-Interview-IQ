import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { InterviewProvider } from "@/contexts/interview-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/contexts/theme-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewIQ - AI-Powered Interview Coach",
  description:
    "Master every interview with AI-powered practice sessions and feedback",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
html, body {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
*, *::before, *::after {
  box-sizing: border-box;
}
        `}</style>
      </head>
        <body className="overflow-x-hidden m-0 p-0 bg-[#f0efe1] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <AuthProvider>
            <InterviewProvider>
                <div>
                {children}
              </div>
            </InterviewProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
