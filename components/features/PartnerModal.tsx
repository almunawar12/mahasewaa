"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"

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
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
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
          <motion.img
            src={partner.photoUrl}
            alt={partner.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-emerald-100 shadow-md mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
          />

          <h2 className="text-xl font-bold text-[#191c1e]">{partner.name}</h2>

          {partner.categories.length > 0 && (
            <p className="text-sm text-emerald-600 mt-1">{partner.categories.join(" · ")}</p>
          )}

          <div className="w-12 h-0.5 bg-emerald-200 rounded-full my-5" />

          {partner.skills.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Keahlian
              </p>
              <motion.div
                className="flex flex-wrap justify-center gap-2"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
              >
                {partner.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Belum ada skill yang ditambahkan.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
