interface Props {
  name: string
  photoUrl: string
  skills: string[]
}

export function PartnerCard({ name, photoUrl, skills }: Props) {
  const displaySkills = skills.slice(0, 3)
  const remaining = skills.length - displaySkills.length

  return (
    <div className="flex flex-col items-center text-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <img
        src={photoUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-100 mb-3"
      />
      <p className="font-semibold text-slate-800 text-sm">{name}</p>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {displaySkills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs"
          >
            {skill}
          </span>
        ))}
        {remaining > 0 && (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">
            +{remaining} lainnya
          </span>
        )}
      </div>
    </div>
  )
}
