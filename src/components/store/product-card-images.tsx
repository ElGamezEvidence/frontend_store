"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";

type Img = { url: string; alt?: string | null };

export function ProductCardImages({
  images,
  name,
}: {
  images: Img[];
  name: string;
}) {
  const list = images.length > 0 ? images : [{ url: "", alt: name }];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (list.length < 2) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % list.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [list.length]);

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
      {list.map((img, index) => (
        <div
          key={img.url || index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            index === active ? "opacity-100 z-[1]" : "opacity-0 z-0",
          )}
        >
          <SafeImage
            src={img.url || null}
            alt={img.alt || name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              index === active ? "scale-105" : "scale-100",
            )}
          />
        </div>
      ))}
      {list.length > 1 ? (
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1">
          {list.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1 rounded-full transition-all duration-500 ease-out",
                index === active ? "w-4 bg-white" : "w-1 bg-white/55",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
