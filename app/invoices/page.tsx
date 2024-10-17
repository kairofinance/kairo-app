// For invoice creation
const createInvoiceProof = async (
  token: string,
  issuer: string,
  client: string,
  amount: number,
  dueDate: number
) => {
  const response = await fetch("/api/createInvoiceProof", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, issuer, client, amount, dueDate }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate invoice creation proof");
  }
  return await response.json();
};

// For invoice payment
const payInvoiceProof = async (
  invoiceHash: string,
  amount: number,
  token: string
) => {
  const response = await fetch("/api/payInvoiceProof", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invoiceHash, amount, token }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate invoice payment proof");
  }
  return await response.json();
};

export default function InvoiceDashboard() {
  return (
    <div className="border-b border-zinc-200 bg-white px-4 py-5 sm:px-6 max-w-5xl mx-auto mt-12 rounded-md">
      <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="ml-4 mt-4">
          <h3 className="text-base font-semibold leading-6 text-zinc-900">
            Invoices
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            View your current incoming and outgoing invoices
          </p>
        </div>
        <div className="ml-4 mt-4 flex-shrink-0">
          <button
            type="button"
            className="relative inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Create new invoice
          </button>
        </div>
      </div>
    </div>
  );
}
