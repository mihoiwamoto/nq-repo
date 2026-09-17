/** キャンバス UI 専用の小さなアイコン。ツールバー/パネルで使う。 */
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const base = (props: Props) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconCursor = (p: Props) => (
  <svg {...base(p)}>
    <path d="M5 3l14 8-6 2-2 6z" />
  </svg>
);
export const IconHand = (p: Props) => (
  <svg {...base(p)}>
    <path d="M8 13V5.5a1.5 1.5 0 013 0V12M11 6.5V4.5a1.5 1.5 0 013 0V12M14 6.5a1.5 1.5 0 013 0V13M17 9.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-2a6 6 0 01-5-2.7L4 13.5a1.6 1.6 0 012.6-1.8L8 13" />
  </svg>
);
export const IconPlay = (p: Props) => (
  <svg {...base(p)}>
    <path d="M7 4l12 8-12 8z" />
  </svg>
);
export const IconUndo = (p: Props) => (
  <svg {...base(p)}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10a6 6 0 010 12h-3" />
  </svg>
);
export const IconRedo = (p: Props) => (
  <svg {...base(p)}>
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H10a6 6 0 000 12h3" />
  </svg>
);
export const IconZoomIn = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
  </svg>
);
export const IconZoomOut = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3M8 11h6" />
  </svg>
);
export const IconFit = (p: Props) => (
  <svg {...base(p)}>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  </svg>
);
export const IconReload = (p: Props) => (
  <svg {...base(p)}>
    <path d="M20 12a8 8 0 01-14.9 4M4 12a8 8 0 0114.9-4" />
    <path d="M19 3v5h-5M5 21v-5h5" />
  </svg>
);
export const IconExternal = (p: Props) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5" />
  </svg>
);
export const IconMonitor = (p: Props) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M12 16v4M8 20h8" />
  </svg>
);
export const IconTablet = (p: Props) => (
  <svg {...base(p)}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M11 18h2" />
  </svg>
);
export const IconLayers = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </svg>
);
export const IconScreens = (p: Props) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);
export const IconParts = (p: Props) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);
export const IconEyeOff = (p: Props) => (
  <svg {...base(p)}>
    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
    <path d="M9.9 5.2A10 10 0 0121 12a10.6 10.6 0 01-2.6 3.4M6.2 6.2A10.6 10.6 0 003 12a10 10 0 0013.5 5.4" />
  </svg>
);
export const IconTrash = (p: Props) => (
  <svg {...base(p)}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);
export const IconCopy = (p: Props) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a1 1 0 011-1h10" />
  </svg>
);
export const IconUp = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
export const IconDown = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
export const IconParent = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 20V8M7 13l5-5 5 5M5 4h14" />
  </svg>
);
export const IconSearch = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
export const IconSliders = (p: Props) => (
  <svg {...base(p)}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);
export const IconSparkle = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
  </svg>
);
export const IconPanelLeft = (p: Props) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </svg>
);
export const IconPanelRight = (p: Props) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M15 4v16" />
  </svg>
);
export const IconClose = (p: Props) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconLedger = (p: Props) => (
  <svg {...base(p)}>
    <path d="M5 3h11l4 4v14a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" />
    <path d="M15 3v5h5M8 13h8M8 17h5" />
  </svg>
);
export const IconFolder = (p: Props) => (
  <svg {...base(p)}>
    <path d="M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
  </svg>
);
export const IconHistory = (p: Props) => (
  <svg {...base(p)}>
    <path d="M3.2 10.5A9 9 0 1112 21a8.96 8.96 0 01-6.2-2.5" />
    <path d="M3 5v5h5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IconComment = (p: Props) => (
  <svg {...base(p)}>
    <path d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v10a1.5 1.5 0 01-1.5 1.5H10l-4 3.2V17h-.5A1.5 1.5 0 014 15.5z" />
    <path d="M8 8.5h8M8 12.5h5" />
  </svg>
);
export const IconCheck = (p: Props) => (
  <svg {...base(p)}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);
export const IconGrip = (p: Props) => (
  <svg {...base(p)} strokeWidth={0} fill="currentColor">
    <circle cx="9" cy="6" r="1.4" />
    <circle cx="15" cy="6" r="1.4" />
    <circle cx="9" cy="12" r="1.4" />
    <circle cx="15" cy="12" r="1.4" />
    <circle cx="9" cy="18" r="1.4" />
    <circle cx="15" cy="18" r="1.4" />
  </svg>
);
export const IconMore = (p: Props) => (
  <svg {...base(p)} strokeWidth={0} fill="currentColor">
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);
