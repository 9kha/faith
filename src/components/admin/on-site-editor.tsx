"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Edit3,
  X,
  Save,
  RotateCcw,
  MousePointerClick,
  Check,
  Loader2,
  Database,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LiveEditItem } from "@/lib/settings";

interface OnSiteAdminEditorProps {
  initialLiveContent?: Record<string, Record<string, LiveEditItem>>;
}

// Clean pathname helper
function cleanPath(pathname?: string | null): string {
  if (!pathname || pathname === "") return "/";
  let clean = pathname.trim().split("?")[0].split("#")[0];
  if (!clean.startsWith("/")) clean = "/" + clean;
  if (clean.length > 1 && clean.endsWith("/")) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

export function OnSiteAdminEditor({ initialLiveContent }: OnSiteAdminEditorProps) {
  const pathname = usePathname();
  const currentPath = cleanPath(pathname);

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setIsAdminUser(true);
      })
      .catch(() => {});
  }, []);

  // In-memory tracked edits for current page: { [selectorKey]: LiveEditItem }
  const editsRef = useRef<Record<string, LiveEditItem>>({});
  const initialDataRef = useRef<Record<string, Record<string, LiveEditItem>>>(
    initialLiveContent || {}
  );

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/login");

  // Generate robust, valid CSS selector path for any DOM element
  const getElementSelector = useCallback((el: Element): string => {
    if (el.id) return `#${el.id}`;

    const path: string[] = [];
    let curr: Element | null = el;

    while (
      curr &&
      curr !== document.body &&
      curr.id !== "on-site-editor-root"
    ) {
      if (curr.id) {
        path.unshift(`#${curr.id}`);
        break;
      }

      const parent: HTMLElement | null = curr.parentElement;
      if (!parent) {
        path.unshift(curr.tagName.toLowerCase());
        break;
      }

      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === curr!.tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(curr);
        // Guaranteed index >= 0, so index + 1 >= 1. Never generates :nth-of-type(0)!
        path.unshift(`${curr.tagName.toLowerCase()}:nth-of-type(${index + 1})`);
      } else {
        path.unshift(curr.tagName.toLowerCase());
      }

      curr = parent;
    }

    return path.join(" > ");
  }, []);

  // Apply a single LiveEditItem to the DOM using selector with text-content fallback
  const applySingleEdit = useCallback((entry: LiveEditItem): boolean => {
    if (!entry || !entry.newHtml) return false;

    // 1. Try CSS selector first
    if (entry.selector) {
      try {
        const el = document.querySelector(entry.selector);
        if (
          el &&
          (!entry.tag || el.tagName.toLowerCase() === entry.tag.toLowerCase())
        ) {
          if (el.innerHTML !== entry.newHtml) {
            el.innerHTML = entry.newHtml;
          }
          el.setAttribute("data-live-applied", "true");
          return true;
        }
      } catch {
        // Selector failed or was modified, fall through to fallback
      }
    }

    // 2. Intelligent Fallback: match by tag and originalText or newText
    if (entry.tag && (entry.originalText || entry.newText)) {
      const candidates = document.querySelectorAll(entry.tag);
      for (const el of Array.from(candidates)) {
        if (el.closest("#on-site-editor-root")) continue;
        const currentText = el.textContent?.trim() || "";
        const orig = entry.originalText?.trim() || "";
        const target = entry.newText?.trim() || "";

        if (
          (orig && currentText === orig) ||
          (target && currentText === target)
        ) {
          if (el.innerHTML !== entry.newHtml) {
            el.innerHTML = entry.newHtml;
          }
          el.setAttribute("data-live-applied", "true");
          return true;
        }
      }
    }

    return false;
  }, []);

  // Apply all edits for the current page to the DOM
  const applyAllEdits = useCallback(() => {
    const edits = editsRef.current;
    if (!edits || Object.keys(edits).length === 0) return;

    Object.values(edits).forEach((entry) => {
      applySingleEdit(entry);
    });
  }, [applySingleEdit]);

  // Load edits on mount or route change: Server DB initialContent -> localStorage -> fallback API fetch
  useEffect(() => {
    if (isAdminRoute) return;

    let mergedEdits: Record<string, LiveEditItem> = {};

    // 1. Load from server-injected initial content from DB
    if (initialDataRef.current && initialDataRef.current[currentPath]) {
      mergedEdits = { ...initialDataRef.current[currentPath] };
    }

    // 2. Overlay any recent localStorage edits for this pathname
    try {
      const stored = localStorage.getItem(`live_edits_${currentPath}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          // Normalize legacy string format { [sel]: html } to LiveEditItem
          Object.entries(parsed).forEach(([key, val]) => {
            if (typeof val === "string") {
              mergedEdits[key] = {
                id: key,
                selector: key,
                tag: key.split(">").pop()?.trim().split(":")[0] || "div",
                originalText: "",
                newHtml: val,
                newText: val.replace(/<[^>]+>/g, "").trim(),
              };
            } else if (val && typeof val === "object") {
              mergedEdits[key] = val as LiveEditItem;
            }
          });
        }
      }
    } catch {
      // ignore
    }

    editsRef.current = mergedEdits;
    setEditCount(Object.keys(mergedEdits).length);

    // Apply immediately to DOM
    applyAllEdits();

    // 3. Reconcile with latest database data in background
    fetch(`/api/live-content?pathname=${encodeURIComponent(currentPath)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.edits && Object.keys(data.edits).length > 0) {
          editsRef.current = { ...editsRef.current, ...data.edits };
          setEditCount(Object.keys(editsRef.current).length);
          applyAllEdits();
        }
      })
      .catch(() => {
        // silent fallback to current edits
      });

    // 4. MutationObserver for continuous reconciliation across React hydration
    // Watches for 3 seconds to catch any dynamic hydration overrides
    let observerActive = true;
    const observer = new MutationObserver(() => {
      if (observerActive) {
        applyAllEdits();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const timer = setTimeout(() => {
      observerActive = false;
      observer.disconnect();
    }, 3500);

    // Read edit mode state
    try {
      const active = localStorage.getItem("admin_live_edit_mode") === "true";
      setIsAdminMode(active);
    } catch {
      // ignore
    }

    return () => {
      observerActive = false;
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [currentPath, isAdminRoute, applyAllEdits]);

  // Toggle contentEditable on all content text elements when isAdminMode changes
  useEffect(() => {
    if (isAdminRoute) return;

    const editorRoot = document.getElementById("on-site-editor-root");
    const editableTags = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "span.price-tag",
      "span.live-editable",
      "blockquote",
    ];
    const elements: HTMLElement[] = [];

    editableTags.forEach((tag) => {
      document.querySelectorAll(tag).forEach((el) => {
        if (
          editorRoot?.contains(el) ||
          el.closest("#on-site-editor-root") ||
          el.closest("header") ||
          el.closest("footer") ||
          el.closest("button") ||
          el.closest("input") ||
          el.closest("select") ||
          el.closest("textarea") ||
          el.closest("nav") ||
          el.closest("svg")
        ) {
          return;
        }
        elements.push(el as HTMLElement);
      });
    });

    if (isAdminMode) {
      elements.forEach((el) => {
        el.setAttribute("contenteditable", "true");
        el.setAttribute("data-live-editable", "true");
        el.classList.add(
          "outline-2",
          "outline-dashed",
          "outline-amber-500",
          "hover:outline-blue-500",
          "hover:bg-amber-500/10",
          "rounded",
          "transition-all",
          "cursor-text"
        );

        if (!el.getAttribute("data-original-text")) {
          el.setAttribute("data-original-text", el.textContent?.trim() || "");
        }

        const handleInput = () => {
          const sel = getElementSelector(el);
          const origText =
            el.getAttribute("data-original-text") ||
            el.textContent?.trim() ||
            "";

          editsRef.current[sel] = {
            id: sel,
            selector: sel,
            tag: el.tagName.toLowerCase(),
            originalText: origText,
            newHtml: el.innerHTML,
            newText: el.textContent?.trim() || "",
          };

          el.classList.add("ring-2", "ring-emerald-500");
          setHasEdits(true);
          setEditCount(Object.keys(editsRef.current).length);
        };

        el.oninput = handleInput;
      });
    } else {
      elements.forEach((el) => {
        el.removeAttribute("contenteditable");
        el.removeAttribute("data-live-editable");
        el.classList.remove(
          "outline-2",
          "outline-dashed",
          "outline-amber-500",
          "hover:outline-blue-500",
          "hover:bg-amber-500/10",
          "rounded",
          "cursor-text",
          "ring-2",
          "ring-emerald-500"
        );
        el.oninput = null;
      });
    }

    return () => {
      elements.forEach((el) => {
        el.removeAttribute("contenteditable");
        el.removeAttribute("data-live-editable");
        el.oninput = null;
      });
    };
  }, [isAdminMode, currentPath, isAdminRoute, getElementSelector]);

  if (isAdminRoute) return null;

  const toggleAdminMode = () => {
    const next = !isAdminMode;
    setIsAdminMode(next);
    try {
      localStorage.setItem("admin_live_edit_mode", next ? "true" : "false");
    } catch {
      // ignore
    }
  };

  // PERSIST EDITS TO DATABASE VIA API
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = editsRef.current;

      // 1. Post to API to save into database (db.setting)
      const res = await fetch("/api/live-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathname: currentPath,
          edits: payload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save edits to database");
      }

      // 2. Also cache in localStorage for instant local backup
      localStorage.setItem(
        `live_edits_${currentPath}`,
        JSON.stringify(payload)
      );

      // 3. Update memory ref
      if (initialDataRef.current) {
        initialDataRef.current[currentPath] = payload;
      }

      setSavedSuccess(true);
      setHasEdits(false);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (e) {
      console.error("Save to database failed:", e);
      alert(
        e instanceof Error
          ? `Could not save edits: ${e.message}`
          : "Failed to persist edits to database."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // RESET PAGE CONTENT IN DATABASE
  const handleResetCurrentPage = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all visual edits on this page back to original server defaults?"
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await fetch(
        `/api/live-content?pathname=${encodeURIComponent(currentPath)}`,
        { method: "DELETE" }
      );
      localStorage.removeItem(`live_edits_${currentPath}`);
      editsRef.current = {};
      setHasEdits(false);
      setEditCount(0);
      window.location.reload();
    } catch (e) {
      console.error("Reset failed:", e);
      alert("Reset failed. Please check network connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAdminRoute || !isAdminUser) return null;

  return (
    <div id="on-site-editor-root" className="pointer-events-auto">
      {/* 1. Floating Toggle Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleAdminMode}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-2xl transition-all ${
            isAdminMode
              ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 shadow-amber-500/40"
              : "bg-slate-900 text-white hover:bg-slate-800 border border-slate-700/80 shadow-black/40"
          }`}
          title="Toggle Direct On-Site Visual Live Editing"
        >
          <Edit3 className="h-4 w-4" />
          <span>{isAdminMode ? "Direct Live Edit: ACTIVE" : "Visual Live Edit"}</span>
          {editCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-amber-400 text-[10px] font-mono font-bold">
              {editCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Top Interactive Live Editing Bar (Shown when active) */}
      {isAdminMode && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/95 text-white backdrop-blur border border-amber-500/40 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 shadow-md">
                <MousePointerClick className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold flex items-center gap-2">
                  <span>Direct On-Site Live Editor</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {currentPath}
                  </span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Click on <strong>any headline, tagline, or paragraph</strong> directly on this page to edit and save to the database!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetCurrentPage}
                  disabled={isSaving}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
                  title="Reset all live edits for this page to original"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving to DB...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span>Saved to Database!</span>
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    <span>
                      Save to DB {editCount > 0 ? `(${editCount})` : ""}
                    </span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setIsAdminMode(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Exit Visual Live Edit"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
