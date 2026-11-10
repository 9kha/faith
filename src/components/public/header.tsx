"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Search,
  Home,
  Building2,
  ChevronRight,
  Loader2,
  X,
  Phone,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { defaultHeaderConfig, type HeaderConfig } from "@/lib/settings";

type Result = { title: string; href: string; meta: string; image?: string | null };

function formatAmount(value?: number | null): string | null {
  if (!value || value <= 0) return null;
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)} K`;
  return `₹${value}`;
}

export function PublicHeader({ initialConfig }: { initialConfig?: HeaderConfig }) {
  const [config, setConfig] = useState<HeaderConfig>(initialConfig || defaultHeaderConfig);
  const pathname = usePathname();
  const router = useRouter();

  // Scroll visibility & modern elevation state
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialConfig) setConfig(initialConfig);
  }, [initialConfig]);

  // Live admin settings sync
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<Partial<HeaderConfig>>) => {
      if (e.detail) {
        setConfig((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("header-config-updated" as any, handleUpdate as any);
    return () => window.removeEventListener("header-config-updated" as any, handleUpdate as any);
  }, []);

  // Smart scroll effect: hide when scrolling down, show when scrolling up
  useEffect(() => {
    if (!config.hideOnScrollDown) {
      setVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 15);

      // Always show when near the top of the page
      if (currentScrollY < 60) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling upward by at least 6px -> show header
      if (lastScrollY.current - currentScrollY > 6) {
        setVisible(true);
      }
      // Scrolling downward by at least 8px -> hide header
      else if (currentScrollY - lastScrollY.current > 8 && currentScrollY > 90) {
        setVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [config.hideOnScrollDown]);

  useEffect(() => {
    const t = setTimeout(() => {
      setOpen(false);
      setQuery("");
      setResults([]);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const q = query.trim();
    if (timer.current) clearTimeout(timer.current);
    if (q.length < 2) {
      const clear = setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(clear);
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [propsRes, projRes] = await Promise.all([
          fetch(`/api/properties/search?keyword=${encodeURIComponent(q)}&limit=5`),
          fetch(`/api/projects?search=${encodeURIComponent(q)}&limit=5`),
        ]);
        const props = propsRes.ok ? await propsRes.json() : { properties: [] };
        const projs = projRes.ok ? await projRes.json() : { projects: [] };
        const mapped: Result[] = [
          ...(props.properties ?? []).map(
            (p: {
              title: string;
              slug: string;
              locality?: string;
              city?: string;
              bhk?: string | null;
              price?: number | null;
              rent?: number | null;
              imageUrl?: string | null;
            }): Result => ({
              title: p.title,
              href: `/properties/${p.slug}`,
              meta: [
                p.bhk,
                p.locality,
                p.city,
                formatAmount(p.price ?? p.rent),
              ]
                .filter(Boolean)
                .join(" · "),
              image: p.imageUrl,
            })
          ),
          ...(projs.projects ?? []).map(
            (p: {
              name: string;
              slug: string;
              city?: string;
              locality?: string;
              priceMin?: number | null;
              imageUrl?: string | null;
            }): Result => ({
              title: p.name,
              href: `/projects/${p.slug}`,
              meta:
                [p.locality, p.city, formatAmount(p.priceMin)]
                  .filter(Boolean)
                  .join(" · ") || "Project",
              image: p.imageUrl,
            })
          ),
        ];
        setResults(mapped.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  const isActive = useMemo(() => {
    return (href: string) =>
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  }, [pathname]);

  const navItems = config.navItems || defaultHeaderConfig.navItems;

  return (
    <div
      className={`${config.sticky ? "sticky top-0 z-50" : "relative z-30"} w-full transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Top Announcement Bar (optional) */}
      {config.showTopBar && config.topBarText && (
        <div className="bg-primary px-4 py-1.5 text-center text-xs font-semibold text-primary-foreground transition-colors shadow-2xs">
          <div className="container-page flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 animate-pulse shrink-0" />
            <span>{config.topBarText}</span>
            {config.topBarLink && (
              <Link
                href={config.topBarLink}
                className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-90 ml-1 font-bold"
              >
                Learn More <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Glass Header */}
      <header
        className={`w-full transition-all duration-200 border-b ${
          scrolled
            ? "border-border/80 bg-background/90 backdrop-blur-xl shadow-xs"
            : "border-border/40 bg-background/75 backdrop-blur-md"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            {config.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.logoUrl}
                alt={config.brandName}
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <span className="grid size-9.5 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md">
                <Home size={18} />
              </span>
            )}
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {config.brandName?.replace(/channelpartner/gi, "Faith Venture") || "Faith Venture"}
              </span>
              {config.brandTagline && (
                <span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
                  {config.brandTagline.replace(/channelpartner/gi, "Realty")}
                </span>
              )}
            </span>
          </Link>

          {/* Modern Pill Navigation Bar */}
          <nav className="hidden items-center gap-1 lg:flex bg-muted/40 p-1 rounded-full border border-border/50">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-foreground/75 hover:bg-background hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span
                      className={`ml-1.5 inline-block rounded-full px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Search Pill */}
          {config.showSearch && (
            <div className="relative hidden w-full max-w-xs items-center md:flex">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    router.push(`/buy?search=${encodeURIComponent(query.trim())}`);
                  }
                  if (e.key === "Escape") setQuery("");
                }}
                placeholder="Search properties, projects…"
                className="h-9.5 rounded-full border-border bg-background/80 pl-9.5 pr-9 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                aria-label="Search"
              />
              {loading && (
                <Loader2
                  size={14}
                  className="absolute right-3.5 animate-spin text-muted-foreground"
                />
              )}
              {!loading && query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setQuery("")}
                  className="absolute right-3 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X size={14} />
                </button>
              )}

              {/* Search dropdown */}
              {focused && query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-11 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl z-50">
                  {results.length === 0 && !loading ? (
                    <p className="px-4 py-5 text-center text-xs text-muted-foreground">
                      No matches found for “{query.trim()}”
                    </p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto py-1.5">
                      {results.map((r) => (
                        <li key={r.href}>
                          <Link
                            href={r.href}
                            className="flex items-center gap-3 rounded-xl mx-1.5 px-3 py-2 transition-colors hover:bg-muted"
                          >
                            {r.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={r.image}
                                alt=""
                                className="size-9 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                                <Building2 size={15} />
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold text-foreground">
                                {r.title}
                              </span>
                              {r.meta && (
                                <span className="block truncate text-[11px] text-muted-foreground">
                                  {r.meta}
                                </span>
                              )}
                            </span>
                            <ChevronRight size={14} className="text-muted-foreground" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-t border-border bg-muted/30 px-3 py-2 text-center text-[10px] font-medium text-muted-foreground">
                    Press <kbd className="rounded border bg-background px-1">Enter</kbd> to see all matches
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Action Icons & CTA */}
          <div className="flex items-center gap-2">
            {config.showContactButton && (
              <Button
                size="sm"
                className="hidden sm:inline-flex rounded-full text-xs font-semibold px-4 h-9 shadow-xs"
                asChild
              >
                <Link href={config.contactButtonHref}>
                  <Phone size={13} className="mr-1.5" />
                  {config.contactButtonText}
                </Link>
              </Button>
            )}

            {config.showThemeToggle && <ThemeToggle />}

            {/* Mobile Sheet Trigger */}
            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  render={<Button variant="ghost" size="icon" className="rounded-full h-9 w-9" />}
                >
                  <Menu size={20} />
                </SheetTrigger>
                <SheetContent side="right" className="flex w-72 flex-col p-0">
                  <SheetHeader className="border-b border-border px-5 py-4">
                    <SheetTitle className="flex items-center gap-2 text-base font-bold">
                      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                        <Home size={16} />
                      </span>
                      {config.brandName}
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 px-3 py-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto space-y-2 border-t border-border p-4">
                    <Button variant="outline" className="w-full rounded-xl text-xs" asChild>
                      <Link href="/partner-program">Partner Program</Link>
                    </Button>
                    <Button className="w-full rounded-xl text-xs" asChild>
                      <Link href={config.contactButtonHref}>{config.contactButtonText}</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
