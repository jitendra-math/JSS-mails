import "./globals.css";
import Providers from "@/components/Providers";

// Modern Next.js Metadata API for SEO & PWA
export const metadata = {
  title: "JSS Mail",
  description: "Private Mail System",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",             // Browser tab favicon
    apple: "/apple-touch-icon.png",   // Apple iOS Home Screen icon
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JSS Mail",
  },
};

// Viewport settings for Mobile App feel
export const viewport = {
  themeColor: "#007AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents unwanted zoom on mobile inputs
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-softbg">
        {/* TanStack Query Provider wrapping the whole app */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
