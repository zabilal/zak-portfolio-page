/**
 * A tiny, deterministic model of a Kafka topic for the Lab's visualiser.
 * Partitioning uses the same murmur2 hash as Kafka's default partitioner, so a key maps to the
 * partition it would in a real cluster with the same partition count.
 */

const encoder = new TextEncoder();

/** Port of org.apache.kafka.common.utils.Utils.murmur2. Returns a signed 32-bit int. */
export function murmur2(data: Uint8Array): number {
  const length = data.length;
  const seed = 0x9747b28c;
  const m = 0x5bd1e995;
  const r = 24;
  let h = (seed ^ length) | 0;
  const length4 = Math.floor(length / 4);

  for (let i = 0; i < length4; i++) {
    const i4 = i * 4;
    let k =
      (data[i4]! & 0xff) |
      ((data[i4 + 1]! & 0xff) << 8) |
      ((data[i4 + 2]! & 0xff) << 16) |
      ((data[i4 + 3]! & 0xff) << 24);
    k = Math.imul(k, m);
    k ^= k >>> r;
    k = Math.imul(k, m);
    h = Math.imul(h, m);
    h ^= k;
  }

  const tail = length & ~3;
  switch (length % 4) {
    case 3:
      h ^= (data[tail + 2]! & 0xff) << 16;
    // falls through
    case 2:
      h ^= (data[tail + 1]! & 0xff) << 8;
    // falls through
    case 1:
      h ^= data[tail]! & 0xff;
      h = Math.imul(h, m);
  }

  h ^= h >>> 13;
  h = Math.imul(h, m);
  h ^= h >>> 15;
  return h | 0;
}

export function partitionFor(key: string, partitions: number): number {
  return (murmur2(encoder.encode(key)) & 0x7fffffff) % partitions;
}

/** Kafka's RangeAssignor for a single topic: contiguous ranges, earlier consumers take the remainder. */
export function rangeAssign(partitions: number, consumers: string[]): Record<string, number[]> {
  const sorted = [...consumers].sort();
  const result: Record<string, number[]> = Object.fromEntries(sorted.map((c) => [c, []]));
  if (sorted.length === 0) return result;
  const per = Math.floor(partitions / sorted.length);
  const extra = partitions % sorted.length;
  let next = 0;
  sorted.forEach((consumer, i) => {
    const count = per + (i < extra ? 1 : 0);
    result[consumer] = Array.from({ length: count }, (_, j) => next + j);
    next += count;
  });
  return result;
}

export type Message = {
  id: number;
  key: string;
  partition: number;
  offset: number;
  /** A poison message fails on every attempt. */
  poison: boolean;
  attempts: number;
};

export type TopicState = {
  partitions: number;
  log: Message[][];
  committed: number[];
  consumers: string[];
  retry: Message[];
  dlq: Message[];
  processed: { id: number; key: string; partition: number; consumer: string }[];
  nextId: number;
};

export const MAX_DELIVERY_ATTEMPTS = 3;

export function createTopic(partitions: number, consumers: string[]): TopicState {
  return {
    partitions,
    log: Array.from({ length: partitions }, () => []),
    committed: Array.from({ length: partitions }, () => 0),
    consumers,
    retry: [],
    dlq: [],
    processed: [],
    nextId: 1,
  };
}

export function produce(state: TopicState, key: string, poison = false): TopicState {
  const partition = partitionFor(key, state.partitions);
  const log = state.log.map((p) => [...p]);
  const message: Message = {
    id: state.nextId,
    key,
    partition,
    offset: log[partition]!.length,
    poison,
    attempts: 0,
  };
  log[partition]!.push(message);
  return { ...state, log, nextId: state.nextId + 1 };
}

export function setConsumers(state: TopicState, consumers: string[]): TopicState {
  // Committed offsets survive a rebalance; only ownership changes.
  return { ...state, consumers };
}

/**
 * One poll cycle: every consumer takes the next message from each partition it owns.
 * Failures are moved to the retry topic so the partition keeps flowing; retries that exhaust
 * their attempts land in the DLQ.
 */
export function poll(state: TopicState): TopicState {
  const assignment = rangeAssign(state.partitions, state.consumers);
  const committed = [...state.committed];
  const processed = [...state.processed];
  let retry: Message[] = [];
  const dlq = [...state.dlq];

  for (const [consumer, owned] of Object.entries(assignment)) {
    for (const p of owned) {
      const message = state.log[p]![committed[p]!];
      if (!message) continue;
      if (message.poison) {
        retry.push({ ...message, attempts: 1 });
      } else {
        processed.push({ id: message.id, key: message.key, partition: p, consumer });
      }
      committed[p] = committed[p]! + 1;
    }
  }

  for (const message of state.retry) {
    const attempts = message.attempts + 1;
    if (!message.poison) {
      processed.push({
        id: message.id,
        key: message.key,
        partition: message.partition,
        consumer: "retry-worker",
      });
      continue;
    }
    if (attempts >= MAX_DELIVERY_ATTEMPTS) dlq.push({ ...message, attempts });
    else retry = [...retry, { ...message, attempts }];
  }

  return { ...state, committed, processed, retry, dlq };
}

export function lag(state: TopicState): number[] {
  return state.log.map((p, i) => p.length - state.committed[i]!);
}
