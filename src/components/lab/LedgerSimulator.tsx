"use client";

import { useId, useState } from "react";
import {
  balanceOf,
  createLedger,
  errorMessages,
  formatNaira,
  postEntry,
  reverse,
  transfer,
  trialBalance,
  type Account,
  type LedgerState,
} from "@/lib/ledger";
import { cn } from "@/lib/cn";
import { LabFrame } from "./LabFrame";

const accounts: Account[] = [
  { id: "settlement", name: "Settlement (bank)", type: "asset", allowNegative: true },
  { id: "acct-a", name: "Account A", type: "liability" },
  { id: "acct-b", name: "Account B", type: "liability" },
  { id: "fees", name: "Fee income", type: "revenue" },
];

const customerAccounts = accounts.filter((a) => a.type === "liability");

function initialLedger(): LedgerState {
  let state = createLedger(accounts);
  for (const [id, amount] of [
    ["acct-a", 50_000_00],
    ["acct-b", 12_000_00],
  ] as const) {
    const r = postEntry(state, {
      description: `Deposit to ${id === "acct-a" ? "Account A" : "Account B"}`,
      idempotencyKey: `seed-${id}`,
      lines: [
        { accountId: "settlement", side: "debit", amount },
        { accountId: id, side: "credit", amount },
      ],
    });
    if (r.ok) state = r.state;
  }
  return state;
}

type Notice = { tone: "ok" | "warn" | "err"; text: string } | null;

let keyCounter = 0;
const newKey = () => `idem_${Date.now().toString(36)}${(keyCounter++).toString(36)}`;

export function LedgerSimulator() {
  const formId = useId();
  const [ledger, setLedger] = useState(initialLedger);
  const [from, setFrom] = useState("acct-a");
  const [to, setTo] = useState("acct-b");
  const [amount, setAmount] = useState("10000");
  const [withFee, setWithFee] = useState(false);
  const [lastRequest, setLastRequest] = useState<Parameters<typeof transfer>[1] | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const tb = trialBalance(ledger);

  function submit(request: Parameters<typeof transfer>[1]) {
    const result = transfer(ledger, request);
    if (!result.ok) {
      setNotice({ tone: "err", text: `Rejected — ${errorMessages[result.error]}` });
      return;
    }
    setLedger(result.state);
    setLastRequest(request);
    setNotice(
      result.replayed
        ? {
            tone: "warn",
            text: `Replayed ${request.idempotencyKey}: returned ${result.entry.id}, no new postings.`,
          }
        : {
            tone: "ok",
            text: `Posted ${result.entry.id} with ${result.entry.lines.length} balanced lines.`,
          },
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const naira = Number(amount);
    submit({
      from,
      to,
      amount: Math.round(naira * 100),
      fee: withFee ? 50_00 : 0,
      feeAccount: "fees",
      idempotencyKey: newKey(),
    });
  }

  function onReverse(id: string) {
    const result = reverse(ledger, id, `rev_${id}`);
    if (!result.ok) {
      setNotice({ tone: "err", text: `Rejected — ${errorMessages[result.error]}` });
      return;
    }
    setLedger(result.state);
    setNotice({
      tone: "ok",
      text: `Posted ${result.entry.id}: compensating entry for ${id}. History unchanged.`,
    });
  }

  const entries = [...ledger.entries].reverse();

  return (
    <LabFrame
      title="Ledger simulator"
      subtitle="Double-entry · idempotent · append-only"
      onReset={() => {
        setLedger(initialLedger());
        setLastRequest(null);
        setNotice(null);
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-5">
          <form onSubmit={onSubmit} className="space-y-3" aria-describedby={`${formId}-hint`}>
            <div className="grid grid-cols-2 gap-2">
              <Field label="From" htmlFor={`${formId}-from`}>
                <select
                  id={`${formId}-from`}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className={inputClass}
                >
                  {customerAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="To" htmlFor={`${formId}-to`}>
                <select
                  id={`${formId}-to`}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={inputClass}
                >
                  {customerAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Amount (₦)" htmlFor={`${formId}-amount`}>
              <input
                id={`${formId}-amount`}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                className={cn(inputClass, "tabular")}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-fg-2">
              <input
                type="checkbox"
                checked={withFee}
                onChange={(e) => setWithFee(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              Charge ₦50 fee (three-line entry)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-accent-ink"
              >
                Post transfer
              </button>
              <button
                type="button"
                disabled={!lastRequest}
                onClick={() => lastRequest && submit(lastRequest)}
                className="h-9 rounded-md border border-line-2 px-3 text-sm text-fg disabled:opacity-40"
              >
                Retry last request
              </button>
            </div>
            <p id={`${formId}-hint`} className="text-xs leading-relaxed text-fg-3">
              “Retry” resends the same idempotency key — as a client would after a timeout.
            </p>
          </form>

          <p
            role="status"
            className={cn(
              "min-h-[2.5rem] rounded-md border px-3 py-2 font-mono text-[0.72rem] leading-relaxed",
              !notice && "border-line text-fg-3",
              notice?.tone === "ok" && "border-ok/30 text-ok",
              notice?.tone === "warn" && "border-warn/30 text-warn",
              notice?.tone === "err" && "border-err/30 text-err",
            )}
          >
            {notice?.text ?? "Awaiting a request."}
          </p>

          <div>
            <p className="mb-2 eyebrow">Balances</p>
            <table className="w-full text-sm">
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <th scope="row" className="py-1.5 text-left font-normal text-fg-2">
                      {a.name}
                      <span className="ml-1.5 font-mono text-[0.62rem] text-fg-3">{a.type}</span>
                    </th>
                    <td className="py-1.5 text-right font-mono text-fg tabular">
                      {formatNaira(balanceOf(ledger, a.id))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={cn("mt-3 font-mono text-[0.7rem]", tb.balanced ? "text-ok" : "text-err")}>
              Trial balance: Dr {formatNaira(tb.debits)} = Cr {formatNaira(tb.credits)}{" "}
              {tb.balanced ? "✓" : "✗"}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <p className="mb-2 eyebrow">Journal · newest first</p>
          <ol className="max-h-[26rem] space-y-2 overflow-y-auto pr-1" aria-label="Journal entries">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-line bg-bg-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-fg">
                    <span className="font-mono text-accent">{entry.id}</span>
                    <span className="ml-2 text-fg-2">{entry.description}</span>
                  </p>
                  {entry.reversedBy ? (
                    <span className="font-mono text-[0.65rem] text-fg-3">
                      reversed by {entry.reversedBy}
                    </span>
                  ) : entry.reverses || entry.idempotencyKey.startsWith("seed") ? null : (
                    <button
                      type="button"
                      onClick={() => onReverse(entry.id)}
                      className="rounded border border-line px-2 py-0.5 font-mono text-[0.65rem] text-fg-3 hover:border-line-2 hover:text-fg"
                    >
                      Reverse
                    </button>
                  )}
                </div>
                <table className="mt-2 w-full font-mono text-[0.72rem]">
                  <thead className="sr-only">
                    <tr>
                      <th>Account</th>
                      <th>Debit</th>
                      <th>Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.lines.map((line, i) => (
                      <tr key={i}>
                        <td className={cn("py-0.5 text-fg-2", line.side === "credit" && "pl-4")}>
                          {ledger.accounts[line.accountId]?.name}
                        </td>
                        <td className="py-0.5 text-right text-fg tabular">
                          {line.side === "debit" ? formatNaira(line.amount) : ""}
                        </td>
                        <td className="py-0.5 pl-3 text-right text-fg tabular">
                          {line.side === "credit" ? formatNaira(line.amount) : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-1.5 truncate font-mono text-[0.62rem] text-fg-3">
                  key {entry.idempotencyKey}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </LabFrame>
  );
}

const inputClass =
  "h-9 w-full rounded-md border border-line-2 bg-bg-2 px-2.5 text-sm text-fg outline-none focus-visible:border-accent";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block font-mono text-[0.68rem] text-fg-3">
        {label}
      </label>
      {children}
    </div>
  );
}
