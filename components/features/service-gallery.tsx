"use client";

import { useState } from "react";
import Image from "next/image";

export function ServiceGallery({ images, title }: { images: string[]; title: string }) {
  const fallback = "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200";
  const list = images.length > 0 ? images : [fallback];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#c3c6d7] bg-white">
        <Image
          src={list[active]}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 70vw"
          priority={active === 0}
        />
      </div>

      {list.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded-lg transition-opacity ${
                i === active
                  ? "border-2 border-[#004ac6]"
                  : "border border-[#c3c6d7] opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
