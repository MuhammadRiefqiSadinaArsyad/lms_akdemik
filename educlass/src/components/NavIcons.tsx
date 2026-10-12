type IconProps = { size?: number; className?: string };

function Base({
  size = 17,
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

export function IconHome(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </Base>
  );
}

export function IconBook(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
      <path d="M8 7.5h8" />
    </Base>
  );
}

export function IconTask(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="5" y="4" width="14" height="17" rx="1" />
      <path d="m9 13 2 2 4-4.5" />
      <path d="M9 8h6" />
    </Base>
  );
}

export function IconGrade(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-8" />
      <path d="M2 20h20" />
    </Base>
  );
}

export function IconGrid(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </Base>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c.8-3.2 3.2-5 6-5s5.2 1.8 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 15.2c2.3.3 4 1.9 4.7 4.3" />
    </Base>
  );
}

export function IconLayers(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </Base>
  );
}

export function IconInbox(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M3 13 5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z" />
      <path d="M3 13h6l1.5 2.5h3L15 13h6" />
    </Base>
  );
}

export function IconUser(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.9-3.6 3.7-5.5 7-5.5s6.1 1.9 7 5.5" />
    </Base>
  );
}

export function IconLogout(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M14 4H6v16h8" />
      <path d="m10 12 7-4 3 4-3 4-7-4Z" />
      <path d="M17 8v8" />
    </Base>
  );
}

export function IconClose(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  );
}

export function IconEye(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Base>
  );
}

export function IconEyeOff(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M10.6 5.9A9.8 9.8 0 0 1 12 5.5c6.5 0 10 6.5 10 6.5a17 17 0 0 1-3.2 3.9" />
      <path d="M6.6 6.6A16.4 16.4 0 0 0 2 12s3.5 6.5 10 6.5c1.4 0 2.7-.3 3.9-.8" />
      <path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" />
      <path d="M4 4l16 16" />
    </Base>
  );
}

export function IconChevron(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}
