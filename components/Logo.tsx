import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 36 }: { size?: number }) {
  const inner = Math.round(size * 0.78);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.06)]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt=""
        width={inner}
        height={inner}
        className="object-contain"
        priority
      />
    </span>
  );
}

export function Logo({
  href = "/",
  size = 36,
  showWordmark = true,
  className,
  wordmarkClassName,
}: {
  href?: string;
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showWordmark ? (
        <span
          className={cn(
            "text-[15px] font-medium tracking-[-0.02em] text-white",
            wordmarkClassName,
          )}
        >
          FirmFlow
        </span>
      ) : null}
    </Link>
  );
}
