"use client";

export default function BottomNav({ activeFolder, onChangeFolder }) {
  const navItems = [
    {
      id: "inbox",
      label: "Inbox",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
      ),
    },
    {
      id: "sent",
      label: "Sent",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      ),
    },
    {
      id: "trash",
      label: "Trash",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      ),
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 border-t border-gray-100 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeFolder === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeFolder(item.id)}
              className={`flex flex-col items-center justify-center w-full py-1 space-y-1 transition active:scale-95 ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
            >
              <div className={isActive ? "scale-110 transition-transform" : ""}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
