import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EngineeringMap } from "./home/EngineeringMap";
import { LedgerSimulator } from "./lab/LedgerSimulator";
import { PaymentSimulator } from "./lab/PaymentSimulator";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("LedgerSimulator", () => {
  it("posts a transfer as balanced debit and credit lines", async () => {
    const user = userEvent.setup();
    render(<LedgerSimulator />);
    await user.click(screen.getByRole("button", { name: "Post transfer" }));

    expect(screen.getByRole("status")).toHaveTextContent(/Posted tx_00003 with 2 balanced lines/);
    const journal = screen.getByRole("list", { name: "Journal entries" });
    const newest = within(journal).getAllByRole("listitem")[0]!;
    expect(newest).toHaveTextContent("Transfer Account A → Account B");
    expect(newest).toHaveTextContent("₦10,000.00");
    expect(screen.getByText(/Trial balance/)).toHaveTextContent("✓");
  });

  it("replays a retried request without posting again", async () => {
    const user = userEvent.setup();
    render(<LedgerSimulator />);
    await user.click(screen.getByRole("button", { name: "Post transfer" }));
    await user.click(screen.getByRole("button", { name: "Retry last request" }));

    expect(screen.getByRole("status")).toHaveTextContent(/Replayed .* no new postings/);
    expect(
      within(screen.getByRole("list", { name: "Journal entries" })).getAllByRole("listitem"),
    ).toHaveLength(3);
  });

  it("rejects a transfer that would overdraw the account", async () => {
    const user = userEvent.setup();
    render(<LedgerSimulator />);
    const amount = screen.getByLabelText("Amount (₦)");
    await user.clear(amount);
    await user.type(amount, "999999");
    await user.click(screen.getByRole("button", { name: "Post transfer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Insufficient available balance");
  });
});

describe("PaymentSimulator", () => {
  it("steps a timeout into UNKNOWN rather than FAILED", async () => {
    const user = userEvent.setup();
    render(<PaymentSimulator />);
    await user.click(screen.getByRole("button", { name: "Timeout → unknown" }));
    await user.click(screen.getByRole("button", { name: "Step" }));
    await user.click(screen.getByRole("button", { name: "Step" }));
    const states = screen.getByRole("list", { name: "Payment states" }).parentElement!;
    expect(within(states).getByText("UNKNOWN")).toHaveAttribute("aria-current", "step");
  });
});

describe("EngineeringMap", () => {
  it("reveals a node's technologies and case studies when selected", async () => {
    const user = userEvent.setup();
    render(
      <EngineeringMap projects={[{ slug: "blockchain", title: "Blockchain Staking Protocol" }]} />,
    );
    const node = screen.getByRole("button", { name: "Blockchain" });
    await user.click(node);

    expect(node).toHaveAttribute("aria-pressed", "true");
    const panel = document.getElementById("map-panel")!;
    expect(within(panel).getByRole("heading", { name: "Blockchain" })).toBeInTheDocument();
    expect(panel).toHaveTextContent("Solidity");
    expect(
      within(panel).getByRole("link", { name: /Blockchain Staking Protocol/ }),
    ).toHaveAttribute("href", "/projects/blockchain");
  });

  it("supports arrow-key navigation between nodes", async () => {
    const user = userEvent.setup();
    render(<EngineeringMap projects={[]} />);
    screen.getByRole("button", { name: "Distributed systems" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "AI / ML" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "AI / ML" })).toHaveAttribute("aria-pressed", "true");
  });
});
