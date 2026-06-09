import type { ReactNode } from "react";
import "katex/dist/katex.min.css";

type ShareLayoutProps = {
  children: ReactNode;
};

export default function ShareLayout({ children }: ShareLayoutProps) {
  return children;
}
