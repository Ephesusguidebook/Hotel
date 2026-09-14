// The Ida Efes Otel logo.
//
// Two versions of the same artwork ship in /public/brand: the wordmark is
// white in `logo-white.svg` and the brand navy in `logo.svg`, and the gold
// mark above it is the same in both. Pick by the background you are putting
// it on, not by "light mode / dark mode" — `variant="light"` means the light
// (white) artwork, for a dark ground.
//
// Plain <img> rather than next/image: Next's image optimiser refuses SVG
// unless `dangerouslyAllowSVG` is turned on, and there is nothing to optimise
// in a 20 KB vector that is already the right shape at every size. The width
// and height attributes below are the artwork's real pixel dimensions — they
// are never rendered at that size (the className sets the height), but they
// give the browser the aspect ratio before the file loads, so the header
// doesn't jump as it arrives.

type Props = {
  /** "light" = white wordmark, for the navy header and footer.
   *  "dark"  = navy wordmark, for the ivory admin pages. */
  variant?: "light" | "dark";
  /** The hotel's name, used as the alt text — a logo is an image of the name,
   *  so a screen reader and a broken-image box should both say the name. */
  alt: string;
  className?: string;
};

export default function Logo({ variant = "light", alt, className = "" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={variant === "light" ? "/brand/logo-white.svg" : "/brand/logo.svg"}
      alt={alt}
      width={4253}
      height={1634}
      className={className}
    />
  );
}

/** Just the gold mark, without the wordmark. */
export function LogoSymbol({
  alt = "",
  className = "",
}: {
  alt?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/symbol.svg"
      alt={alt}
      width={863}
      height={655}
      aria-hidden={alt === "" ? true : undefined}
      className={className}
    />
  );
}
