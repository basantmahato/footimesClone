import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConditionalLayout from "@/components/ConditionalLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Footimes | Live Football Scores, Fixtures & News",
    template: "%s | Footimes"
  },
  description: "Get real-time football scores, upcoming match fixtures, tournament details, and latest football news from around the world on Footimes.",
  keywords: ["football", "live scores", "soccer updates", "match fixtures", "football news", "tournament stats", "Footimes"],
  authors: [{ name: "Footimes Team" }],
  metadataBase: new URL('https://footimes.com'),
  openGraph: {
    title: "Footimes | Live Football Scores & News",
    description: "Stay updated with live football scores, tournament details, and latest news from Footimes.",
    url: 'https://footimes.com',
    siteName: 'Footimes',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Footimes - Live Football Scores',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Footimes | Live Football Scores & News",
    description: "Stay updated with live football scores and latest news.",
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans bg-black text-white min-h-screen`}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </body>
    </html>
  );
}
