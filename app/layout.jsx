import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "JSS Mail",
  description: "Private Mail System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color */}
        <meta name="theme-color" content="#007AFF" />

        {/* Mobile full screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

        {/* iOS icon (optional but nice) */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>

      <body className="min-h-screen bg-softbg">
        {/* TanStack Query Provider wrapping the whole app */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
