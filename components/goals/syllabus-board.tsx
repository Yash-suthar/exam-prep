"use client";

import { TopicStatus } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  addSyllabusTopic,
  importSyllabusTemplate,
  removeSyllabusTopic,
  setTopicStatus,
} from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOPIC_LABEL } from "@/lib/goal-plan";
import { cn } from "@/lib/utils";

type Topic = {
  id: string;
  subject: string;
  name: string;
  status: TopicStatus;
  lastRevisedAt: string | null;
};

const ORDER: TopicStatus[] = ["NOT_STARTED", "LEARNING", "REVISING", "MASTERED"];

const CHIP: Record<TopicStatus, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  LEARNING: "bg-amber-500 text-white",
  REVISING: "bg-sky-600 text-white",
  MASTERED: "bg-emerald-600 text-white",
};

export function SyllabusBoard({
  goalId,
  examTag,
  topics,
}: {
  goalId: string;
  examTag: string | null;
  topics: Topic[];
}) {
  const [items, setItems] = useState(topics);
  const [filter, setFilter] = useState<TopicStatus | "ALL">("ALL");
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const subjects = useMemo(() => {
    const map = new Map<string, Topic[]>();
    for (const topic of items) {
      if (filter !== "ALL" && topic.status !== filter) continue;
      map.set(topic.subject, [...(map.get(topic.subject) ?? []), topic]);
    }
    return [...map.entries()];
  }, [filter, items]);

  const knownSubjects = useMemo(
    () => [...new Set(items.map((topic) => topic.subject))],
    [items],
  );

  async function cycle(topic: Topic) {
    const next = ORDER[(ORDER.indexOf(topic.status) + 1) % ORDER.length];
    setItems((prev) =>
      prev.map((item) => (item.id === topic.id ? { ...item, status: next } : item)),
    );
    const result = await setTopicStatus(topic.id, next);
    if (!result.ok) {
      setItems((prev) =>
        prev.map((item) => (item.id === topic.id ? { ...item, status: topic.status } : item)),
      );
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["ALL", ...ORDER] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "min-h-9 rounded-full px-3.5 text-xs font-semibold",
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {value === "ALL"
              ? `All ${items.length}`
              : `${TOPIC_LABEL[value]} ${items.filter((t) => t.status === value).length}`}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="font-semibold">No syllabus yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Load the standard {examTag ? examTag.toUpperCase() : "exam"} syllabus, then edit it.
          </p>
          <Button
            type="button"
            className="mt-4"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const result = await importSyllabusTemplate(goalId, examTag ?? "ssc");
              setBusy(false);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              toast.success(`${result.added} topics added.`);
              window.location.reload();
            }}
          >
            Load standard syllabus
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {subjects.map(([subjectName, list]) => {
            const done = list.filter((topic) => topic.status === "MASTERED").length;
            return (
              <section key={subjectName}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold">{subjectName}</h3>
                  <span className="text-xs text-muted-foreground">
                    {done}/{list.length} mastered
                  </span>
                </div>
                <div className="grid gap-2">
                  {list.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{topic.name}</p>
                        {topic.lastRevisedAt ? (
                          <p className="text-[11px] text-muted-foreground">
                            Last touched{" "}
                            {new Date(topic.lastRevisedAt).toLocaleDateString("en-IN")}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => cycle(topic)}
                          className={cn(
                            "min-h-8 rounded-full px-3 text-[11px] font-bold uppercase tracking-wide",
                            CHIP[topic.status],
                          )}
                        >
                          {TOPIC_LABEL[topic.status]}
                        </button>
                        <button
                          type="button"
                          className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                          onClick={async () => {
                            const previous = items;
                            setItems((prev) => prev.filter((item) => item.id !== topic.id));
                            const result = await removeSyllabusTopic(topic.id);
                            if (!result.ok) {
                              setItems(previous);
                              toast.error(result.error);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Add your own topic</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            list="goal-subjects"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject"
          />
          <datalist id="goal-subjects">
            {knownSubjects.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Topic"
          />
          <Button
            type="button"
            disabled={busy || !name.trim()}
            onClick={async () => {
              setBusy(true);
              const result = await addSyllabusTopic({
                goalId,
                subject: subject || "General",
                name,
              });
              setBusy(false);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              toast.success("Topic added.");
              setName("");
              window.location.reload();
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
