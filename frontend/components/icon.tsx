import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function DuoOwl(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <circle cx="24" cy="24" r="20" fill="#58cc02" />
      <circle cx="24" cy="26" r="13" fill="#8be04e" />
      <ellipse cx="17" cy="23" rx="4.5" ry="5.5" fill="#fff" />
      <ellipse cx="31" cy="23" rx="4.5" ry="5.5" fill="#fff" />
      <circle cx="17" cy="23" r="2.6" fill="#1b1b1b" />
      <circle cx="31" cy="23" r="2.6" fill="#1b1b1b" />
      <path d="M24 24 l-4 0 4 4 4-4z" fill="#ffc800" />
      <path d="M20 36 q4 5 8 0 l-4 -2z" fill="#1b1b1b" opacity="0.85" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.68 2.38c-.93-.65-2.06-.66-3 0-.42.3-.65.8-.58 1.3l.22 1.52c.15 1.06-.3 2.1-1.18 2.74-.74.53-1.18 1.38-1.18 2.3 0 .97.47 1.88 1.29 2.43 1.53 1.04 2.6 2.6 3.1 4.42.67 2.4 2.92 3.72 5.19 3.06-2.26-.35-3.22-2.03-3.22-3.7 0-1.1.57-2.06 1.46-2.6.7-.43 1.11-1.25 1.06-2.13l-.04-.62c-.15-2.2-1.73-3.1-3.9-4.36l.16-.7c.07-.5-.14-1.01-.56-1.31zM8.66 4.87a3.7 3.7 0 00-1.1 1.34C5.24 8.3 4 11.2 4 14.4 4 19.7 8.1 24 13.3 24S22.4 19.7 22.4 14.4c0-2.4-.8-4.7-2.15-6.5-.25.6-.7 1.13-1.3 1.46-.86.46-1.4 1.37-1.4 2.35v.58c.05 1.62-.8 3.1-2.15 3.9-1.48.88-2.45 2.4-2.6 4.1a6.8 6.8 0 01.5-6.2c.84-1.47 1.4-3.17 1.5-4.96.17-2.2-0-4.4-1.4-5.7 0 0-.87-2.28-1.04-2.66z"
      />
    </svg>
  );
}

export function CrystalIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M6.4 4h11.2l3 3.2a2 2 0 01.32 2.25l-4.6 9.2a3 3 0 01-2.66 1.56h-3.32a3 3 0 01-2.66-1.55l-4.6-9.2A2 2 0 013.4 7.2c.02-.4.12-.8.3-1.2L6.4 4zm0 0L10 6.8 9.2 10.4 6.4 4zm11.2 0L14 6.8l.8 3.6L17.6 4zM8.3 3.1h-.9l2.2 2 2.4-2zm4.15 2.9L12 2.8 10.85 6zm3.4-3h-.9l-3.7 2-2.4-2 2.6 4zm-7 9.4l1.9 2.5 1.7-3.7 2.2-3.5 1.2 4.7 1.3 2.5 2-1.9-.2.4 1.6-3.8-1 2.4 1.6-4.4-2.4-.7L9.9 12.4 8.85 9.4z"
      />
    </svg>
  );
}

export function HeartIcon({ broken, ...props }: IconProps & { broken?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      {broken ? (
        <>
          <path
            fill="#bfbfbf"
            d="M12 7l1.2-1.2c-.25-1.2-.04-1.86 1.26-2.6 1.3-.74 3.16-1.09 4.1.3.28.45.44.97.44 1.5 0 .4-.1.8-.3 1.16L12 15.7V7zM6.5 4.1c.38-.93.79-1.36 1.53-1.68l.06.06 1.36-.06c1.6-.06 2.93.26 3.24 1.63l.23.95c.1.42.16.85.2 1.28L2.43 20.3c-.42.42-1.12.44-1.57.03-.39-.38-.4-1.02-.02-1.46 0 0 2.3-2.9 4-5l2.16-2.71L9 10.07l-1.8-2.1c-.82-.96-1.28-2.15-.7-3.2z"
          />
          <path
            fill="#a6a6a6"
            d="M17.8 8.05 12 16.5l5.8 3.5c1.06.64 2.42-.03 2.42-1.57V8.63a4.4 4.4 0 00-.4-1.35c-.46 1.04-1.3 1.23-1.44 2.06-.1.58-.02 1.16-.4 1.4.6-1.1 1.1-4.05 1.16-5.36.5-.2.9-.6 1.1-1.04.13.36.2.74.2 1.12v9.7c0 1.54-1.36 2.2-2.42 1.57z"
          />
        </>
      ) : (
        <path
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      )}
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 2a4 4 0 00-4 4v3H6.5A1.5 1.5 0 005 10.5v8A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5v-8A1.5 1.5 0 0017.5 9H16V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v3h-4V6a2 2 0 012-2zm-1 9.27V16a1 1 0 002 0v-2.73a2 2 0 10-2 0z"
      />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 2.4c.23 0 .45.08.63.24l2.7 2.2 3.5.16c.45.02.82.34.92.78l.98 3.37 2.7 2.23c.35.29.47.77.3 1.18l-1.3 3.26-.38 3.5c-.05.44-.36.76-.79.84l-3.47.52-2.38 2.57c-.3.32-.8.37-1.17.13l-2.9-1.57-2.56 1.26c-.4.2-.9.12-1.21-.2l-2.4-2.56-3.29-.95c-.4-.11-.77-.46-.85-.95l-.4-3.66-1.8-3.03c-.22-.37-.17-.84.12-1.16l2.6-2.38 1.08-3.32c.14-.42.53-.7.98-.68l3.48.28 2.3-2.53c.24-.26.58-.4.93-.4z"
      />
    </svg>
  );
}

export function CrownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M3 8.5l4.6 3.1L12 5l4.4 6.6L21 8.5v8.6l-2.1 2h-13.8L3 17.1V8.5z"
      />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M5 3h4.5a2 2 0 00-2 2H5v1.5a5.5 5.5 0 005.5 5.5h1c2.6 0 4.8-2 4.7-4.6h2.5V5h-2.5a2 2 0 00-2-2H19v1a6 6 0 01-6 6 6 6 0 01-6-6V3h4.5A1.5 1.5 0 0014 5.5V5h-2v2h.5l-.05.05A4.5 4.5 0 018.8 11.43 5.5 5.5 0 005 6V3zM12 12a1.5 1.5 0 011.5 1.5l1 3.5h-5l1-3.5A1.5 1.5 0 0112 12zm-3 6h6l1 3H8l1-3z"
      />
    </svg>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 12a5 5 0 100-10 5 5 0 000 10zm0-8a3 3 0 110 6 3 3 0 010-6zM12 14a7 7 0 00-7 7h2a5 5 0 0110 0h2a7 7 0 00-7-7z"
      />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M19.4 13a7.6 7.6 0 000-2l2.1-1.6a.5.5 0 00.1-.7l-2-3.4a.5.5 0 00-.6-.2l-2.5 1a7.8 7.8 0 00-1.7-1l-.4-2.6a.5.5 0 00-.5-.4H9.8a.5.5 0 00-.5.4l-.4 2.6a7.8 7.8 0 00-1.7 1l-2.5-1a.5.5 0 00-.6.2l-2 3.4a.5.5 0 00.1.7L4.3 11a7.6 7.6 0 000 2l-2.1 1.6a.5.5 0 00-.1.7l2 3.4c.1.2.4.3.6.2l2.5-1a7.8 7.8 0 001.7 1l.4 2.6c0 .2.2.4.5.4h4.4c.3 0 .5-.2.5-.4l.4-2.6a7.8 7.8 0 001.7-1l2.5 1c.2.1.5 0 .6-.2l2-3.4a.5.5 0 00-.1-.7l-2-1.6zm-7.4 2.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"
      />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 3l9 7.5V21h-6v-5h-6v5H3v-10.5L12 3z"
      />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M9.85 19.2 3.7 13.05a1 1 0 011.4-1.4l5.45 5.45.05.05L21.7 5.85a1 1 0 111.5 1.35l-10.5 11.9a1.1 1.1 0 01-1.55-.06l-.3-.33 2.34-2.4z"
      />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M18.3 5.7a1 1 0 00-1.4 0L12 10.6 7.1 5.7a1 1 0 10-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 101.4 1.4l4.9-4.9 4.9 4.9a1 1 0 001.4-1.4L13.4 12l4.9-4.9a1 1 0 000-1.4z"
      />
    </svg>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M13 2 4.5 13.5H11L9.5 22 19.5 10.5H13L15 2h-2z"
      />
    </svg>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M4 10v4h3l4 3V7L7 10H4zm11-4a6 6 0 010 12l-1.5-1.5a4.5 4.5 0 000-9L15 6zm3 3a7.5 7.5 0 010 6l-1.5-1.5a6 6 0 000-3L18 9z"
      />
    </svg>
  );
}