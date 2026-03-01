"use client";

// Tere premium Lucide icons yahan import ho gaye
import { Mail, Send, Trash2 } from "lucide-react";

export default function BottomNav({ activeFolder, onChangeFolder }) {
  const navItems = [
    {
      id: "inbox",
      label: "Inbox",
      // Inbox ke liye standard Mail icon
      icon: (isActive) => <Mail className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />,
    },
    {
      id: "sent",
      label: "Sent",
      // Sent ke liye Paper Plane (Send) icon
      icon: (isActive) => <Send className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />,
    },
    {
      id: "trash",
      label: "Trash",
      // Trash ke liye wo exact trash-2 icon jo tune bheja tha
      icon: (isActive) => <Trash2 className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />,
    }
  ];

  return (
    // 🪟 Premium iOS Frosted Glass Effect
    <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-white/70 border-t border-white/40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] safe-bottom pb-2">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeFolder === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeFolder(item.id)}
              className={`flex flex-col items-center justify-center w-full py-1 space-y-1 transition-all duration-200 active:scale-90 ${
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-500"
              }`}
            >
              {/* Icon container with bounce effect on active */}
              <div className={`transition-all duration-300 ${isActive ? "scale-110 -translate-y-0.5 drop-shadow-sm" : ""}`}>
                {item.icon(isActive)}
              </div>
              
              {/* Label */}
              <span className={`text-[10px] tracking-wide transition-all ${isActive ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
