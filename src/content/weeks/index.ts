import type { Week } from "@/lib/types";
import { week00 } from "./week-00";

/**
 * Every week the site knows about. `pnpm new-week <n> "<question>"` scaffolds
 * the file + data folder and adds it here for you.
 *
 * Order doesn't matter — the site sorts by `number`.
 */
export const weeks: Week[] = [week00];
