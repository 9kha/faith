"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  Search,
  Phone,
  MessageCircle,
  Home,
  Building2,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function PublicHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Home size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">
            ChannelPartner
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link
            href="/buy"
            className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Buy
          </Link>
          <Link
            href="/rent"
            className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Rent
          </Link>
          <Link
            href="/projects"
            className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/builders"
            className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Builders
          </Link>
          <Link
            href="/blog"
            className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Blog
          </Link>
        </nav>

        {/* Right side: search + CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Button
              variant="outline"
              size="sm"
              className="w-full pl-10 pr-4 text-left text-sm"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              Search properties, projects…
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex items-center gap-2 px-3"
            asChild
          >
            <Link href="/partner-program">
              <Building2 size={16} className="mr-1" />
              Partner Program
            </Link>
          </Button>
          <Button size="sm" className="px-4" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          onClick={() => setSearchOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Search</h2>
                <button
                  className="p-2 text-gray-400 hover:text-gray-900"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <Input
                autoFocus
                placeholder="Search properties, projects, builders…"
                className="text-lg pl-10"
              />
              <div className="mt-6 text-sm text-gray-500">
                Type a location, project name, or builder to get started.
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
