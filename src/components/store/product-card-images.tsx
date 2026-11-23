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
    }, 2000);
    return () => window.clearInterval(id);
  }, [list.length]);

  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
      <SafeImage
        key={current.url || active}
        src={current.url || null}
        alt={current.alt || name}
        fill
        sizes="(max-width:768px) 50vw, 25vw"
        className="object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      {list.length > 1 ? (
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1">
          {list.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1 rounded-full transition-all",
                index === active ? "w-4 bg-white" : "w-1 bg-white/55",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
