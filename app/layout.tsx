import type { Metadata } from "next";
// Import your custom Providers component
import Providers from "./providers"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MagicSlides Email Classifier", // Updated title
  description: "Full-Stack Intern Assignment: Gmail and OpenAI classification.", // Updated description
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
        {/* WRAP children with the Providers component */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}