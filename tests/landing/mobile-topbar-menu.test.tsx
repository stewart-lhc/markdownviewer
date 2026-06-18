import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MobileTopbarMenu } from "@/components/landing/mobile-topbar-menu";

const messages = {
  changelog: "Updates",
  github: "GitHub repository",
  pricing: "Pricing",
  primary: "Primary navigation",
  workspace: "Workspace"
};

describe("MobileTopbarMenu", () => {
  it("toggles the mobile breadcrumbs panel", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MobileTopbarMenu
        currentPath="/"
        githubIcon={<span aria-hidden="true" />}
        githubRepositoryUrl="https://github.com/stewart-lhc/markdownviewer"
        locale="en"
        messages={messages}
      />
    );

    const wrapper = container.querySelector(".topbar-breadcrumbs");
    const trigger = screen.getByRole("button", { name: /open navigation breadcrumbs/i });

    expect(wrapper).toHaveAttribute("data-open", "false");

    await user.click(trigger);

    expect(wrapper).toHaveAttribute("data-open", "true");
    expect(screen.getByRole("button", { name: /close navigation breadcrumbs/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /updates/i })).toHaveAttribute("href", "/changelog");
    expect(screen.getByRole("link", { name: /pricing/i })).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: /github repository/i })).toHaveTextContent("GitHub");

    const panel = container.querySelector("#topbar-breadcrumbs-panel");
    const primaryLinks = Array.from(container.querySelectorAll(".topbar-breadcrumbs__links .ghost-link")).map((link) =>
      link.textContent?.trim()
    );

    expect(primaryLinks).toEqual(["Pricing", "Updates", "GitHub"]);
    expect(panel).not.toBeNull();
    expect(within(panel as HTMLElement).getByRole("link", { name: "中" })).toBeInTheDocument();
    expect((panel as HTMLElement).querySelector(".topbar-breadcrumbs__settings-row")).not.toBeNull();

    await user.keyboard("{Escape}");

    expect(wrapper).toHaveAttribute("data-open", "false");
  });
});
