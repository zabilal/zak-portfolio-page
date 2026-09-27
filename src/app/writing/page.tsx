import type { Metadata } from "next";
import { NotesList } from "@/components/sections/sections";
import { Container, SectionHeader } from "@/components/ui/primitives";
import { plannedNotes, writtenNotes } from "@/content/notes";

export const metadata: Metadata = {
  title: "Engineering notes",
  description:
    "Engineering notes on double-entry ledgers, idempotency in payment systems, database isolation levels, Kafka for financial transactions and more.",
  alternates: { canonical: "/writing" },
};

export default function WritingPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeader
        as="h1"
        eyebrow="Writing"
        title="Engineering notes"
        lead="Short, specific notes on the details that decide whether a system is correct. Written for engineers who will build the thing."
      />
      <section aria-labelledby="written" className="mt-14">
        <h2 id="written" className="mb-4 eyebrow">
          Notes
        </h2>
        <NotesList notes={writtenNotes} />
      </section>
      <section aria-labelledby="planned" className="mt-16">
        <h2 id="planned" className="mb-4 eyebrow">
          In the queue
        </h2>
        <NotesList notes={plannedNotes} />
      </section>
    </Container>
  );
}
