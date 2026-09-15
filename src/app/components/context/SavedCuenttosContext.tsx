"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import { SavedCuentto } from "@/types/cuentto";
import { fetchSavedCuenttos, toggleSaveCuentto } from "@/lib/api/savedCuentto";
import { isAuthenticated } from "@/lib/api/auth";

interface SavedCuenttosContextValue {
  /** Full saved rows, newest first — what the /saved page renders. */
  savedCuenttos: SavedCuentto[];
  loading: boolean;
  error: string | null;
  isSaved: (cuenttoId: number) => boolean;
  /** True while this cuentto's toggle request is in flight. */
  isPending: (cuenttoId: number) => boolean;
  toggleSave: (cuenttoId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const noop = async () => {};

const SavedCuenttosContext = createContext<SavedCuenttosContextValue | undefined>(
  undefined,
);

const SAVE_ERROR = "Could not update your saved Cuenttos. Please try again.";

/**
 * Holds the current user's saved-cuentto state for the whole app shell.
 *
 * The feed endpoints don't return an `isSaved` flag per cuentto, so the only
 * way to render a bookmark in its true state is to know the saved set. This
 * loads it once per shell mount and keeps it in sync as the user toggles,
 * which also means unsaving from the /saved page removes the card instantly
 * without a round trip.
 */
export function SavedCuenttosProvider({ children }: { children: ReactNode }) {
  const [savedCuenttos, setSavedCuenttos] = useState<SavedCuentto[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());
  const [pendingIds, setPendingIds] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guards against a toggle's background refresh landing after the component
  // unmounts, and against overlapping refreshes clobbering each other.
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated()) {
      setSavedCuenttos([]);
      setSavedIds(new Set());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSavedCuenttos();
      if (!mountedRef.current) return;
      setSavedCuenttos(rows);
      setSavedIds(new Set(rows.map((row) => row.cuenttoId)));
    } catch (err) {
      console.error(err);
      if (!mountedRef.current) return;
      setError("Could not load your saved Cuenttos.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // One load per app-shell mount. The shell persists across client-side
  // navigation inside the (app) route group, so this isn't re-run per page.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSaved = useCallback(
    (cuenttoId: number) => savedIds.has(cuenttoId),
    [savedIds],
  );

  const isPending = useCallback(
    (cuenttoId: number) => pendingIds.has(cuenttoId),
    [pendingIds],
  );

  const toggleSave = useCallback(
    async (cuenttoId: number) => {
      if (pendingIds.has(cuenttoId)) return;

      const wasSaved = savedIds.has(cuenttoId);

      setPendingIds((prev) => new Set(prev).add(cuenttoId));
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(cuenttoId);
        else next.add(cuenttoId);
        return next;
      });
      if (wasSaved) {
        setSavedCuenttos((prev) =>
          prev.filter((row) => row.cuenttoId !== cuenttoId),
        );
      }

      try {
        const response = await toggleSaveCuentto(cuenttoId);
        if (!mountedRef.current) return;

        // Trust the server's answer over our guess — they only diverge if the
        // same cuentto was toggled elsewhere (another tab, the mobile app).
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (response.saved) next.add(cuenttoId);
          else next.delete(cuenttoId);
          return next;
        });

        if (response.saved) {
          toast.success("Saved");
          // We only hold the join row for cuenttos already in the list, so a
          // newly saved one has to come from the server to render on /saved.
          refresh();
        } else {
          toast.success("Removed from saved");
          setSavedCuenttos((prev) =>
            prev.filter((row) => row.cuenttoId !== cuenttoId),
          );
        }
      } catch (err) {
        console.error(err);
        if (!mountedRef.current) return;
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(cuenttoId);
          else next.delete(cuenttoId);
          return next;
        });
        // The optimistic removal dropped a row we no longer hold, and
        // restoring a snapshot could clobber an unrelated toggle that landed
        // meanwhile — re-syncing from the server is the safe undo.
        if (wasSaved) refresh();
        const message = axios.isAxiosError(err)
          ? ((err.response?.data as { message?: string } | undefined)?.message ??
            SAVE_ERROR)
          : SAVE_ERROR;
        toast.error(message);
      } finally {
        if (!mountedRef.current) return;
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(cuenttoId);
          return next;
        });
      }
    },
    [pendingIds, savedIds, refresh],
  );

  return (
    <SavedCuenttosContext.Provider
      value={{
        savedCuenttos,
        loading,
        error,
        isSaved,
        isPending,
        toggleSave,
        refresh,
      }}
    >
      {children}
    </SavedCuenttosContext.Provider>
  );
}

export function useSavedCuenttos(): SavedCuenttosContextValue {
  const ctx = useContext(SavedCuenttosContext);
  if (!ctx) {
    // Same fallback shape MobileNavContext uses, so a card rendered outside
    // the app shell (e.g. a future standalone page) still mounts safely.
    return {
      savedCuenttos: [],
      loading: false,
      error: null,
      isSaved: () => false,
      isPending: () => false,
      toggleSave: noop,
      refresh: noop,
    };
  }
  return ctx;
}
