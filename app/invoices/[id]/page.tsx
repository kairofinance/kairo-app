import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import Spinner from "@/components/Spinner";
import InvoiceIdClient from "./InvoiceIdClient";

export default async function InvoicePage({ params }: any) {
  return (
    <AuthWrapper>
      <Suspense fallback={<Spinner />}>
        <InvoiceIdClient invoiceId={params.id} />
      </Suspense>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
