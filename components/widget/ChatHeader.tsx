"use client";

interface ChatHeaderProps {
  onClose: () => void;
}

export default function ChatHeader({ onClose }: ChatHeaderProps) {
  const businessName =
    process.env.NEXT_PUBLIC_BUSINESS_NAME || "Mitchell Legal Consulting";
  const color = process.env.NEXT_PUBLIC_WIDGET_COLOR || "#2d2d2d";

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
      style={{ backgroundColor: color }}
    >
      <div>
        <p className="text-white text-sm font-semibold">{businessName}</p>
        <p className="text-white/60 text-xs">Ask us anything</p>
      </div>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white transition-colors text-lg leading-none"
        aria-label="Close chat"
      >
        ✕
      </button>
    </div>
  );
}