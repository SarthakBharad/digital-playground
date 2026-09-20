"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `true` only after hydration — use it to gate theme-dependent UI.
 * Implemented with `useSyncExternalStore` so it costs no effect + setState pass.
 */
export function useMounted() {
  return useSyncExternalStore(noopSubscribe, getClientSnapshot, getServerSnapshot);
}
