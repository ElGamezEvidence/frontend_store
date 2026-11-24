"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (list.length < 2) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % list.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [list.length]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-muted md:aspect-square lg:aspect-[5/6]">
        {list.map((img, index) => (
          <div
            key={img.id || img.url || index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              index === active ? "opacity-100 z-[1]" : "opacity-0 z-0",
            )}
          >
            <SafeImage
              src={img.url || null}
              alt={img.alt || name}
              fill
              priority={index === 0}
              sizes="(max-width:1024px) 100vw, 50vw"
              className={cn(
                "object-cover transition-transform duration-[2800ms] ease-out",
                index === active ? "scale-105" : "scale-100",
              )}
            />
          </div>
        ))}
        {list.length > 1 ? (
          <div className="absolute inset-x-0 bottom-3 z-[2] flex justify-center gap-1.5">
            {list.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Image ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500 ease-out",
                  index === active ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, index) => (
            <button
              key={img.id || img.url || index}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300",
                index === active ? "border-primary scale-[1.02]" : "border-transparent opacity-80 hover:opacity-100",
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
