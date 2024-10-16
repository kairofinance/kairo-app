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
