import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import "@ant-design/v5-patch-for-react-19";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog_Api",
  description: ".....",
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
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            duration: 2000,
            style: {
              borderRadius: "14px",
              padding: "14px 18px",
              fontSize: "15px",
              fontWeight: 500,
              background: "white",
              color: "#1f2937",
              border: "1px solid #e5e7eb",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              overflow: "hidden",
              position: "relative",
            },
          }}
        />
      </body>
    </html>
  );
}
