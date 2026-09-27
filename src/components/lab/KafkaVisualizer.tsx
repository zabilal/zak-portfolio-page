"use client";

import { useEffect, useState } from "react";
import {
  createTopic,
  lag,
  partitionFor,
  poll,
  produce,
  rangeAssign,
  setConsumers,
  type TopicState,
} from "@/lib/kafka";
import { cn } from "@/lib/cn";
import { LabFrame } from "./LabFrame";

const PARTITIONS = 3;
const KEYS = ["acct-1", "acct-2", "acct-3", "acct-4", "acct-5", "acct-6"];
const KEY_HUES = [200, 262, 152, 32, 330, 90];
const consumerNames = (n: number) => Array.from({ length: n }, (_, i) => `c${i + 1}`);

const hue = (key: string) => KEY_HUES[KEYS.indexOf(key)] ?? 0;
const keyStyle = (key: string) => ({
  borderColor: `hsl(${hue(key)} 70% 55% / 0.7)`,
  background: `hsl(${hue(key)} 70% 55% / 0.14)`,
});

type Sim = { topic: TopicState; cursor: number };

const initialSim = (): Sim => ({ topic: createTopic(PARTITIONS, consumerNames(2)), cursor: 0 });

export function KafkaVisualizer() {
  const [{ topic, cursor }, setSim] = useState<Sim>(initialSim);
  const [auto, setAuto] = useState(false);

  const assignment = rangeAssign(PARTITIONS, topic.consumers);
  const lags = lag(topic);
  const setTopic = (fn: (t: TopicState) => TopicState) =>
    setSim((s) => ({ ...s, topic: fn(s.topic) }));

  function produceNext(poison = false) {
    setSim((s) => ({
      topic: produce(s.topic, KEYS[s.cursor % KEYS.length]!, poison),
      cursor: s.cursor + 1,
    }));
  }

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      setSim((s) => ({
        topic: poll(produce(s.topic, KEYS[(s.cursor * 7) % KEYS.length]!)),
        cursor: s.cursor + 1,
      }));
    }, 1100);
    return () => window.clearInterval(id);
  }, [auto]);

  return (
    <LabFrame
      title="Kafka visualiser"
      subtitle="murmur2 partitioning · range assignment · retry → DLQ"
      onReset={() => {
        setAuto(false);
        setSim(initialSim());
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => produceNext()}
          className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-accent-ink"
        >
          Produce {KEYS[cursor % KEYS.length]}
        </button>
        <button
          type="button"
          onClick={() => produceNext(true)}
          className="h-9 rounded-md border border-err/40 px-3 text-sm text-err"
        >
          Produce poison
        </button>
        <button
          type="button"
          onClick={() => setTopic((t) => poll(t))}
          className="h-9 rounded-md border border-line-2 px-3 text-sm text-fg"
        >
          Poll
        </button>
        <button
          type="button"
          aria-pressed={auto}
          onClick={() => setAuto((a) => !a)}
          className={cn(
            "h-9 rounded-md border px-3 text-sm",
            auto ? "border-accent/60 text-accent" : "border-line-2 text-fg",
          )}
        >
          {auto ? "Stop stream" : "Stream"}
        </button>
        <label className="ml-auto flex items-center gap-2 font-mono text-[0.72rem] text-fg-3">
          consumers
          <select
            value={topic.consumers.length}
            onChange={(e) =>
              setTopic((t) => setConsumers(t, consumerNames(Number(e.target.value))))
            }
            className="h-8 rounded-md border border-line-2 bg-bg-2 px-2 text-fg"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 font-mono text-[0.68rem] leading-relaxed text-fg-3">
        {KEYS.map((k) => (
          <span key={k} className="mr-3 inline-flex items-center gap-1 whitespace-nowrap">
            <span
              aria-hidden
              className="inline-block size-2 rounded-sm border"
              style={keyStyle(k)}
            />
            {k} → p{partitionFor(k, PARTITIONS)}
          </span>
        ))}
      </p>

      <div className="mt-4 space-y-2">
        {topic.log.map((messages, p) => {
          const owner = Object.entries(assignment).find(([, ps]) => ps.includes(p))?.[0];
          const visible = messages.slice(-10);
          return (
            <div
              key={p}
              className="grid grid-cols-[4.5rem_1fr] items-center gap-3 sm:grid-cols-[5.5rem_1fr_6.5rem]"
            >
              <div className="font-mono text-[0.7rem]">
                <div className="text-fg">partition {p}</div>
                <div className="text-fg-3">lag {lags[p]}</div>
              </div>
              <ol
                className="flex min-h-9 items-center gap-1 overflow-hidden rounded-md border border-line bg-bg-2 px-1.5 py-1"
                aria-label={`Partition ${p} log`}
              >
                {visible.length === 0 && (
                  <li className="px-1 font-mono text-[0.65rem] text-fg-3">empty</li>
                )}
                {visible.map((m) => {
                  const consumed = m.offset < topic.committed[p]!;
                  return (
                    <li
                      key={m.id}
                      title={`${m.key} · offset ${m.offset}${m.poison ? " · poison" : ""}`}
                      className={cn(
                        "enter flex h-7 w-8 shrink-0 flex-col items-center justify-center rounded border font-mono text-[0.58rem] leading-none",
                        consumed && "opacity-35",
                        m.poison && "border-dashed",
                      )}
                      style={
                        m.poison
                          ? { borderColor: "var(--err)", color: "var(--err)" }
                          : keyStyle(m.key)
                      }
                    >
                      <span className="text-fg">{m.poison ? "✗" : m.key.slice(-1)}</span>
                      <span className="text-fg-3">{m.offset}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="col-start-2 font-mono text-[0.68rem] text-fg-3 sm:col-start-auto">
                {owner ? (
                  <>
                    → <span className="text-accent">{owner}</span>
                  </>
                ) : (
                  "unassigned"
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line p-3">
          <p className="eyebrow">Consumer group · settlement</p>
          <ul className="mt-2 space-y-1 font-mono text-[0.7rem]">
            {Object.entries(assignment).map(([c, ps]) => (
              <li key={c} className="flex justify-between">
                <span className="text-fg">{c}</span>
                <span className="text-fg-3">
                  {ps.length ? ps.map((x) => `p${x}`).join(", ") : "idle"}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-line p-3">
          <p className="eyebrow">Retry topic</p>
          <ul className="mt-2 space-y-1 font-mono text-[0.7rem] text-warn">
            {topic.retry.length === 0 && <li className="text-fg-3">empty</li>}
            {topic.retry.map((m) => (
              <li key={m.id}>
                #{m.id} {m.key} · attempt {m.attempts}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-line p-3">
          <p className="eyebrow">Dead-letter queue</p>
          <ul className="mt-2 space-y-1 font-mono text-[0.7rem] text-err">
            {topic.dlq.length === 0 && <li className="text-fg-3">empty</li>}
            {topic.dlq.map((m) => (
              <li key={m.id}>
                #{m.id} {m.key} · p{m.partition}@{m.offset} · {m.attempts} attempts
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-fg-3">
        Processed {topic.processed.length} messages. Keys always land on the same partition, so each
        account&apos;s events are consumed in order; changing the consumer count rebalances
        partitions without moving keys. A poison message leaves the partition immediately, so the
        events behind it keep flowing.
      </p>
    </LabFrame>
  );
}
