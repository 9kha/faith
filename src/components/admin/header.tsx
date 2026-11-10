"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bell, Menu, Settings, LogOut, Calendar, MessageSquare, UserCheck, CheckCheck } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { timeAgo } from "@/lib/format";

type NotificationItem = {
  id: string;
  type: "lead" | "site_visit" | "client";
  title: string;
  subtitle: string;
  time: string;
  status: string;
  href: string;
  isNew: boolean;
};

const commands = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Properties", href: "/admin/properties" },
  { label: "Add property", href: "/admin/properties/new" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Add project", href: "/admin/projects/new" },
  { label: "Builders", href: "/admin/builders" },
  { label: "Add builder", href: "/admin/builders/new" },
  { label: "Media", href: "/admin/media" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminHeader() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isBellOpen, setIsBellOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setNotifications(data.items || []);
            setUnreadCount(data.unreadCount || 0);
          }
        }
      } catch {
        // ignore
      }
    }
    void loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b px-4 py-4">
              <SheetTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Navigate
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-0.5 p-3">
              {commands
                .filter((c) => !c.label.startsWith("Add "))
                .map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-56 justify-start gap-2 text-muted-foreground sm:w-72"
              />
            }
          >
            <Search size={15} />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </SheetTrigger>
          <SheetContent side="top" className="mx-auto mt-24 h-auto max-w-lg rounded-xl border p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="text-sm font-medium">Quick search</SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page…"
                className="h-10"
              />
              <div className="mt-2 max-h-72 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                    No matches for “{query}”
                  </p>
                ) : (
                  results.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <span className="font-medium">{c.label}</span>
                      <span className="text-xs text-muted-foreground">{c.href}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu open={isBellOpen} onOpenChange={setIsBellOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              />
            }
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {unreadCount} action{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => setUnreadCount(0)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No new notifications. Everything is up to date!
                </div>
              ) : (
                notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsBellOpen(false)}
                    className="flex items-start gap-3 p-3 text-xs transition-colors hover:bg-muted/60 block"
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        item.type === "lead"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : item.type === "site_visit"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {item.type === "lead" ? (
                        <MessageSquare className="h-3.5 w-3.5" />
                      ) : item.type === "site_visit" ? (
                        <Calendar className="h-3.5 w-3.5" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-foreground truncate">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(item.time)}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    {item.isNew && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                ))
              )}
            </div>

            <div className="border-t bg-muted/30 p-2 text-center text-xs">
              <Link
                href="/admin/leads"
                onClick={() => setIsBellOpen(false)}
                className="font-semibold text-primary hover:underline"
              >
                View all leads &amp; inquiries →
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 rounded-full pl-1 pr-3" />
            }
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                AD
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">Admin</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              admin@faithventure.com
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin/settings" />}>
              <Settings size={15} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              <LogOut size={15} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
