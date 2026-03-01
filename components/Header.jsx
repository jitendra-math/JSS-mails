"use client";

import Image from "next/image";
import { SquarePen, LogOut } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";

export default function Header({ onCompose }) {
  
  const handleLogout = async () => {
    triggerHaptic("heavy"); // Logout dabate hi strong feel
    if (confirm("Are you sure you want to log out?")) {
      triggerHaptic("success");
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  const handleCompose = () => {
    triggerHaptic("medium"); // Compose kholte hi solid tick
    onCompose();
  };

  return (
    // 🪟 Premium iOS Frosted Header
    <div className="sticky top-0 z-50 backdrop-blur-2xl bg-white/75 border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] safe-top">
      <div className="flex items-center justify-between px-5 py-3">
        
        {/* Left: App Logo (Perfectly scaled for 3009x1087 ratio) */}
        <div className="flex items-center active:opacity-70 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="JSS Mails Logo" 
            width={120} 
            height={43} 
            className="h-8 w-auto object-contain" // Height fix kardi, width apne aap ratio ke hisaab se adjust hogi
            priority 
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Logout Button (Sleek grey circle) */}
          <button
            onClick={handleLogout}
            className="w-[38px] h-[38px] rounded-full bg-gray-50 text-gray-400 hover:text-red-500 flex items-center justify-center active:scale-90 transition-all duration-200 border border-gray-200/60 shadow-sm"
            title="Log Out"
          >
            <LogOut className="w-[18px] h-[18px] ml-0.5" strokeWidth={2.5} />
          </button>
          
          {/* Compose Button (Apple iOS Style Blue Gradient) */}
          <button
            onClick={handleCompose}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center active:scale-90 transition-all duration-200 shadow-[0_4px_12px_rgba(0,112,243,0.35)] hover:shadow-[0_6px_16px_rgba(0,112,243,0.45)]"
            title="Compose Mail"
          >
            <SquarePen className="w-[20px] h-[20px] ml-0.5 mb-0.5" strokeWidth={2.5} />
          </button>

        </div>
      </div>
    </div>
  );
}
