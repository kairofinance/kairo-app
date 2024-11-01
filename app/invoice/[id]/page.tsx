import { Suspense } from "react";
import AuthWrapper from "@/auth/AuthWrapper";
import Spinner from "@/components/Spinner";
import InvoiceIdClient from "./InvoiceIdClient";
import { Metadata } from "next";

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Invoice Details | Kairo",
    description: "View invoice details",
    openGraph: {
      title: "Invoice Details | Kairo",
      description: "View invoice details",
    },
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return (
    <AuthWrapper>
      <Suspense fallback={<Spinner />}>
        <InvoiceIdClient invoiceId={id} />
      </Suspense>
    </AuthWrapper>
  );
}

export const dynamic = "force-dynamic";
