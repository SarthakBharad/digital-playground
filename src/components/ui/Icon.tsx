import type { ComponentType, SVGProps } from "react";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  CalendarDays,
  ChartBar,
  ChartLine,
  ChartPie,
  Check,
  ChevronRight,
  Clock,
  Copy,
  CornerDownLeft,
  Database,
  Dices,
  Download,
  FileSpreadsheet,
  FlaskConical,
  Hash,
  LayoutGrid,
  Menu,
  MessageSquareText,
  Moon,
  NotebookPen,
  Radio,
  Search,
  Sigma,
  Sparkles,
  Sun,
  Table2,
  Terminal,
  X as XIcon,
} from "lucide-react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import {
  SiJupyter,
  SiKaggle,
  SiNextdotjs,
  SiNumpy,
  SiPandas,
  SiPlotly,
  SiPnpm,
  SiPython,
  SiScikitlearn,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

type AnyIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

/**
 * Kaggle only ships a wordmark, which turns to mush at 14px. This is a
 * simplified "k" monogram in the same spirit, for icon-sized slots.
 */
function KaggleMark({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...rest}>
      <path d="M6 2.5h3.2v11.1l7.1-7.3h4.1l-6.9 7 7.4 8.2h-4.2l-5.2-5.9-2.3 2.3v3.6H6z" />
    </svg>
  );
}

const registry = {
  // brands
  github: FaGithub,
  x: FaXTwitter,
  kaggle: KaggleMark,
  "kaggle-wordmark": SiKaggle,
  jupyter: SiJupyter,
  python: SiPython,
  pandas: SiPandas,
  numpy: SiNumpy,
  plotly: SiPlotly,
  sklearn: SiScikitlearn,
  next: SiNextdotjs,
  typescript: SiTypescript,
  tailwind: SiTailwindcss,
  pnpm: SiPnpm,
  vercel: SiVercel,
  // ui
  activity: Activity,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,
  "arrow-up-down": ArrowUpDown,
  "arrow-up-right": ArrowUpRight,
  calendar: CalendarDays,
  "chart-bar": ChartBar,
  "chart-line": ChartLine,
  "chart-pie": ChartPie,
  check: Check,
  "chevron-right": ChevronRight,
  clock: Clock,
  copy: Copy,
  enter: CornerDownLeft,
  database: Database,
  dice: Dices,
  download: Download,
  csv: FileSpreadsheet,
  flask: FlaskConical,
  hash: Hash,
  grid: LayoutGrid,
  menu: Menu,
  message: MessageSquareText,
  moon: Moon,
  notebook: NotebookPen,
  radio: Radio,
  search: Search,
  sigma: Sigma,
  sparkles: Sparkles,
  sun: Sun,
  table: Table2,
  terminal: Terminal,
  close: XIcon,
} satisfies Record<string, AnyIcon>;

export type IconKey = keyof typeof registry;

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconKey;
  size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
  const Cmp = registry[name] as AnyIcon;
  return <Cmp size={size} aria-hidden="true" focusable="false" {...rest} />;
}

/** Maps a free-text tool name from a week file to a brand icon, if there is one. */
export function toolIcon(tool: string): IconKey | undefined {
  const key = tool.toLowerCase().replace(/[^a-z]/g, "");
  const map: Record<string, IconKey> = {
    python: "python",
    pandas: "pandas",
    numpy: "numpy",
    jupyter: "jupyter",
    plotly: "plotly",
    scikitlearn: "sklearn",
    sklearn: "sklearn",
    kaggle: "kaggle",
  };
  return map[key];
}
