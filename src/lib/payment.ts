/**
 * Payment lifecycle as an explicit state machine. Transitions not listed in the table are
 * rejected; events that would move a payment to the state it is already in are treated as
 * duplicates and ignored, which is how duplicate webhooks become harmless.
 */

export type PaymentState =
  | "INITIATED"
  | "SUBMITTED"
  | "PENDING"
  | "UNKNOWN"
  | "SUCCEEDED"
  | "FAILED"
  | "SETTLED"
  | "RECONCILED";

export type PaymentEvent =
  | { type: "SUBMIT" }
  | { type: "PROVIDER_ACCEPTED" }
  | { type: "PROVIDER_REJECTED"; reason: string }
  | { type: "PROVIDER_TIMEOUT" }
  | { type: "PROVIDER_UNAVAILABLE" }
  | { type: "STATUS_QUERY"; result: "SUCCEEDED" | "FAILED" | "PENDING" }
  | { type: "WEBHOOK"; result: "SUCCEEDED" | "FAILED"; providerRef: string }
  | { type: "SETTLE" }
  | { type: "RECONCILE"; matched: boolean };

export type Payment = {
  id: string;
  state: PaymentState;
  provider: "primary" | "fallback";
  attempts: number;
  seenWebhooks: string[];
  history: { state: PaymentState; event: PaymentEvent["type"] }[];
};

export type ApplyOutcome =
  | { kind: "transition"; from: PaymentState; to: PaymentState }
  | { kind: "duplicate"; reason: string }
  | { kind: "retry"; attempt: number }
  | { kind: "failover" }
  | { kind: "rejected"; reason: string };

export const terminalStates: PaymentState[] = ["FAILED", "RECONCILED"];

export const MAX_ATTEMPTS = 3;

/** The legal transitions. Anything else is a bug in the caller, not a state to patch. */
export const transitions: Record<PaymentState, PaymentState[]> = {
  INITIATED: ["SUBMITTED"],
  SUBMITTED: ["PENDING", "FAILED", "UNKNOWN"],
  PENDING: ["SUCCEEDED", "FAILED"],
  UNKNOWN: ["PENDING", "SUCCEEDED", "FAILED"],
  SUCCEEDED: ["SETTLED"],
  FAILED: [],
  SETTLED: ["RECONCILED"],
  RECONCILED: [],
};

export function createPayment(id: string): Payment {
  return {
    id,
    state: "INITIATED",
    provider: "primary",
    attempts: 0,
    seenWebhooks: [],
    history: [],
  };
}

function target(payment: Payment, event: PaymentEvent): PaymentState | null {
  switch (event.type) {
    case "SUBMIT":
      return "SUBMITTED";
    case "PROVIDER_ACCEPTED":
      return "PENDING";
    case "PROVIDER_REJECTED":
      return "FAILED";
    case "PROVIDER_TIMEOUT":
      // A timeout is an unknown outcome, never a failure.
      return "UNKNOWN";
    case "STATUS_QUERY":
      return event.result;
    case "WEBHOOK":
      return event.result;
    case "SETTLE":
      return "SETTLED";
    case "RECONCILE":
      return event.matched ? "RECONCILED" : null;
    case "PROVIDER_UNAVAILABLE":
      return payment.state;
  }
}

export function apply(
  payment: Payment,
  event: PaymentEvent,
): { payment: Payment; outcome: ApplyOutcome } {
  if (event.type === "WEBHOOK") {
    if (payment.seenWebhooks.includes(event.providerRef)) {
      return {
        payment,
        outcome: { kind: "duplicate", reason: `webhook ${event.providerRef} already processed` },
      };
    }
    payment = { ...payment, seenWebhooks: [...payment.seenWebhooks, event.providerRef] };
  }

  if (event.type === "PROVIDER_UNAVAILABLE") {
    // Fail over only before the provider has accepted the payment; afterwards it could pay twice.
    if (payment.state !== "SUBMITTED") {
      return {
        payment,
        outcome: { kind: "rejected", reason: "failover is only safe before acceptance" },
      };
    }
    if (payment.attempts < MAX_ATTEMPTS) {
      const attempts = payment.attempts + 1;
      return { payment: { ...payment, attempts }, outcome: { kind: "retry", attempt: attempts } };
    }
    if (payment.provider === "primary") {
      return {
        payment: { ...payment, provider: "fallback", attempts: 0 },
        outcome: { kind: "failover" },
      };
    }
    return transitionTo(payment, "FAILED", event);
  }

  if (event.type === "RECONCILE" && !event.matched) {
    return {
      payment,
      outcome: { kind: "rejected", reason: "reconciliation break — raised for investigation" },
    };
  }

  const to = target(payment, event);
  if (to === null) return { payment, outcome: { kind: "rejected", reason: "no target state" } };
  if (to === payment.state) {
    return { payment, outcome: { kind: "duplicate", reason: `already ${to}` } };
  }
  return transitionTo(payment, to, event);
}

function transitionTo(
  payment: Payment,
  to: PaymentState,
  event: PaymentEvent,
): { payment: Payment; outcome: ApplyOutcome } {
  if (!transitions[payment.state].includes(to)) {
    return {
      payment,
      outcome: { kind: "rejected", reason: `${payment.state} → ${to} is not a legal transition` },
    };
  }
  return {
    payment: {
      ...payment,
      state: to,
      history: [...payment.history, { state: to, event: event.type }],
    },
    outcome: { kind: "transition", from: payment.state, to },
  };
}

export type Scenario = { id: string; label: string; description: string; events: PaymentEvent[] };

export const scenarios: Scenario[] = [
  {
    id: "happy",
    label: "Happy path",
    description: "Provider accepts, webhook confirms, settlement posts, reconciliation matches.",
    events: [
      { type: "SUBMIT" },
      { type: "PROVIDER_ACCEPTED" },
      { type: "WEBHOOK", result: "SUCCEEDED", providerRef: "prv_7Q2" },
      { type: "SETTLE" },
      { type: "RECONCILE", matched: true },
    ],
  },
  {
    id: "timeout",
    label: "Timeout → unknown",
    description:
      "The provider times out. The payment is UNKNOWN — not failed — until a status query resolves it.",
    events: [
      { type: "SUBMIT" },
      { type: "PROVIDER_TIMEOUT" },
      { type: "STATUS_QUERY", result: "PENDING" },
      { type: "WEBHOOK", result: "SUCCEEDED", providerRef: "prv_3KD" },
      { type: "SETTLE" },
      { type: "RECONCILE", matched: true },
    ],
  },
  {
    id: "duplicate",
    label: "Duplicate webhooks",
    description:
      "The provider delivers the same webhook three times. Only the first changes state.",
    events: [
      { type: "SUBMIT" },
      { type: "PROVIDER_ACCEPTED" },
      { type: "WEBHOOK", result: "SUCCEEDED", providerRef: "prv_9XA" },
      { type: "WEBHOOK", result: "SUCCEEDED", providerRef: "prv_9XA" },
      { type: "WEBHOOK", result: "SUCCEEDED", providerRef: "prv_9XA" },
      { type: "SETTLE" },
      { type: "RECONCILE", matched: true },
    ],
  },
  {
    id: "failover",
    label: "Provider down → failover",
    description:
      "The primary provider is unavailable before acceptance. Bounded retries, then failover.",
    events: [
      { type: "SUBMIT" },
      { type: "PROVIDER_UNAVAILABLE" },
      { type: "PROVIDER_UNAVAILABLE" },
      { type: "PROVIDER_UNAVAILABLE" },
      { type: "PROVIDER_UNAVAILABLE" },
      { type: "PROVIDER_ACCEPTED" },
      { type: "WEBHOOK", result: "SUCCEEDED", providerRef: "fbk_1M8" },
      { type: "SETTLE" },
      { type: "RECONCILE", matched: true },
    ],
  },
  {
    id: "break",
    label: "Reconciliation break",
    description:
      "Internal records say settled; the provider statement disagrees. A break is raised, not hidden.",
    events: [
      { type: "SUBMIT" },
      { type: "PROVIDER_ACCEPTED" },
      { type: "WEBHOOK", result: "SUCCEEDED", providerRef: "prv_5TT" },
      { type: "SETTLE" },
      { type: "RECONCILE", matched: false },
    ],
  },
];

export function describeEvent(event: PaymentEvent): string {
  switch (event.type) {
    case "SUBMIT":
      return "submit to provider";
    case "PROVIDER_ACCEPTED":
      return "provider accepted";
    case "PROVIDER_REJECTED":
      return `provider rejected: ${event.reason}`;
    case "PROVIDER_TIMEOUT":
      return "provider call timed out";
    case "PROVIDER_UNAVAILABLE":
      return "provider unavailable (503)";
    case "STATUS_QUERY":
      return `status query → ${event.result}`;
    case "WEBHOOK":
      return `webhook ${event.providerRef} → ${event.result}`;
    case "SETTLE":
      return "settlement posted to ledger";
    case "RECONCILE":
      return event.matched ? "matched provider statement" : "statement mismatch";
  }
}
