import Image from "next/image";

import { cn } from "@/lib/utils";

type CourtImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  fallbackClassName?: string;
};

/**
 * Fotografía de cancha con relleno absoluto. El contenedor debe ser
 * `relative` y controlar el recorte con `overflow-hidden`.
 */
export function CourtImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  quality = 80,
  fallbackClassName,
}: CourtImageProps) {
  if (!src) {
    return (
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800",
          fallbackClassName,
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={cn("object-cover", className)}
    />
  );
}
