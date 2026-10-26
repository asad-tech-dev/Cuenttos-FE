"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Lightbulb,
  Pencil,
  Plus,
  Repeat,
  Shuffle,
  Trash2,
  X,
} from "lucide-react";
import {
  createThinkPrompt,
  deleteThinkPrompt,
  describeThinkApiError,
  fetchThinkPrompts,
  updateThinkPrompt,
} from "@/lib/api/think";
import { ThinkPrompt, ThinkPromptInput } from "@/types/think";
import { THINK_PROMPT_MAX_WORDS, countWords } from "@/lib/thinkPrompt";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import FormField from "@/app/components/ui/FormField";
import Toggle from "@/app/components/ui/Toggle";

interface FormState {
  id: number | null;
  text: string;
  /** YYYY-MM-DD, or "" for the daily rotation. */
  scheduledFor: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  id: null,
  text: "",
  scheduledFor: "",
  isActive: true,
};

export default function ThinkPromptManager() {
  const [prompts, setPrompts] = useState<ThinkPrompt[]>([]);
  const [today, setToday] = useState("");
  const [liveId, setLiveId] = useState<number | null>(null);
  const [maxWords, setMaxWords] = useState(THINK_PROMPT_MAX_WORDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ThinkPrompt | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    // `loading` only gates the first paint (see the skeleton check below), so
    // a refresh after a change never swaps the list out for skeletons.
    setLoading(true);
    setError(null);
    try {
      const data = await fetchThinkPrompts();
      setPrompts(data.thinkPrompts);
      setToday(data.today);
      setLiveId(data.livePromptId);
      if (data.maxWords > 0) setMaxWords(data.maxWords);
    } catch (err) {
      console.error(err);
      setError(describeThinkApiError(err, "Couldn't load Today's Prompts."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const wordCount = form ? countWords(form.text) : 0;
  const overLimit = wordCount > maxWords;

  const handleSave = async () => {
    if (!form || saving) return;
    const text = form.text.trim();
    if (!text) {
      toast.error("Write the prompt first.");
      return;
    }
    if (overLimit) {
      toast.error(`Keep the prompt to ${maxWords} words or fewer.`);
      return;
    }

    const payload: ThinkPromptInput = {
      text,
      scheduledFor: form.scheduledFor || null,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (form.id === null) {
        await createThinkPrompt(payload);
        toast.success(
          payload.scheduledFor
            ? `Prompt scheduled for ${payload.scheduledFor}`
            : "Prompt added to the daily rotation",
        );
      } else {
        await updateThinkPrompt(form.id, payload);
        toast.success("Prompt updated");
      }
      setForm(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error(describeThinkApiError(err, "Couldn't save that prompt."));
    } finally {
      setSaving(false);
    }
  };

  // Optimistic: the switch moves on click, then a quiet refresh picks up
  // which prompt is live today, since switching one off can change it.
  const handleToggle = async (prompt: ThinkPrompt, next: boolean) => {
    if (togglingId !== null) return;
    const previous = prompts;
    setTogglingId(prompt.id);
    setPrompts((list) =>
      list.map((item) =>
        item.id === prompt.id ? { ...item, isActive: next } : item,
      ),
    );
    try {
      await updateThinkPrompt(prompt.id, { isActive: next });
      await load();
    } catch (err) {
      console.error(err);
      setPrompts(previous);
      toast.error(describeThinkApiError(err, "Couldn't update that prompt."));
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteThinkPrompt(pendingDelete.id);
      toast.success("Prompt deleted");
      setPendingDelete(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error(describeThinkApiError(err, "Couldn't delete that prompt."));
    } finally {
      setDeleting(false);
    }
  };

  if (loading && prompts.length === 0 && !error) {
    return (
      <div className="flex flex-col gap-5">
        <div className="h-[104px] w-full animate-pulse rounded-[16px] bg-gray-6" />
        <div className="h-[56px] w-full animate-pulse rounded-[16px] bg-gray-6" />
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

  const livePrompt = prompts.find((prompt) => prompt.id === liveId) ?? null;
  // Dates are YYYY-MM-DD, so string comparison is date order.
  const upcoming = prompts
    .filter((p) => p.scheduledFor && p.scheduledFor >= today)
    .sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!));
  const rotation = prompts.filter((p) => !p.scheduledFor);
  const past = prompts
    .filter((p) => p.scheduledFor && p.scheduledFor < today)
    .sort((a, b) => b.scheduledFor!.localeCompare(a.scheduledFor!));

  const renderPrompt = (prompt: ThinkPrompt) => {
    const isLive = prompt.id === liveId;
    return (
      <li
        key={prompt.id}
        className={`flex flex-col gap-3 rounded-[12px] border bg-white px-4 py-3.5 transition-colors duration-200 ${
          isLive
            ? "border-violet/40 bg-light-violet/20"
            : "border-light-gray hover:border-violet/40"
        }`}
      >
        <p
          className={`text-[14px] font-medium leading-[21px] break-words ${
            prompt.isActive ? "text-subtle-black" : "text-gray-7"
          }`}
        >
          {prompt.text}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {prompt.scheduledFor ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-6 px-3 py-1 text-[11px] font-semibold tabular-nums text-dark-gray">
                <CalendarDays size={12} />
                {prompt.scheduledFor}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-6 px-3 py-1 text-[11px] font-semibold text-dark-gray">
                <Repeat size={12} />
                Rotation
              </span>
            )}
            {isLive && (
              <span className="rounded-full bg-violet px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                On Think today
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`mr-1 hidden text-[11px] font-semibold uppercase tracking-[0.06em] sm:inline ${
                prompt.isActive ? "text-violet" : "text-gray-7"
              }`}
            >
              {prompt.isActive ? "On" : "Off"}
            </span>
            <Toggle
              checked={prompt.isActive}
              loading={togglingId === prompt.id}
              onChange={(next) => handleToggle(prompt, next)}
              size="sm"
              ariaLabel={`Switch ${prompt.isActive ? "off" : "on"}: ${prompt.text}`}
            />
            <button
              type="button"
              onClick={() =>
                setForm({
                  id: prompt.id,
                  text: prompt.text,
                  scheduledFor: prompt.scheduledFor ?? "",
                  isActive: prompt.isActive,
                })
              }
              aria-label={`Edit prompt: ${prompt.text}`}
              className="ml-1 flex h-[28px] w-[28px] items-center justify-center rounded-full text-gray-7 transition-colors duration-200 hover:bg-light-violet hover:text-violet focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/30 cursor-pointer"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(prompt)}
              aria-label={`Delete prompt: ${prompt.text}`}
              className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-gray-7 transition-colors duration-200 hover:bg-red/10 hover:text-red focus:outline-none focus-visible:ring-2 focus-visible:ring-red/30 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </li>
    );
  };

  const renderGroup = (
    title: string,
    note: string,
    items: ThinkPrompt[],
  ) =>
    items.length > 0 && (
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark-gray">
            {title}
          </h3>
          <span className="rounded-full bg-gray-6 px-2.5 py-1 text-[11px] font-semibold text-dark-gray tabular-nums">
            {items.length}
          </span>
          <span className="text-[12px] text-gray-7">{note}</span>
        </div>
        <ul className="flex flex-col gap-2">{items.map(renderPrompt)}</ul>
      </section>
    );

  return (
    <div className="flex flex-col gap-5">
      {/* Status first: what Think is showing right now. */}
      <section
        className={`flex flex-col gap-3 rounded-[16px] border p-5 min-[300px]:flex-row min-[300px]:items-start min-[300px]:gap-4 sm:p-6 ${
          livePrompt
            ? "border-violet/30 bg-light-violet/40"
            : "border-light-gray bg-gray-5"
        }`}
      >
        <div
          className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] ${
            livePrompt ? "bg-violet text-white" : "bg-gray-6 text-dark-gray"
          }`}
        >
          {livePrompt ? <Lightbulb size={20} /> : <Shuffle size={20} />}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-violet">
            Live on Think today
          </p>
          {livePrompt ? (
            <>
              <h3 className="text-[17px] font-semibold leading-[24px] text-subtle-black break-words sm:text-[18px]">
                {livePrompt.text}
              </h3>
              <p className="text-[13px] leading-[20px] text-gray break-words">
                {livePrompt.scheduledFor
                  ? `Scheduled for ${today}.`
                  : "Today's turn in the daily rotation."}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-[17px] font-semibold leading-[24px] text-subtle-black break-words sm:text-[18px]">
                Automatic question pick
              </h3>
              <p className="text-[13px] leading-[20px] text-gray break-words">
                No written prompt is on for {today || "today"}, so Think shows a
                question from Manage Questions. Write a prompt below to replace
                it.
              </p>
            </>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[560px] text-[13px] leading-[20px] text-gray">
          A prompt with a date shows on that day. On every other day, the
          prompts without a date take turns, one per day, in the order they were
          written.
        </p>
        {!form && (
          <button
            type="button"
            onClick={() => setForm({ ...emptyForm })}
            className="inline-flex h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-violet px-5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-violet-3 cursor-pointer sm:w-fit"
          >
            <Plus size={18} />
            New prompt
          </button>
        )}
      </div>

      {form && (
        <section className="flex flex-col gap-5 rounded-[16px] border border-violet/30 bg-white p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Lightbulb size={18} className="shrink-0 text-violet" />
            <h3 className="min-w-0 text-[16px] font-semibold text-subtle-black break-words">
              {form.id === null ? "New prompt" : "Edit prompt"}
            </h3>
          </div>

          <div className="flex flex-col gap-1.5">
            <FormField
              as="textarea"
              label="Prompt"
              id="think-prompt-text"
              rows={3}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Think about a place you miss…"
              error={
                overLimit
                  ? `Keep it to ${maxWords} words or fewer.`
                  : undefined
              }
            />
            <p
              aria-live="polite"
              className={`self-end text-[12px] tabular-nums ${
                overLimit ? "font-semibold text-red" : "text-gray-7"
              }`}
            >
              {wordCount} / {maxWords} words
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:max-w-[280px]">
            <div className="relative">
              <FormField
                label="Show on"
                id="think-prompt-date"
                optional
                type="date"
                min={today || undefined}
                value={form.scheduledFor}
                onChange={(e) =>
                  setForm({ ...form, scheduledFor: e.target.value })
                }
                hint="Leave empty to add it to the daily rotation."
              />
              {form.scheduledFor && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, scheduledFor: "" })}
                  aria-label="Clear date"
                  title="Clear date"
                  className="absolute -top-1.5 right-0 flex h-[28px] w-[28px] items-center justify-center rounded-full text-gray-7 transition-colors duration-200 hover:bg-red/10 hover:text-red focus:outline-none focus-visible:ring-2 focus-visible:ring-red/30 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-light-gray pt-5 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2.5">
              <Toggle
                checked={form.isActive}
                onChange={(next) => setForm({ ...form, isActive: next })}
                size="sm"
                ariaLabel="On"
              />
              <span className="text-[13px] font-medium text-subtle-black">
                {form.isActive ? "On" : "Off"}
                <span className="ml-1.5 font-normal text-gray">
                  {form.isActive
                    ? "(can show on Think)"
                    : "(kept, but never shown)"}
                </span>
              </span>
            </label>
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
                disabled={saving || overLimit || !form.text.trim()}
                className="inline-flex h-[44px] flex-1 items-center justify-center rounded-[10px] bg-violet px-6 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-violet-3 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer sm:flex-none"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </section>
      )}

      {prompts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-light-gray bg-gray-5 px-6 py-10 text-center">
          <Lightbulb size={22} className="text-gray-7" />
          <p className="text-[14px] font-medium text-subtle-black">
            No prompts written yet
          </p>
          <p className="max-w-[380px] text-[13px] leading-[20px] text-gray">
            Think keeps showing an automatic question until you write one.
          </p>
        </div>
      ) : (
        <>
          {renderGroup("Scheduled", "shows on its date", upcoming)}
          {renderGroup("Rotation", "one per day, in order", rotation)}
          {renderGroup("Past", "already had their day", past)}
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
        title="Delete this prompt?"
        description={
          pendingDelete ? (
            <>
              <span className="font-semibold text-subtle-black">
                &quot;{pendingDelete.text}&quot;
              </span>{" "}
              will be removed, and links already shared to it will stop
              working. To just hide it, switch it off instead.
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
