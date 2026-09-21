"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CalendarPlus, Lightbulb, Shuffle, X } from "lucide-react";
import {
  clearDailyPrompt,
  describeThinkApiError,
  fetchDailyPromptSchedule,
  fetchSelectableGroups,
  setDailyPrompt,
} from "@/lib/api/think";
import { DailyPrompt, SelectableGroup } from "@/types/think";
import { QuestionGroup } from "@/types/questionGroup";
import { firstValidQuestion } from "@/lib/questionPrompt";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import FormField from "@/app/components/ui/FormField";

// What a writer will actually read on Think: the group's first answerable
// question. Titles like "group-1" identify the record, not the prompt, so they
// are only a fallback for the (API-prevented) case of a group with no usable
// question. Mirrors the rule the backend resolver and the picker both apply.
const promptLabel = (group?: QuestionGroup | null): string | null => {
  const text = firstValidQuestion(group?.questions)?.text?.trim();
  return text || group?.title || null;
};

export default function DailyPromptScheduler() {
  const [schedule, setSchedule] = useState<DailyPrompt[]>([]);
  const [today, setToday] = useState("");
  const [selectableGroups, setSelectableGroups] = useState<SelectableGroup[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState<string | null>(null);
  const [pendingClear, setPendingClear] = useState<DailyPrompt | null>(null);

  const [date, setDate] = useState("");
  const [groupId, setGroupId] = useState<number | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The endpoint already applies the "has an answerable question" rule
      // the API enforces on save, so the picker can't offer a bad option.
      const [scheduleData, groupData] = await Promise.all([
        fetchDailyPromptSchedule(),
        fetchSelectableGroups(),
      ]);
      setSchedule(scheduleData.dailyPrompts);
      setToday(scheduleData.today);
      setSelectableGroups(groupData);
      // Default the form to the server's today, never the browser's.
      setDate((current) => current || scheduleData.today);
    } catch (err) {
      console.error(err);
      setError(describeThinkApiError(err, "Couldn't load the prompt schedule."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const scheduledToday = schedule.find((entry) => entry.date === today) ?? null;

  const handleSchedule = async () => {
    if (!date || groupId === "" || saving) return;
    setSaving(true);
    try {
      await setDailyPrompt(date, Number(groupId));
      toast.success(`Prompt scheduled for ${date}`);
      setGroupId("");
      await load();
    } catch (err) {
      console.error(err);
      toast.error(describeThinkApiError(err, "Couldn't schedule that prompt."));
    } finally {
      setSaving(false);
    }
  };

  const confirmClear = async () => {
    if (!pendingClear) return;
    setClearing(pendingClear.date);
    try {
      await clearDailyPrompt(pendingClear.date);
      toast.success("Scheduled prompt cleared");
      setPendingClear(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error(describeThinkApiError(err, "Couldn't clear that day."));
    } finally {
      setClearing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="h-[104px] w-full animate-pulse rounded-[16px] bg-gray-6" />
        <div className="h-[196px] w-full animate-pulse rounded-[16px] bg-gray-6" />
        <div className="h-[120px] w-full animate-pulse rounded-[16px] bg-gray-6" />
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

  const isScheduled = Boolean(scheduledToday);

  return (
    <div className="flex flex-col gap-5">
      {/* Status first: what Think is showing right now, so the admin never
          has to infer it from the list below. */}
      <section
        // Below 300px a 40px icon plus its gap leaves the copy too little
        // room and words start breaking one per line, so the icon moves above
        // the text and the text gets the card's full width.
        className={`flex flex-col gap-3 rounded-[16px] border p-5 min-[300px]:flex-row min-[300px]:items-start min-[300px]:gap-4 sm:p-6 ${
          isScheduled
            ? "border-violet/30 bg-light-violet/40"
            : "border-light-gray bg-gray-5"
        }`}
      >
        <div
          className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] ${
            isScheduled ? "bg-violet text-white" : "bg-gray-6 text-dark-gray"
          }`}
        >
          {isScheduled ? <Lightbulb size={20} /> : <Shuffle size={20} />}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-violet">
            Live on Think today
          </p>
          {isScheduled ? (
            <>
              <h3 className="text-[17px] font-semibold leading-[24px] text-subtle-black break-words sm:text-[18px]">
                {promptLabel(scheduledToday?.questionGroup) ??
                  "Scheduled prompt"}
              </h3>
              <p className="text-[13px] leading-[20px] text-gray break-words">
                Chosen by an admin for {today}.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-[17px] font-semibold leading-[24px] text-subtle-black break-words sm:text-[18px]">
                Automatic daily rotation
              </h3>
              <p className="text-[13px] leading-[20px] text-gray break-words">
                Nothing is scheduled for {today || "today"}. Pick a prompt below
                to override it.
              </p>
            </>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-[16px] border border-light-gray bg-white p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <CalendarPlus size={18} className="shrink-0 text-violet" />
          <h3 className="min-w-0 text-[16px] font-semibold text-subtle-black break-words">
            Schedule a prompt
          </h3>
        </div>

        {/* Stacks on phones; date / prompt / action share one row from sm up. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,190px)_minmax(0,1fr)] sm:items-start lg:grid-cols-[minmax(0,190px)_minmax(0,1fr)_auto]">
          <FormField
            label="Date"
            type="date"
            id="daily-prompt-date"
            value={date}
            min={today || undefined}
            onChange={(event) => setDate(event.target.value)}
          />
          <FormField
            as="select"
            label="Prompt"
            id="daily-prompt-group"
            value={groupId}
            placeholder="Select a prompt…"
            options={selectableGroups.map((group) => ({
              value: group.id,
              label: group.isActive
                ? group.questionText
                : `${group.questionText} (inactive)`,
            }))}
            onChange={(event) =>
              setGroupId(event.target.value ? Number(event.target.value) : "")
            }
            hint="Only prompts with an answerable question can be scheduled."
          />
          <button
            type="button"
            onClick={handleSchedule}
            disabled={!date || groupId === "" || saving}
            className="inline-flex h-[48px] w-full items-center justify-center rounded-[10px] bg-violet px-6 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-violet-3 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer sm:w-fit lg:mt-[29px]"
          >
            {saving ? "Scheduling…" : "Schedule"}
          </button>
        </div>

        {selectableGroups.length === 0 && (
          <p className="rounded-[10px] border border-red/30 bg-red/5 px-4 py-3 text-[13px] leading-[20px] text-dark-red">
            No prompt has an answerable question yet, so none can be scheduled.
            Add a question with text under Manage Questions first.
          </p>
        )}

        <p className="border-t border-light-gray pt-4 text-[12px] leading-[19px] text-gray-7">
          Scheduling a date that already has a prompt replaces it. A prompt
          stays selectable even when inactive — an explicit pick wins over the
          active flag.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <CalendarDays size={16} className="shrink-0 text-dark-gray" />
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark-gray">
            Scheduled
          </h3>
          <span className="rounded-full bg-gray-6 px-2.5 py-1 text-[11px] font-semibold text-dark-gray tabular-nums">
            {schedule.length}
          </span>
          <span className="text-[12px] text-gray-7">next 90 days</span>
        </div>

        {schedule.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-light-gray bg-gray-5 px-6 py-10 text-center">
            <CalendarDays size={22} className="text-gray-7" />
            <p className="text-[14px] font-medium text-subtle-black">
              Nothing scheduled yet
            </p>
            <p className="max-w-[360px] text-[13px] leading-[20px] text-gray">
              Think will keep rotating prompts automatically until you schedule
              one.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {schedule.map((entry) => {
              const isToday = entry.date === today;
              return (
                <li
                  key={entry.id}
                  className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] border bg-white px-4 py-3 transition-colors duration-200 ${
                    isToday
                      ? "border-violet/40 bg-light-violet/20"
                      : "border-light-gray hover:border-violet/40"
                  }`}
                >
                  <span className="shrink-0 rounded-full bg-gray-6 px-3 py-1 text-[12px] font-semibold tabular-nums text-subtle-black">
                    {entry.date}
                  </span>
                  {isToday && (
                    <span className="shrink-0 rounded-full bg-violet px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                      Today
                    </span>
                  )}
                  {/* Below 260px the date chip alone fills the row, so the
                      prompt text takes a line of its own rather than being
                      squeezed into the remainder. */}
                  <span className="w-full min-w-0 text-[14px] font-medium text-subtle-black break-words min-[260px]:w-auto min-[260px]:flex-1">
                    {promptLabel(entry.questionGroup) ??
                      `Prompt #${entry.questionGroupId}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPendingClear(entry)}
                    disabled={clearing === entry.date}
                    aria-label={`Clear prompt scheduled for ${entry.date}`}
                    className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-gray-7 transition-colors duration-200 hover:bg-red/10 hover:text-red focus:outline-none focus-visible:ring-2 focus-visible:ring-red/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={pendingClear !== null}
        onOpenChange={(next) => {
          if (!next) setPendingClear(null);
        }}
        title="Clear this day's prompt?"
        description={
          pendingClear ? (
            <>
              <span className="font-semibold text-subtle-black">
                {pendingClear.date}
              </span>{" "}
              will go back to the automatic daily rotation.
            </>
          ) : null
        }
        confirmLabel="Clear"
        cancelLabel="Cancel"
        variant="danger"
        loading={clearing !== null}
        onConfirm={confirmClear}
      />
    </div>
  );
}
