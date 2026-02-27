"use client";

import { useState } from "react";

export default function Header({ title = "Inbox", onCompose }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        
        {/* Left: App Title */}
        <h1 className="text-lg font-semibold tracking-tight">
          {title}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Compose Button */}
          <button
            onClick={onCompose}
            className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center active:scale-95 transition"
          >
            ✉️
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition"
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-4 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>

          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}