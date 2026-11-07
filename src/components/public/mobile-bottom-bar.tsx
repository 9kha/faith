"use client";

import Link from "next/link";
import { Phone, MessageCircle, Search, Home, Building2 } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/buy", icon: Search, label: "Buy" },
  { href: "/partner-program", icon: Building2, label: "Partner" },
  { href: "/contact", icon: MessageCircle, label: "Contact" },
] as const;

const CTA_ITEMS = [
  { href: "tel:+919876543210", icon: Phone, label: "Call" },
  { href: "https://wa.me/919876543210", icon: MessageCircle, label: "WhatsApp" },
] as const;

export function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
      <nav className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors"
            >
              <Icon
                size={20}
                className={`${
                  isActive
                    ? "text-primary"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              />
              <span className={`font-medium ${
                isActive ? "text-primary" : "text-gray-500"
              }`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex justify-center py-2 border-t border-gray-100">
        {CTA_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("https://") ? "_blank" : undefined}
            rel={item.href.startsWith("https://") ? "noopener noreferrer" : undefined}
            className="flex flex-col items-center gap-1 px-4 py-2 text-xs bg-primary text-white rounded-xl transition-colors hover:bg-primary/90"
          >
            <item.icon size={18} />
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
