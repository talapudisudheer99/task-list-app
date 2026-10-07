import { APP } from "@/lib/constants/app";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
  labelClassName?: string;
  /** White tile on brand panels (e.g. login marketing side). */
  tileVariant?: "brand" | "onPrimary";
};

/** Brand mark: indigo tile with list + check (matches public/logo.svg and app/icon.svg). */
export function AppLogo({
  className,
  iconClassName,
  showLabel = false,
  labelClassName,
  tileVariant = "brand",
}: AppLogoProps) {
  const onPrimary = tileVariant === "onPrimary";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="none"
        className={cn("size-8 shrink-0", iconClassName)}
        aria-hidden
      >
        <rect
          width="32"
          height="32"
          rx="8"
          className={onPrimary ? "fill-primary-foreground" : "fill-primary"}
        />
        <path
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={onPrimary ? "text-primary" : "text-primary-foreground"}
          d="M9 10h14M9 16h10"
        />
        <path
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={onPrimary ? "text-primary" : "text-primary-foreground"}
          d="M22 20l2 2 4-5"
        />
      </svg>
      {showLabel ? (
        <span className={cn("font-heading text-base font-semibold", labelClassName)}>
          {APP.name}
        </span>
      ) : null}
    </div>
  );
}
