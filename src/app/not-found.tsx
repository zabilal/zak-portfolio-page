import { ButtonLink, Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <p className="font-mono text-sm text-err">404 · ROUTE_NOT_FOUND</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        No handler for this path.
      </h1>
      <p className="mt-4 max-w-lg leading-relaxed text-fg-2">
        The request was well-formed; nothing is listening here. It has not been retried.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/" variant="primary">
          Home
        </ButtonLink>
        <ButtonLink href="/projects">Case studies</ButtonLink>
      </div>
    </Container>
  );
}
