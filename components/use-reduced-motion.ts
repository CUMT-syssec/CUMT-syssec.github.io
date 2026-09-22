"use client";

import { useSyncExternalStore } from "react";
import { subscribeMediaQuery } from "@/lib/motion-support";

const QUERY = "(prefers-reduced-motion: reduce)";

function getQuery(): MediaQueryList | null {
  try {
    return typeof window.matchMedia === "function" ? window.matchMedia(QUERY) : null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  const query = getQuery();
  return query ? subscribeMediaQuery(query, onChange) : () => {};
}

function getSnapshot() {
  return getQuery()?.matches ?? true;
}

/** Static on the server; subscribe to live preferences, including legacy MQL. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
