"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PartnerCard } from "@/components/features/PartnerCard"
import { PartnerModal, type PartnerModalData } from "@/components/features/PartnerModal"

type Partner = PartnerModalData

interface Props {
  partners: Partner[]
}

export function PartnersGrid({ partners }: Props) {
  const [selected, setSelected] = useState<Partner | null>(null)

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 items-stretch"
      >
        {partners.map((partner) => (
          <motion.button
            key={partner.id}
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onClick={() => setSelected(partner)}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl h-full"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <PartnerCard
              name={partner.name}
              photoUrl={partner.photoUrl}
              skills={partner.skills}
              categories={partner.categories}
            />
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <PartnerModal partner={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
