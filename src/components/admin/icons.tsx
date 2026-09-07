/** Small line icons for admin buttons. 16px, inherit the text colour. */
const paths: Record<string, string> = {
  plus: "M10 4v12M4 10h12",
  copy: "M7 7h9v9H7zM4 13V4h9",
  check: "M4 10.5l4 4 8-9",
  mail: "M3 5h14v10H3zM3 5l7 6 7-6",
  external: "M11 4h5v5M16 4l-7 7M14 11v5H4V6h5",
  trash: "M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10M9 9v4M11 9v4",
  pencil: "M4 16l1-4 8-8 3 3-8 8-4 1zM11 6l3 3",
  settings: "M4 6h12M4 14h12M8 4v4M12 12v4",
  undo: "M4 8h8a4 4 0 010 8H8M4 8l3-3M4 8l3 3",
  key: "M12 4a4 4 0 100 8 4 4 0 000-8zM9 11l-5 5M6 14l2 2",
  eye: "M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5zM10 12a2 2 0 100-4 2 2 0 000 4z",
  play: "M6 4l10 6-10 6z",
  pause: "M6 4h3v12H6zM11 4h3v12h-3z",
  archive: "M3 5h14v3H3zM4 8v8h12V8M8 11h4",
  image: "M3 4h14v12H3zM3 13l4-4 3 3 3-3 4 4",
  dollar: "M10 3v14M13 6.5c0-1.4-1.3-2.5-3-2.5S7 5.1 7 6.5 8.3 9 10 9s3 1.1 3 2.5S11.7 14 10 14s-3-1.1-3-2.5",
  doc: "M5 3h7l3 3v11H5zM12 3v3h3M7 10h6M7 13h6",
  link: "M8 12l4-4M7 9l-2 2a3 3 0 004 4l2-2M13 11l2-2a3 3 0 00-4-4l-2 2",
};

export type IconName = keyof typeof paths;

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d={paths[name]} />
    </svg>
  );
}
