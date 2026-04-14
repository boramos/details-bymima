"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface WishlistHeartProps {
  slug: string;
  size?: "sm" | "md";
}

interface WishlistSummary {
  id: string;
  name: string;
  isDefault: boolean;
  hasSavedProduct: boolean;
}

export function WishlistHeart({ slug, size = "md" }: WishlistHeartProps) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<WishlistSummary[]>([]);
  const [listsLoaded, setListsLoaded] = useState(false);
  const [globalSaved, setGlobalSaved] = useState(false);
  const [savingListId, setSavingListId] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSaved = async () => {
      try {
        const res = await fetch("/api/user/wishlists/saved-slugs");
        if (!res.ok) {
          if (isMounted) setHidden(true);
          return;
        }
        const json = await res.json();
        if (isMounted && json.success) {
          setGlobalSaved(json.data.includes(slug));
        } else if (isMounted) {
          setHidden(true);
        }
      } catch {
        if (isMounted) setHidden(true);
      }
    };
    fetchSaved();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPopoverPos({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideButton = containerRef.current?.contains(target);
      const insidePopover = popoverRef.current?.contains(target);
      if (!insideButton && !insidePopover) {
        setOpen(false);
        setCreatingList(false);
      }
    };
    const handleScroll = () => {
      if (open) updatePosition();
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updatePosition]);

  const loadLists = async () => {
    try {
      const res = await fetch("/api/user/wishlists");
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        const fetchedLists = json.data.map((list: any) => ({
          id: list.id,
          name: list.name,
          isDefault: list.isDefault,
          hasSavedProduct: list.items.some((i: any) => i.productSlug === slug),
        }));
        setLists(fetchedLists);
        setListsLoaded(true);
      }
    } catch {}
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open) {
      updatePosition();
      if (!listsLoaded) {
        void loadLists();
      }
    }
    setOpen((prev) => !prev);
  };

  const toggleList = async (listId: string, currentSaved: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (savingListId) return;

    setSavingListId(listId);

    const newLists = lists.map((l) =>
      l.id === listId ? { ...l, hasSavedProduct: !currentSaved } : l
    );
    setLists(newLists);
    setGlobalSaved(newLists.some((l) => l.hasSavedProduct));

    try {
      const res = await fetch(`/api/user/wishlists/${listId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) throw new Error("Toggle failed");
    } catch {
      const revertedLists = lists.map((l) =>
        l.id === listId ? { ...l, hasSavedProduct: currentSaved } : l
      );
      setLists(revertedLists);
      setGlobalSaved(revertedLists.some((l) => l.hasSavedProduct));
    } finally {
      setSavingListId(null);
    }
  };

  const handleCreateList = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newListName.trim() || createLoading) return;

    setCreateLoading(true);
    try {
      const resCreate = await fetch("/api/user/wishlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      });
      if (!resCreate.ok) throw new Error("Create failed");
      const jsonCreate = await resCreate.json();
      if (!jsonCreate.success || !jsonCreate.data) throw new Error("Invalid response");
      
      const newListId = jsonCreate.data.id;

      const resToggle = await fetch(`/api/user/wishlists/${newListId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      
      if (!resToggle.ok) throw new Error("Toggle failed");

      setLists([
        ...lists,
        {
          id: newListId,
          name: newListName.trim(),
          isDefault: false,
          hasSavedProduct: true,
        },
      ]);
      setGlobalSaved(true);
      setCreatingList(false);
      setNewListName("");
    } catch {
    } finally {
      setCreateLoading(false);
    }
  };

  if (hidden) return null;

  const containerClasses = [
    "rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all",
    size === "sm" ? "w-7 h-7" : "w-9 h-9",
  ].filter(Boolean).join(" ");

  const iconClasses = [
    size === "sm" ? "w-4 h-4" : "w-5 h-5",
    globalSaved ? "fill-rose-500 stroke-rose-500" : "fill-none stroke-[var(--color-dark)] stroke-2"
  ].join(" ");

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={buttonRef}
        aria-label="Guardar en lista"
        onClick={handleOpen}
        className={containerClasses}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={iconClasses}
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {open && popoverPos && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: popoverPos.top,
            left: popoverPos.left,
            transform: "translateX(-50%)",
          }}
          className="z-[9999] w-64 bg-white rounded-2xl shadow-xl border border-[var(--color-primary-pale)] p-4 space-y-3 cursor-default"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Guardar en lista
          </div>

          {!listsLoaded ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--color-primary-pale)] border-t-[var(--color-primary)]"></div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {lists.map((list) => (
                  <button
                    type="button"
                    key={list.id}
                    className="flex items-center gap-3 cursor-pointer group py-1.5 w-full text-left bg-transparent border-none"
                    onClick={(e) => toggleList(list.id, list.hasSavedProduct, e)}
                  >
                    <div 
                      className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-colors ${
                        list.hasSavedProduct 
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)]" 
                          : "border-[var(--color-primary-pale)] group-hover:border-[var(--color-primary)]"
                      }`}
                    >
                      {list.hasSavedProduct && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-[var(--color-dark)] select-none">
                      {list.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-t border-[var(--color-primary-pale)] pt-3 mt-1">
                {!creatingList ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCreatingList(true);
                    }}
                    className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    + Nueva lista
                  </button>
                ) : (
                  <form onSubmit={handleCreateList} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-[var(--color-primary-pale)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newListName.trim() || createLoading}
                      onClick={handleCreateList}
                      className="px-3 py-1.5 bg-[var(--color-dark)] text-white text-xs font-semibold rounded-full hover:bg-black disabled:opacity-50"
                    >
                      {createLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                      ) : (
                        "Crear"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
