import { ServiceForm } from "../_form";
import { createServiceAction } from "../actions";

export const metadata = { title: "Admin · Service Baru" };

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tambah Service Baru</h1>
      <ServiceForm action={createServiceAction} submitLabel="Buat Service" />
    </div>
  );
}
