interface Props {
  name: string
  photoUrl: string
  skills: string[]
  categories?: string[]
}

export function PartnerCard({ name, photoUrl, skills, categories }: Props) {
  const displaySkills = skills.slice(0, 2)
  const remaining = skills.length - displaySkills.length

  return (
    <div className="h-full flex flex-col items-center text-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <img
        src={photoUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-100 mb-3 shrink-0"
      />

      {/* Name — fixed 2-line height */}
      <p className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
        {name}
      </p>

      {/* Categories */}
      <p className="text-xs text-emerald-600 mt-0.5 line-clamp-1 min-h-[1rem]">
        {categories && categories.length > 0 ? categories.join(" · ") : ""}
      </p>

      {/* Skills — always same height, max 2 shown */}
      <div className="flex flex-wrap justify-center gap-1 mt-2 min-h-[1.75rem] items-start">
        {displaySkills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs line-clamp-1 max-w-full"
          >
            {skill}
          </span>
        ))}
        {remaining > 0 && (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">
            +{remaining} lagi
          </span>
        )}
      </div>
    </div>
  )
}
