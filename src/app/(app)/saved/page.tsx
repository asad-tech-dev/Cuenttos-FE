"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import checkAuth from "@/HOC/checkAuth";
import CuenttoFeedCard from "@/app/components/ui/cuenttos/cuenttoFeedCard";
import { SkeletonCuenttoFeed } from "@/app/components/skeletons/CuenttoFeed";
import { FavouriteIcon } from "@/app/components/icons";
import { useSavedCuenttos } from "@/app/components/context/SavedCuenttosContext";

// The endpoint returns every saved row at once, so — like the mobile list —
// we mount them in batches as the user scrolls instead of rendering a few
// hundred cards up front.
const BATCH_SIZE = 10;

function SavedCuenttoPage() {
  const { savedCuenttos, loading, error, refresh } = useSavedCuenttos();
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [refreshing, setRefreshing] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visible = useMemo(
    () => savedCuenttos.slice(0, visibleCount),
    [savedCuenttos, visibleCount],
  );
  const hasMore = visibleCount < savedCuenttos.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!hasMore || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => count + BATCH_SIZE);
        }
      },
      // Start the next batch slightly before the sentinel is on screen so
      // scrolling never visibly stalls at the end of a batch.
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setVisibleCount(BATCH_SIZE);
    await refresh();
    setRefreshing(false);
  }, [refresh, refreshing]);

  // Only blank the list out on the very first load — a manual refresh keeps
  // the current cards on screen and just spins the button.
  const showSkeleton = loading && savedCuenttos.length === 0;
  const showEmpty = !loading && !error && savedCuenttos.length === 0;

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 md:px-[60px] lg:px-[90px] py-2 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-4 sm:gap-y-3">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-[26px] sm:text-[30px] font-semibold text-subtle-black">
            Saved Cuenttos
          </h1>
          <p className="text-[14px] sm:text-[15px] leading-[22px] text-gray max-w-[560px]">
            Cuenttos you bookmarked to come back to.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {savedCuenttos.length > 0 && (
            <span className="inline-flex items-center h-[32px] px-3 rounded-full bg-light-violet text-dark-violet text-[12px] font-semibold whitespace-nowrap">
              {savedCuenttos.length} saved
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh saved Cuenttos"
            className="inline-flex items-center gap-2 h-[32px] px-4 rounded-full border border-light-gray text-[12px] font-semibold text-subtle-black transition-colors duration-200 hover:bg-gray-6 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[16px] border border-red/40 bg-red/5 px-5 py-4">
          <p className="text-[14px] text-dark-red">{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="shrink-0 inline-flex items-center justify-center h-[38px] px-5 rounded-[100px] bg-violet text-white text-[14px] font-semibold cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {showSkeleton ? (
        <SkeletonCuenttoFeed />
      ) : showEmpty ? (
        <div className="flex flex-col items-center justify-center text-center rounded-[20px] border border-dashed border-light-gray bg-gray-5 px-6 py-16 sm:py-20">
          <div className="flex items-center justify-center w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full bg-light-violet">
            <FavouriteIcon width={28} height={28} className="text-violet" />
          </div>
          <h2 className="mt-6 text-[20px] sm:text-[22px] font-semibold text-dark-violet">
            Nothing saved yet
          </h2>
          <p className="mt-2 max-w-[420px] text-[14px] sm:text-[15px] leading-[22px] text-gray">
            When you find a Cuentto worth returning to, tap its bookmark and it
            will show up here.
          </p>
          <Link
            href="/share"
            className="mt-6 inline-flex items-center justify-center h-[44px] px-6 rounded-[100px] bg-violet text-white text-[14px] font-semibold cursor-pointer whitespace-nowrap"
          >
            Explore Cuenttos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-[20px]">
          {visible.map((row) => (
            <CuenttoFeedCard
              key={row.id}
              cuentto={row.cuentto}
              onDeleted={() => refresh()}
            />
          ))}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center py-4 text-[13px] font-medium text-gray"
            >
              Loading more…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default checkAuth(SavedCuenttoPage);
