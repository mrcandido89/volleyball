import Image from "next/image";

import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  src?: string;
  className?: string;
  size?: "sm" | "md" | "xl";
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-lg",
} as const;

export function Avatar({ name, src, className, size = "md" }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 font-semibold text-slate-200",
        sizes[size],
        className,
      )}
      aria-label={name}
      title={name}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="64px"
          className="rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
