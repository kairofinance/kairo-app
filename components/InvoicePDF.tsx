/* eslint-disable @next/next/no-img-element */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#0A0A0A",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: "#22C55E",
    marginBottom: 4,
  },
  invoiceId: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  value: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  amount: {
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "right",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF",
    borderBottomStyle: "solid",
    opacity: 0.1,
    marginVertical: 15,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
  },
  footerText: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.5,
    textAlign: "center",
  },
});

interface InvoicePDFProps {
  invoice: {
    invoiceId: string;
    issuerAddress: string;
    clientAddress: string;
    tokenAddress: string;
    amount: string;
    dueDate: string;
    issuedDate: string;
    paid: boolean;
    paidDate?: string;
    paymentTransactionHash?: string;
  };
  formatAmount: (amount: string) => string;
  getTokenInfo: (address: string) => { symbol: string; decimals: number };
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoice,
  formatAmount,
  getTokenInfo,
}) => {
  const tokenInfo = getTokenInfo(invoice.tokenAddress);
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const amount = formatAmount(invoice.amount);
  const fee = formatAmount(
    ((BigInt(invoice.amount) * BigInt(1)) / BigInt(100)).toString()
  );
  const total = formatAmount(
    (
      BigInt(invoice.amount) +
      (BigInt(invoice.amount) * BigInt(1)) / BigInt(100)
    ).toString()
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kairo Invoice</Text>
          <Text style={styles.invoiceId}>#{invoice.invoiceId}</Text>
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Amount</Text>
            <Text style={styles.value}>
              {amount} {tokenInfo.symbol}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Platform Fee (1%)</Text>
            <Text style={styles.value}>
              {fee} {tokenInfo.symbol}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.amount}>
              {total} {tokenInfo.symbol}
            </Text>
          </View>
        </View>

        {/* Parties Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <View style={styles.row}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{invoice.issuerAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>{invoice.clientAddress}</Text>
          </View>
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>{formatDate(invoice.issuedDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        {/* Payment Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={styles.value}>
              {invoice.paid ? "Paid" : "Pending"}
            </Text>
          </View>
          {invoice.paid && invoice.paidDate && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Payment Date</Text>
                <Text style={styles.value}>{formatDate(invoice.paidDate)}</Text>
              </View>
              {invoice.paymentTransactionHash && (
                <View style={styles.row}>
                  <Text style={styles.label}>Transaction Hash</Text>
                  <Text style={styles.value}>
                    {invoice.paymentTransactionHash}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by Kairo • {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
