"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type Props = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackClassName?: string;
};

export function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  fill,
  ...rest
}: Props) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-sm text-muted-foreground",
          fill && "absolute inset-0",
          fallbackClassName,
          className,
        )}
      >
        No image
      </div>
    );
  }

  const isDataOrBlob = src.startsWith("data:") || src.startsWith("blob:");

  if (isDataOrBlob) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(fill && "absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      unoptimized={src.includes("unsplash.com")}
      {...rest}
    />
  );
}
