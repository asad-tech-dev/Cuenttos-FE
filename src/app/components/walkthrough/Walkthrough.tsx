"use client";

import {
  Component,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, PenLine, Sparkles, X } from "lucide-react";
import { useMobileNav } from "../context/MobileNavContext";
import {
  PopoverPosition,
  Rect,
  WALKTHROUGH_START_EVENT,
  WALKTHROUGH_STEPS,
  canAutoStartOn,
  computePopoverPosition,
  isRectVisible,
  isWalkthroughDue,
  markWalkthroughDone,
  nextAvailableStep,
  readTokenUser,
} from "@/lib/walkthrough";

// Interactive first-run tour: dims the page, spotlights one nav item at a time
// and explains it in a small card. Starts on its own once after sign-up (see
// lib/walkthrough.ts for when), or on demand from the sidebar's "Take the
// tour". Mounted by AppShell for signed-in users only, so signing out ends it.

const STEPS = WALKTHROUGH_STEPS;
const LAST = STEPS.length - 1;
// Below Tailwind's `lg`, the sidebar is a drawer behind the hamburger.
const DRAWER_BREAKPOINT = 1024;
// Give the landing page a moment to settle before the tour appears.
const AUTO_START_DELAY_MS = 900;
const DIALOG_RETRY_MS = 1000;
const DIALOG_RETRY_LIMIT = 60;
// How long a step waits for its target to come on screen (e.g. the drawer
// sliding in) before it's skipped.
const TARGET_WAIT_MS = 700;
const SPOTLIGHT_PADDING = 6;

const findTarget = (target: string) =>
  document.querySelector<HTMLElement>(`[data-tour="${target}"]`);

const viewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const measure = (el: HTMLElement): Rect => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

// A Radix dialog or sheet is open (they mark themselves data-state="open").
const isDialogOpen = () =>
  Boolean(
    document.querySelector(
      '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
    ),
  );

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function WalkthroughTour() {
  const pathname = usePathname();
  const router = useRouter();
  const { open: openNav, close: closeNav } = useMobileNav();

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState(STEPS.length);
  // Movement is only animated once the card has been placed, so it appears
  // in place instead of gliding in from the corner of the screen.
  const [settled, setSettled] = useState(false);

  const directionRef = useRef<1 | -1>(1);
  const userIdRef = useRef<number | null>(null);
  const startPathRef = useRef<string | null>(null);
  const openedNavRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const step = STEPS[index];

  const start = useCallback(() => {
    const user = readTokenUser(localStorage.getItem("authToken"));
    userIdRef.current = user?.userId ?? null;
    setName(user?.name ?? null);
    // Steps whose target isn't rendered at all are left out of the count.
    setStepCount(
      STEPS.filter((s) => !s.target || findTarget(s.target)).length,
    );
    startPathRef.current = pathnameRef.current;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    directionRef.current = 1;
    setRect(null);
    setPosition(null);
    setSettled(false);
    setIndex(0);
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active || !position || settled) return;
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, [active, position, settled]);

  // Closes the tour; `done` records it as finished/skipped for this account.
  const end = useCallback(
    (done: boolean) => {
      if (done) markWalkthroughDone(userIdRef.current);
      if (openedNavRef.current) {
        closeNav();
        openedNavRef.current = false;
      }
      setActive(false);
      setRect(null);
      setPosition(null);
      const back = returnFocusRef.current;
      returnFocusRef.current = null;
      if (back?.isConnected) back.focus({ preventScroll: true });
    },
    [closeNav],
  );

  // Auto-start once after sign-up, on a main page, when no dialog is open.
  useEffect(() => {
    if (active || !canAutoStartOn(pathname)) return;
    const user = readTokenUser(localStorage.getItem("authToken"));
    if (!isWalkthroughDue(user)) return;

    let tries = 0;
    let timer = window.setTimeout(function attempt() {
      if (!isDialogOpen()) {
        start();
        return;
      }
      if (++tries < DIALOG_RETRY_LIMIT) {
        timer = window.setTimeout(attempt, DIALOG_RETRY_MS);
      }
    }, AUTO_START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname, active, start]);

  // "Take the tour" from the sidebar.
  useEffect(() => {
    const onStart = () => start();
    window.addEventListener(WALKTHROUGH_START_EVENT, onStart);
    return () => window.removeEventListener(WALKTHROUGH_START_EVENT, onStart);
  }, [start]);

  // Navigating away mid-tour (back button, a redirect) closes it. An unfinished
  // automatic tour stays pending and starts again on the next main page.
  useEffect(() => {
    if (active && startPathRef.current && pathname !== startPathRef.current) {
      end(false);
    }
  }, [pathname, active, end]);

  // Measure the new step's target before the browser paints, so the spotlight
  // and card head straight for it instead of first moving relative to the
  // previous step and then jumping a frame later.
  useLayoutEffect(() => {
    if (!active) return;
    if (!step.target) {
      setRect(null);
      return;
    }
    const node = findTarget(step.target);
    const r = node ? measure(node) : null;
    if (r && isRectVisible(r, viewport())) {
      setRect((prev) => (sameRect(prev, r) ? prev : r));
    }
  }, [active, index, step.target]);

  // Find the step's target, opening the mobile drawer if it lives there, and
  // skip the step if it never shows up.
  useEffect(() => {
    if (!active) return;
    const target = step.target;
    const isMobile = window.innerWidth < DRAWER_BREAKPOINT;

    if (!target) {
      if (openedNavRef.current) {
        closeNav();
        openedNavRef.current = false;
      }
      return;
    }

    if (isMobile && target.startsWith("nav-")) {
      openNav();
      openedNavRef.current = true;
    }
    const el = findTarget(target);
    el?.scrollIntoView?.({
      block: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });

    // Track every frame for a short while: the drawer slides in with a
    // transform, which no resize/scroll event reports.
    const startedAt = performance.now();
    let frame = 0;
    let seen = false;
    const tick = () => {
      const node = findTarget(target);
      const r = node ? measure(node) : null;
      if (r && isRectVisible(r, viewport())) {
        seen = true;
        setRect((prev) => (sameRect(prev, r) ? prev : r));
      }
      if (performance.now() - startedAt < TARGET_WAIT_MS) {
        frame = requestAnimationFrame(tick);
      } else if (!seen) {
        const dir = directionRef.current;
        const next = nextAvailableStep(
          STEPS,
          index,
          dir,
          (t) => findTarget(t) !== null,
        );
        setIndex(next ?? (dir === 1 ? LAST : 0));
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, index, step.target, openNav, closeNav]);

  // Keep the spotlight on its target through resizes, scrolling and layout
  // shifts, measured at most once per frame.
  useEffect(() => {
    if (!active || !step.target) return;
    const target = step.target;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = findTarget(target);
        const r = node ? measure(node) : null;
        const next = r && isRectVisible(r, viewport()) ? r : null;
        setRect((prev) => (sameRect(prev, next) ? prev : next));
      });
    };
    const node = findTarget(target);
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (node) observer?.observe(node);
    if (observer && document.body) observer.observe(document.body);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [active, step.target]);

  // Place the card once its size is known, and again whenever it changes.
  useLayoutEffect(() => {
    if (!active) return;
    const card = popoverRef.current;
    if (!card) return;
    const place = () => {
      const spot = rect && step.target ? padRect(rect) : null;
      setPosition(
        computePopoverPosition(
          spot,
          { width: card.offsetWidth, height: card.offsetHeight },
          viewport(),
        ),
      );
    };
    place();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
    observer?.observe(card);
    window.addEventListener("resize", place);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [active, rect, index, step.target]);

  // Focus the card on every step so keyboard and screen-reader users follow.
  useEffect(() => {
    if (active) popoverRef.current?.focus({ preventScroll: true });
  }, [active, index]);

  const go = useCallback(
    (dir: 1 | -1) => {
      directionRef.current = dir;
      const next = nextAvailableStep(
        STEPS,
        index,
        dir,
        (t) => findTarget(t) !== null,
      );
      if (next === null) {
        if (dir === 1) end(true);
        return;
      }
      setIndex(next);
    },
    [index, end],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      end(true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) go(-1);
    } else if (e.key === "Enter" && e.target === e.currentTarget) {
      e.preventDefault();
      go(1);
    } else if (e.key === "Tab") {
      // Keep focus inside the card while the page behind it is inert.
      const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === e.currentTarget)
      ) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!active || typeof document === "undefined") return null;

  const spot = rect && step.target ? padRect(rect) : null;
  // One spotlight element for the whole tour: centred steps shrink it to a
  // point in the middle of the screen (its shadow still dims everything), so
  // moving between centred and highlighted steps morphs instead of flashing.
  const hole: Rect = spot ?? {
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
    width: 0,
    height: 0,
  };
  const isFirst = index === 0;
  const isLast = index === LAST;
  // Position among the steps actually shown, for "2 of 7" and the dots.
  const shownSteps = STEPS.map((s, i) => ({ s, i })).filter(
    ({ s }) => !s.target || findTarget(s.target),
  );
  const shownIndex = Math.max(
    0,
    shownSteps.findIndex(({ i }) => i === index),
  );
  const total = Math.max(stepCount, shownSteps.length);
  const title =
    isFirst && name ? `Welcome to Cuentto, ${name}` : step.title;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] animate-in fade-in duration-300 motion-reduce:animate-none"
      data-walkthrough=""
    >
      {/* Blocks clicks on the page behind the tour. */}
      <div className="absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-[28px] ring-2 will-change-[top,left,width,height] motion-reduce:transition-none ${
          settled ? MOVE_TRANSITION_CLASS : ""
        } ${spot ? "ring-violet" : "ring-transparent"}`}
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
          boxShadow: "0 0 0 9999px rgba(27, 13, 41, 0.6)",
        }}
      />

      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="walkthrough-title"
        aria-describedby="walkthrough-body"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={`absolute w-[min(340px,calc(100vw-24px))] rounded-[16px] bg-white p-5 shadow-[0_18px_50px_-12px_rgba(37,16,58,0.45)] outline-none will-change-[top,left] motion-reduce:transition-none ${
          settled ? MOVE_TRANSITION_CLASS : ""
        }`}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          opacity: position ? 1 : 0,
        }}
      >
        {position?.arrow != null && position.placement !== "center" && (
          <span
            aria-hidden="true"
            className="absolute h-3 w-3 rotate-45 bg-white"
            style={arrowStyle(position)}
          />
        )}

        <div
          key={step.id}
          className="relative flex flex-col gap-3 animate-in fade-in duration-300 motion-reduce:animate-none"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-light-violet">
                <Sparkles size={14} className="text-violet" />
              </span>
              <span className="text-[12px] font-medium text-gray">
                {isFirst || isLast
                  ? "Quick tour"
                  : `Step ${shownIndex} of ${Math.max(1, total - 2)}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => end(true)}
              aria-label="Skip tour"
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray transition-colors hover:bg-gray-6 hover:text-subtle-black cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2
              id="walkthrough-title"
              className="text-[18px] font-semibold leading-[24px] text-subtle-black break-words"
            >
              {title}
            </h2>
            <p
              id="walkthrough-body"
              className="text-[14px] leading-[22px] text-gray"
            >
              {step.body}
            </p>
          </div>

          {/* Progress gets its own row so the buttons always have the full
              width and never wrap their labels. */}
          <div className="mt-1 flex items-center gap-1.5" aria-hidden="true">
            {shownSteps.map(({ i }) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                  i === index
                    ? "w-5 bg-violet"
                    : i < index
                      ? "w-1.5 bg-violet-2"
                      : "w-1.5 bg-light-violet"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={isFirst || isLast ? () => end(true) : () => go(-1)}
              className={secondaryButtonClass}
            >
              {!isFirst && !isLast && (
                <ArrowLeft size={15} className={BUTTON_ICON_CLASS} />
              )}
              {isFirst ? "Skip" : isLast ? "Maybe later" : "Back"}
            </button>
            <button
              type="button"
              onClick={
                isLast
                  ? () => {
                      end(true);
                      router.push("/write");
                    }
                  : () => go(1)
              }
              className={primaryButtonClass}
            >
              {isLast ? (
                <>
                  <PenLine size={15} className={BUTTON_ICON_CLASS} />
                  Start writing
                </>
              ) : (
                <>
                  {isFirst ? "Show me around" : "Next"}
                  <ArrowRight
                    size={15}
                    className={`${BUTTON_ICON_CLASS} transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none`}
                  />
                </>
              )}
            </button>
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          {`${title}. ${step.body}`}
        </span>
      </div>
    </div>,
    document.body,
  );
}

// Spotlight and card glide between steps on the same curve, so they arrive
// together. Opacity is included for the card's first appearance.
const MOVE_TRANSITION_CLASS =
  "transition-[top,left,width,height,opacity] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

// On the narrowest phones the labels need the room more than the icons do.
const BUTTON_ICON_CLASS = "shrink-0 max-[359px]:hidden";

const buttonBaseClass =
  "inline-flex h-[44px] min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[100px] px-4 max-[359px]:px-3 text-[14px] cursor-pointer transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2";

const secondaryButtonClass = `${buttonBaseClass} flex-1 border border-light-violet bg-white font-medium text-violet hover:border-violet-2 hover:bg-light-violet/50 active:scale-[0.98]`;

const primaryButtonClass = `${buttonBaseClass} group flex-[1.4] bg-gradient-to-r from-violet to-violet-3 font-semibold text-white shadow-[0_10px_24px_-10px_rgba(93,77,190,0.9)] hover:-translate-y-px hover:shadow-[0_14px_28px_-10px_rgba(93,77,190,1)] hover:brightness-105 active:translate-y-0 active:scale-[0.98]`;

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height);

const padRect = (r: Rect): Rect => ({
  top: r.top - SPOTLIGHT_PADDING,
  left: r.left - SPOTLIGHT_PADDING,
  width: r.width + SPOTLIGHT_PADDING * 2,
  height: r.height + SPOTLIGHT_PADDING * 2,
});

// The little diamond on the card's edge that points at the target.
const arrowStyle = ({ placement, arrow }: PopoverPosition) => {
  const offset = (arrow ?? 0) - 6;
  switch (placement) {
    case "right":
      return { left: -6, top: offset };
    case "left":
      return { right: -6, top: offset };
    case "bottom":
      return { top: -6, left: offset };
    default:
      return { bottom: -6, left: offset };
  }
};

/** A tour failure must never take the page down with it. */
class WalkthroughBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Walkthrough failed", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Walkthrough() {
  return (
    <WalkthroughBoundary>
      <WalkthroughTour />
    </WalkthroughBoundary>
  );
}
