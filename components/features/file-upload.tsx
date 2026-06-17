"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface FileUploadProps {
  bucket: string;
  path: string;
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({
  bucket,
  path,
  onUpload,
  accept,
  label = "Pilih File",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const filePath = `${path}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    setFileName(file.name);
    setUploading(false);
    onUpload(data.publicUrl);
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 disabled:opacity-50"
      >
        {uploading ? "Mengupload…" : label}
      </button>
      {fileName && (
        <p className="text-xs text-slate-500">✓ {fileName}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
