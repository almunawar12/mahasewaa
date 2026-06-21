"use client"

import { useEffect } from "react"

export type PartnerModalData = {
  id: string
  name: string
  photoUrl: string
  skills: string[]
  categories: string[]
}

interface Props {
  partner: PartnerModalData
  onClose: () => void
}

export function PartnerModal({ partner, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="animate-modal-in relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Tutup"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        {/* Photo */}
        <div className="flex flex-col items-center text-center">
          <img
            src={partner.photoUrl}
            alt={partner.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-emerald-100 shadow-md mb-4"
          />

          {/* Name */}
          <h2 className="text-xl font-bold text-[#191c1e]">{partner.name}</h2>

          {/* Categories */}
          {partner.categories.length > 0 && (
            <p className="text-sm text-emerald-600 mt-1">{partner.categories.join(" · ")}</p>
          )}

          {/* Divider */}
          <div className="w-12 h-0.5 bg-emerald-200 rounded-full my-5" />

          {/* Skills */}
          {partner.skills.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Keahlian
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {partner.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Belum ada skill yang ditambahkan.</p>
          )}
        </div>
      </div>
    </div>
  )
}
