"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  Pencil,
  Plus,
  Timer,
  TimerOff,
  Trash2,
  Zap,
} from "lucide-react";
import {
  createChallenge,
  deleteChallenge,
  describeThinkApiError,
  fetchChallenges,
  toggleChallengeActive,
  updateChallenge,
} from "@/lib/api/think";
import { Challenge, ChallengeInput } from "@/types/think";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import FormField from "@/app/components/ui/FormField";
import Toggle from "@/app/components/ui/Toggle";

// Mirrors the API's bounds so the form rejects before the request does.
const MIN_MINUTES = 1;
const MAX_MINUTES = 60;

// <input type="datetime-local"> speaks local wall-clock time with no zone;
// these convert to and from the ISO instants the API stores.
const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const fromLocalInput = (value: string) =>
  value ? new Date(value).toISOString() : null;

interface FormState {
  id: number | null;
  title: string;
  description: string;
  /** false = no time limit (the composer shows no countdown). */
  timed: boolean;
  minutes: string;
  /** Whether the optional Show from / Show until fields are in the form. */
  hasStart: boolean;
  startsAt: string;
  hasEnd: boolean;
  endsAt: string;
  isActive: boolean;
}

// A new challenge starts with a 5-minute timer (as before) and shows the
// optional Show from / Show until fields (left empty = no bound); each can be
// removed or added back in the form.
const emptyForm: FormState = {
  id: null,
  title: "",
  description: "",
  timed: true,
  minutes: "5",
  hasStart: true,
  startsAt: "",
  hasEnd: true,
  endsAt: "",
  isActive: true,
};

const formatDuration = (durationSeconds: number | null) =>
  durationSeconds == null
    ? "No time limit"
    : `${Math.round(durationSeconds / 60)} min write`;

const describeWindow = (challenge: Challenge) => {
  const start = challenge.startsAt
    ? new Date(challenge.startsAt).toLocaleString()
    : null;
  const end = challenge.endsAt
    ? new Date(challenge.endsAt).toLocaleString()
    : null;
  if (!start && !end) return "Always, while active";
  if (start && !end) return `From ${start}`;
  if (!start && end) return `Until ${end}`;
  return `${start} → ${end}`;
};

/**
 * Why an active challenge isn't on Think right now, if it isn't: its window
 * hasn't opened yet, or has already closed.
 */
const offThinkReason = (challenge: Challenge, now = Date.now()) => {
  if (!challenge.isActive) return null;
  if (challenge.startsAt && new Date(challenge.startsAt).getTime() > now) {
    return `Scheduled · shows from ${new Date(challenge.startsAt).toLocaleString()}`;
  }
  if (challenge.endsAt && new Date(challenge.endsAt).getTime() <= now) {
    return "Window ended · not shown on Think";
  }
  return null;
};

/**
 * An optional form field with the same trash button the challenge cards use,
 * so a setting that isn't needed (time limit, display dates) can be removed
 * instead of having to be emptied.
 */
function RemovableField({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        title={`Remove ${label}`}
        className="absolute -top-1.5 right-0 flex h-[28px] w-[28px] items-center justify-center rounded-full text-gray-7 transition-colors duration-200 hover:bg-red/10 hover:text-red focus:outline-none focus-visible:ring-2 focus-visible:ring-red/30 cursor-pointer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/** Small button that adds a removed optional field back to the form. */
function AddFieldButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-violet/50 px-3 py-1.5 text-[12px] font-semibold text-violet transition-colors duration-200 hover:border-violet hover:bg-light-violet/50 cursor-pointer"
    >
      <Plus size={13} />
      {label}
    </button>
  );
}

export default function ChallengeManager() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [liveId, setLiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Challenge | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    // `loading` only gates the first paint (see showSkeleton below), so a
    // refresh triggered by a mutation never swaps the list out for skeletons.
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChallenges();
      setChallenges(data.challenges);
      setLiveId(data.liveChallengeId);
    } catch (err) {
      console.error(err);
      setError(describeThinkApiError(err, "Couldn't load challenges."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => setForm({ ...emptyForm });
  const startEdit = (challenge: Challenge) =>
    setForm({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      timed: challenge.durationSeconds != null,
      minutes:
        challenge.durationSeconds != null
          ? String(Math.round(challenge.durationSeconds / 60))
          : emptyForm.minutes,
      hasStart: Boolean(challenge.startsAt),
      startsAt: toLocalInput(challenge.startsAt),
      hasEnd: Boolean(challenge.endsAt),
      endsAt: toLocalInput(challenge.endsAt),
      isActive: challenge.isActive,
    });

  const handleSave = async () => {
    if (!form || saving) return;
    const minutes = Number(form.minutes);

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are both required.");
      return;
    }
    if (
      form.timed &&
      (!Number.isFinite(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES)
    ) {
      toast.error(
        `Writing time must be between ${MIN_MINUTES} and ${MAX_MINUTES} minutes, or remove it for no time limit.`,
      );
      return;
    }
    const startsAt = form.hasStart ? form.startsAt : "";
    const endsAt = form.hasEnd ? form.endsAt : "";
    if (startsAt && endsAt && endsAt <= startsAt) {
      toast.error("The end of the window must be after its start.");
      return;
    }

    const payload: ChallengeInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      // null = no time limit; removed date fields are saved as "no bound".
      durationSeconds: form.timed ? Math.round(minutes * 60) : null,
      startsAt: fromLocalInput(startsAt),
      endsAt: fromLocalInput(endsAt),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (form.id === null) {
        await createChallenge(payload);
        toast.success("Challenge created and set as the active challenge");
      } else {
        await updateChallenge(form.id, payload);
        toast.success("Challenge updated");
      }
      setForm(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error(describeThinkApiError(err, "Couldn't save that challenge."));
    } finally {
      setSaving(false);
    }
  };

  /**
   * Optimistic, and deliberately does NOT re-fetch the list.
   *
   * The switch moves on click; the request only confirms it. Re-fetching used
   * to put the whole section back into its loading state, so every toggle
   * flashed the list away and back and the panel jumped as the skeleton
   * heights differed from the cards. The response carries the recomputed
   * `liveChallengeId`, which was the only thing the re-fetch was needed for.
   */
  const handleToggle = async (challenge: Challenge, next: boolean) => {
    if (togglingId !== null) return;

    const previousChallenges = challenges;
    const previousLiveId = liveId;

    // Only one challenge can be active: turning one on switches the rest off
    // (the backend does the same in one transaction).
    const applyToggle = (list: Challenge[], updated: Challenge) =>
      list.map((item) =>
        item.id === updated.id
          ? updated
          : next
            ? { ...item, isActive: false }
            : item,
      );

    setTogglingId(challenge.id);
    setChallenges((list) => applyToggle(list, { ...challenge, isActive: next }));

    try {
      const result = await toggleChallengeActive(challenge.id, next);
      setChallenges((list) => applyToggle(list, result.challenge));
      setLiveId(result.liveChallengeId);
    } catch (err) {
      console.error(err);
      setChallenges(previousChallenges);
      setLiveId(previousLiveId);
      toast.error(describeThinkApiError(err, "Couldn't update that challenge."));
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteChallenge(pendingDelete.id);
      toast.success("Challenge deleted");
      setPendingDelete(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error(describeThinkApiError(err, "Couldn't delete that challenge."));
    } finally {
      setDeleting(false);
    }
  };

  // Skeletons belong to the first paint only. A refresh after a mutation
  // keeps the existing cards on screen, which is what stops the flicker.
  if (loading && challenges.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-[56px] w-full animate-pulse rounded-[16px] bg-gray-6" />
        <div className="h-[132px] w-full animate-pulse rounded-[16px] bg-gray-6" />
        <div className="h-[132px] w-full animate-pulse rounded-[16px] bg-gray-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[16px] border border-red/40 bg-red/5 p-6">
        <p className="text-[14px] leading-[22px] text-dark-red">{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex h-[44px] items-center justify-center rounded-[10px] bg-violet px-5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-violet-3 cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[560px] text-[13px] leading-[20px] text-gray">
          Only one challenge can be active at a time, and that is the one shown
          on Think while it&apos;s inside its dates. Creating a challenge or
          turning one on switches the others off.
        </p>
        {!form && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-violet px-5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-violet-3 cursor-pointer sm:w-fit"
          >
            <Plus size={18} />
            New challenge
          </button>
        )}
      </div>

      {form && (
        <section className="flex flex-col gap-5 rounded-[16px] border border-violet/30 bg-white p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Zap size={18} className="shrink-0 text-violet" />
            <h3 className="min-w-0 text-[16px] font-semibold text-subtle-black break-words">
              {form.id === null ? "New challenge" : "Edit challenge"}
            </h3>
          </div>

          <FormField
            label="Title"
            id="challenge-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="5-min sprint"
          />

          <FormField
            as="textarea"
            label="Description"
            id="challenge-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Write without stopping. Don't edit. Just flow."
          />

          {(form.timed || form.hasStart || form.hasEnd) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {form.timed && (
                <RemovableField
                  label="time limit"
                  onRemove={() => setForm({ ...form, timed: false })}
                >
                  <FormField
                    label="Writing time"
                    id="challenge-minutes"
                    type="number"
                    min={MIN_MINUTES}
                    max={MAX_MINUTES}
                    value={form.minutes}
                    onChange={(e) => setForm({ ...form, minutes: e.target.value })}
                    hint={`Countdown the writer sees (${MIN_MINUTES}–${MAX_MINUTES} min).`}
                  />
                </RemovableField>
              )}
              {form.hasStart && (
                <RemovableField
                  label="start date"
                  onRemove={() =>
                    setForm({ ...form, hasStart: false, startsAt: "" })
                  }
                >
                  <FormField
                    label="Show from"
                    id="challenge-starts-at"
                    optional
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    hint="Empty = as soon as it's active."
                  />
                </RemovableField>
              )}
              {form.hasEnd && (
                <RemovableField
                  label="end date"
                  onRemove={() => setForm({ ...form, hasEnd: false, endsAt: "" })}
                >
                  <FormField
                    label="Show until"
                    id="challenge-ends-at"
                    optional
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    hint="Empty = until you deactivate it."
                  />
                </RemovableField>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {!form.timed && (
              <p className="flex items-center gap-2 text-[13px] text-gray">
                <TimerOff size={14} className="shrink-0 text-violet" />
                No time limit: writers see the instructions but no countdown.
              </p>
            )}
            {(!form.timed || !form.hasStart || !form.hasEnd) && (
              <div className="flex flex-wrap items-center gap-2">
                {!form.timed && (
                  <AddFieldButton
                    label="Time limit"
                    onClick={() => setForm({ ...form, timed: true })}
                  />
                )}
                {!form.hasStart && (
                  <AddFieldButton
                    label="Show from"
                    onClick={() => setForm({ ...form, hasStart: true })}
                  />
                )}
                {!form.hasEnd && (
                  <AddFieldButton
                    label="Show until"
                    onClick={() => setForm({ ...form, hasEnd: true })}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-light-gray pt-5 sm:flex-row sm:items-center sm:justify-between">
            {form.id === null ? (
              // A new challenge always becomes the active one.
              <p className="flex items-center gap-2 text-[13px] text-gray">
                <Zap size={14} className="shrink-0 text-violet" />
                Saving makes this the active challenge and switches the others
                off.
              </p>
            ) : (
              <label className="flex items-center gap-2.5">
                <Toggle
                  checked={form.isActive}
                  onChange={(next) => setForm({ ...form, isActive: next })}
                  size="sm"
                  ariaLabel="Active"
                />
                <span className="text-[13px] font-medium text-subtle-black">
                  Active
                  {form.isActive &&
                    !challenges.find((c) => c.id === form.id)?.isActive && (
                      <span className="ml-1.5 font-normal text-gray">
                        (switches the others off)
                      </span>
                    )}
                </span>
              </label>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="inline-flex h-[44px] flex-1 items-center justify-center rounded-[10px] border border-light-gray px-5 text-[14px] font-semibold text-subtle-black transition-colors duration-200 hover:bg-gray-6 cursor-pointer sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-[44px] flex-1 items-center justify-center rounded-[10px] bg-violet px-6 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-violet-3 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer sm:flex-none"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </section>
      )}

      {challenges.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-light-gray bg-gray-5 px-6 py-12 text-center">
          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-gray-6">
            <Zap size={20} className="text-gray-7" />
          </div>
          <p className="mt-1 text-[14px] font-medium text-subtle-black">
            No challenges yet
          </p>
          <p className="max-w-[380px] text-[13px] leading-[20px] text-gray">
            Think will keep showing its built-in 5-minute sprint until you
            create one.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {challenges.map((challenge) => {
            const isLive = challenge.id === liveId;
            const notShownReason = isLive ? null : offThinkReason(challenge);
            return (
              <li
                key={challenge.id}
                className={`flex flex-col gap-4 rounded-[16px] border bg-white p-5 transition-all duration-300 sm:p-6 ${
                  isLive
                    ? "border-violet/40 shadow-[0_10px_30px_rgba(93,77,190,0.08)]"
                    : "border-light-gray hover:border-violet/40"
                }`}
              >
                <div className="flex flex-col gap-3 min-[300px]:flex-row min-[300px]:items-start min-[300px]:gap-4">
                  <div
                    className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] ${
                      isLive
                        ? "bg-violet text-white"
                        : "bg-light-violet text-violet"
                    }`}
                  >
                    <Zap size={20} />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[16px] font-semibold text-subtle-black break-words">
                        {challenge.title}
                      </h3>
                      {isLive && (
                        <span className="shrink-0 rounded-full bg-violet px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                          On Think now
                        </span>
                      )}
                      {notShownReason && (
                        <span className="shrink-0 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                          {notShownReason}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] leading-[20px] text-gray break-words">
                      {challenge.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`hidden text-[11px] font-semibold uppercase tracking-[0.06em] sm:inline ${
                        challenge.isActive ? "text-violet" : "text-gray-7"
                      }`}
                    >
                      {challenge.isActive ? "Active" : "Inactive"}
                    </span>
                    <Toggle
                      checked={challenge.isActive}
                      loading={togglingId === challenge.id}
                      onChange={(next) => handleToggle(challenge, next)}
                      size="sm"
                      ariaLabel={`${challenge.isActive ? "Deactivate" : "Activate"} ${challenge.title}`}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-light-gray pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-6 px-3 py-1 text-[11px] font-semibold text-dark-gray tabular-nums">
                      {challenge.durationSeconds == null ? (
                        <TimerOff size={12} />
                      ) : (
                        <Timer size={12} />
                      )}
                      {formatDuration(challenge.durationSeconds)}
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-gray-7">
                      <CalendarClock size={12} className="shrink-0" />
                      <span className="break-words">
                        {describeWindow(challenge)}
                      </span>
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(challenge)}
                      aria-label={`Edit ${challenge.title}`}
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-subtle-black transition-colors duration-200 hover:bg-light-gray/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/30 cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(challenge)}
                      aria-label={`Delete ${challenge.title}`}
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-gray-7 transition-colors duration-200 hover:bg-red/10 hover:text-red focus:outline-none focus-visible:ring-2 focus-visible:ring-red/30 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
        title="Delete challenge?"
        description={
          pendingDelete ? (
            <>
              This will permanently delete{" "}
              <span className="font-semibold text-subtle-black">
                “{pendingDelete.title}”
              </span>
              . This action cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
