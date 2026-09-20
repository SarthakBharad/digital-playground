import { Fragment } from "react";

/**
 * Renders the tiny subset of markdown the week files use:
 * **bold**, `code` and [label](https://link). Everything else is plain text,
 * so strings from content files never reach innerHTML.
 */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          const external = /^https?:/.test(href ?? "");
          return (
            <a key={i} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
              {label}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
