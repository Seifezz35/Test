import { PropsWithChildren } from "react";

export const PageShell = ({ children }: PropsWithChildren) => (
  <section className="animate-page-in px-4 pb-28 pt-5">{children}</section>
);
