import Link from "next/link";
import Image from "next/image";
import { formatIDR } from "@/lib/utils";

type ServiceCardProps = {
  slug: string;
  title: string;
  basePrice: string | number;
  imageUrl?: string | null;
  sellerName?: string;
  sellerAvatar?: string | null;
  rating?: number;
  ratingCount?: number;
};

export function ServiceCard({
  slug,
  title,
  basePrice,
  imageUrl,
  sellerName = "MahaSewa",
  sellerAvatar,
  rating = 5.0,
  ratingCount = 0,
}: ServiceCardProps) {
  return (
    <Link
      href={`/services/${slug}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#c3c6d7] bg-white transition-shadow hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#e6e8ea]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#434655]">
            <span className="material-symbols-outlined text-5xl">image</span>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full bg-[#e0e3e5]">
            {sellerAvatar && (
              <Image
                src={sellerAvatar}
                alt={sellerName}
                fill
                className="object-cover"
                sizes="24px"
              />
            )}
          </div>
          <span className="text-xs font-medium text-[#434655]">{sellerName}</span>
        </div>

        <h3 className="mb-2 line-clamp-2 flex-grow text-base text-[#191c1e] transition-colors group-hover:text-[#004ac6]">
          {title}
        </h3>

        <div className="mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined icon-fill text-sm text-[#bc4800]">star</span>
          <span className="text-xs font-bold text-[#191c1e]">{rating.toFixed(1)}</span>
          <span className="text-xs text-[#434655]">({ratingCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[#c3c6d7] pt-3">
          <span className="material-symbols-outlined cursor-pointer text-[#434655] transition-colors hover:text-[#004ac6]">
            favorite
          </span>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#434655]">Mulai dari</span>
            <div className="text-lg font-semibold text-[#191c1e]">{formatIDR(basePrice)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
