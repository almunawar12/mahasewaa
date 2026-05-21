import Link from "next/link";
import type { Service } from "@/app/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";

export function ServiceCard({ service }: { service: Pick<Service, "title" | "slug" | "basePrice" | "deliveryDays"> }) {
  return (
    <Link href={`/services/${service.slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>{service.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm text-slate-600">
          <span>{service.deliveryDays} hari</span>
          <span className="font-semibold text-emerald-600">{formatIDR(service.basePrice.toString())}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
