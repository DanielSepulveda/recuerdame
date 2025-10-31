import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { esMX } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { env } from "@/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recuerdame",
  description: "Honra a tus seres queridos con un altar colaborativo",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          dynamic
          localization={esMX}
          publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            theme: shadcn,
          }}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
