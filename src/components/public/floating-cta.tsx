"use client";

import Link from "next/link";
import { Phone, MessageCircle, Share2 } from "lucide-react";

export function FloatingCTA({
  propertyTitle,
  projectName,
  phoneNumber = "+91 98765 43210",
}: {
  propertyTitle?: string;
  projectName?: string;
  phoneNumber?: string;
}) {
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in${propertyTitle ? ` ${propertyTitle}` : ""}${
      projectName ? ` ${projectName}` : ""
    }. Please share more details.`
  );

  return (
    <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2 lg:hidden">
      <a
        href={`https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-all transform hover:scale-105"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={`tel:${phoneNumber.replace(/\D/g, "")}`}
        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-all transform hover:scale-105"
        aria-label="Call"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}

export function ShareButton({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const shareData = { title, url };

  return (
    <button
      onClick={() => {
        if (navigator.share) {
          navigator.share(shareData);
        } else {
          navigator.clipboard.writeText(url);
        }
      }}
      className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-lg hover:bg-gray-100 transition-all border border-gray-200"
      aria-label="Share"
    >
      <Share2 className="h-6 w-6" />
    </button>
  );
}
