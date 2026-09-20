export interface NavItem {
  label: string;
  href: string;
  index: string;
}

export const navItems: NavItem[] = [
  { label: "Latest", href: "/#latest", index: "01" },
  { label: "The loop", href: "/#loop", index: "02" },
  { label: "Archive", href: "/weeks", index: "03" },
  { label: "Open data", href: "/#open-data", index: "04" },
];

/** Minimal shape the client-side palette needs for each week. */
export interface WeekLink {
  slug: string;
  number: number;
  title: string;
  status: string;
  tags: string[];
}
