"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";

type Img = { id?: string; url: string; alt?: string | null };

export function ProductGallery({
  images,
  name,
}: {
  images: Img[];
  name: string;
}) {
  const list = images.length > 0 ? images : [{ url: "", alt: name }];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-muted md:aspect-square lg:aspect-[5/6]">
        <SafeImage
          src={current.url || null}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover animate-fade-in"
        />
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, index) => (
            <button
              key={img.id || img.url || index}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition",
                index === active ? "border-primary" : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <SafeImage
                src={img.url}
                alt={img.alt || name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
