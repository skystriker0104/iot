/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module "react-dom/client" {
  import type { ReactNode } from "react";
  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment | null): Root;
  export function hydrateRoot(container: Element | Document, initialChildren: ReactNode): Root;
}
