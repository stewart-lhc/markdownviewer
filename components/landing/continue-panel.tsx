"use client";

import { RecentActivityPanel } from "@/components/workspace/recent-activity-panel";
import type { WorkspaceMessages } from "@/lib/i18n/messages";

type ContinuePanelProps = {
  messages: WorkspaceMessages["recent"];
};

export function ContinuePanel({ messages }: ContinuePanelProps) {
  return (
    <RecentActivityPanel
      className="landing-continue-panel"
      messages={messages}
      testId="landing-continue-panel"
    />
  );
}
