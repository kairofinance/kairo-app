import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import Spinner from "@/components/Spinner";
import InvoiceIdClient from "./InvoiceIdClient";
import { getCacheHeaders } from "@/utils/cache-headers";

interface InvoicePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: InvoicePageProps) {
  const headers = getCacheHeaders({
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 300,
  });

  return {
    title: `Invoice #${params.id} | Kairo`,
    description: `View invoice details`,
    other: {
      headers,
    },
  };
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const { id: invoiceId } = params;

  return (
    <AuthWrapper>
      <Suspense fallback={<Spinner />}>
        <InvoiceIdClient invoiceId={invoiceId} />
      </Suspense>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
