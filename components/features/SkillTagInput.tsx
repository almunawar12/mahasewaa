"use client"

import { KeyboardEvent, useState } from "react"
import { Input } from "@/components/ui/input"

interface Props {
  name: string
  defaultValue?: string[]
}

export function SkillTagInput({ name, defaultValue = [] }: Props) {
  const [tags, setTags] = useState<string[]>(defaultValue)
  const [inputValue, setInputValue] = useState("")

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setInputValue("")
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md bg-white">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-sm rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTag(inputValue)}
          placeholder={tags.length === 0 ? "Ketik skill lalu Enter..." : ""}
          className="border-0 shadow-none focus-visible:ring-0 h-auto p-0 flex-1 min-w-32 text-sm"
        />
      </div>
      <p className="text-xs text-slate-400">Tekan Enter atau koma untuk menambah skill</p>
    </div>
  )
}
