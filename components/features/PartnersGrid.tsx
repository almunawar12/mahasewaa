"use client"

import { useState } from "react"
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {partners.map((partner, i) => (
          <button
            key={partner.id}
            onClick={() => setSelected(partner)}
            className="animate-fade-up text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <PartnerCard
              name={partner.name}
              photoUrl={partner.photoUrl}
              skills={partner.skills}
              categories={partner.categories}
            />
          </button>
        ))}
      </div>

      {selected && (
        <PartnerModal partner={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
