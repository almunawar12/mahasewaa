"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-lg bg-[#004ac6] py-[0.6875rem] text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Membuat akun..." : "Buat Akun"}
    </button>
  );
}

type Props = {
  action: (prev: string | null, formData: FormData) => Promise<string | null>;
};

export function RegisterForm({ action }: Props) {
  const [error, formAction] = useActionState(action, null);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-sm font-medium text-[#191c1e]">
          Nama Lengkap
        </Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          placeholder="Budi Santoso"
          className="h-11 border-[#c3c6d7] placeholder:text-[#c3c6d7] focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-[#191c1e]">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@email.com"
          className="h-11 border-[#c3c6d7] placeholder:text-[#c3c6d7] focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-[#191c1e]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="Min. 8 karakter"
          className="h-11 border-[#c3c6d7] placeholder:text-[#c3c6d7] focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/10"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
