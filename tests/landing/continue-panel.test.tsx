import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContinuePanel } from "@/components/landing/continue-panel";
import { getMessages } from "@/lib/i18n/messages";
import {
  createShareRecentActivityItem,
  writeRecentActivity
} from "@/lib/workspace/recent-activity";

const recentMessages = getMessages("en").workspace.recent;

describe("landing continue panel", () => {
  it("does not render when local recent activity is empty", () => {
    render(<ContinuePanel messages={recentMessages} />);

    expect(screen.queryByRole("region", { name: /continue/i })).not.toBeInTheDocument();
  });

  it("renders the latest three recent items", async () => {
    writeRecentActivity(
      [
        createShareRecentActivityItem({ shareId: "one", title: "One", href: "/share/one", now: 100 }),
        createShareRecentActivityItem({ shareId: "two", title: "Two", href: "/share/two", now: 200 }),
        createShareRecentActivityItem({ shareId: "three", title: "Three", href: "/share/three", now: 300 }),
        createShareRecentActivityItem({ shareId: "four", title: "Four", href: "/share/four", now: 400 })
      ],
      window.localStorage
    );

    render(<ContinuePanel messages={recentMessages} />);

    expect(await screen.findByRole("region", { name: /continue/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /four/i })).toHaveAttribute("href", "/share/four");
    expect(screen.getByRole("link", { name: /three/i })).toHaveAttribute("href", "/share/three");
    expect(screen.getByRole("link", { name: /two/i })).toHaveAttribute("href", "/share/two");
    expect(screen.queryByRole("link", { name: /one/i })).not.toBeInTheDocument();
  });

  it("removes an item from the continue panel", async () => {
    const user = userEvent.setup();

    writeRecentActivity(
      [
        createShareRecentActivityItem({ shareId: "one", title: "One", href: "/share/one", now: 100 }),
        createShareRecentActivityItem({ shareId: "two", title: "Two", href: "/share/two", now: 200 })
      ],
      window.localStorage
    );

    render(<ContinuePanel messages={recentMessages} />);

    expect(await screen.findByRole("link", { name: /two/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remove two/i }));

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /two/i })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /one/i })).toBeInTheDocument();
  });
});
