import type { ReactNode } from "react";
import "katex/dist/katex.min.css";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return children;
}
