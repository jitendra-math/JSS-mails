"use client";

export default function Header({ title = "JSS Mails", onCompose }) {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100 safe-top">
      <div className="flex items-center justify-between px-5 py-3">
        
        {/* Left: App Title */}
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Compose Button (Premium SVG Icon) */}
          <button
            onClick={onCompose}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>

          {/* Direct Logout Button */}
          <button
            onClick={async () => {
              if (confirm("Are you sure you want to logout?")) {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }
            }}
            className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center active:scale-95 transition border border-gray-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
          
        </div>
      </div>
    </div>
  );
}
