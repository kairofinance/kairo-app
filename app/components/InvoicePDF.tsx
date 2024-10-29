/* eslint-disable @next/next/no-img-element */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { formatUnits } from "viem";

// Update font registration to use Garet fonts
Font.register({
  family: "Garet",
  fonts: [
    {
      src: "/fonts/Garet-Book.woff2",
      fontWeight: 400,
    },
    {
      src: "/fonts/Garet-Heavy.woff2",
      fontWeight: 700,
    },
  ],
});

// Add base64 encoded SVG logo
const LOGO_BASE64 = `data:image/svg+xml;base64,${Buffer.from(
  `
<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20.4721 31.9151C15.6348 31.9151 11.7148 27.9951 11.7148 23.1578C11.7148 18.3205 15.6348 14.4004 20.4721 14.4004C25.3094 14.4004 29.2295 18.3205 29.2295 23.1578C29.2295 27.9951 25.3094 31.9151 20.4721 31.9151Z" fill="#89F95E"/>
  <path d="M43.7869 14.4004H37.9869V31.9151H43.7869V14.4004Z" fill="#89F95E"/>
  <path d="M65.377 31.9151L57.877 23.1578L65.377 14.4004H58.627L51.127 23.1578L58.627 31.9151H65.377Z" fill="#89F95E"/>
  <path d="M72.4672 31.9151H78.2672V14.4004H72.4672V31.9151Z" fill="#89F95E"/>
  <path d="M100.057 31.9151L92.5573 23.1578L100.057 14.4004H93.3073L85.8073 23.1578L93.3073 31.9151H100.057Z" fill="#89F95E"/>
</svg>
`
).toString("base64")}`;

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 60,
    fontFamily: "Garet",
    fontWeight: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
  },
  headerLeft: {
    flexDirection: "column",
    maxWidth: "60%",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  logo: {
    width: 100,
    height: 33,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: "#121212",
    marginBottom: 4,
    fontFamily: "Garet",
  },
  invoiceNumber: {
    fontSize: 13,
    fontWeight: 700,
    color: "#575757",
    fontFamily: "Garet",
  },
  dates: {
    marginTop: 20,
    fontSize: 10,
    fontWeight: 500,
    color: "#575757",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  dateLabel: {
    width: 80,
    textAlign: "right",
    marginRight: 12,
    color: "#3f3f3f",
    fontWeight: 700,
    fontFamily: "Garet",
  },
  dateValue: {
    width: 100,
    fontWeight: 500,
    color: "#575757",
  },
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
    borderTop: "1px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",
    paddingVertical: 30,
  },
  addressBlock: {
    width: "47%",
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    color: "#121212",
    fontFamily: "Garet",
  },
  addressText: {
    fontSize: 9,
    fontWeight: 500,
    color: "#575757",
    lineHeight: 1.4,
    wordBreak: "break-all",
  },
  addressLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#3f3f3f",
    marginBottom: 2,
  },
  itemsSection: {
    marginBottom: 60,
  },
  itemsHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    padding: 12,
    fontSize: 11,
    fontWeight: 700,
    color: "#121212",
    marginBottom: 2,
    fontFamily: "Garet",
  },
  itemsRow: {
    flexDirection: "row",
    padding: 12,
    fontSize: 11,
    fontWeight: 500,
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #E5E7EB",
  },
  descriptionCol: {
    flex: 2,
    fontWeight: 700,
    fontFamily: "Garet",
    color: "#3f3f3f",
  },
  tokenCol: {
    flex: 1,
    textAlign: "center",
    color: "#575757",
  },
  amountCol: {
    flex: 1,
    textAlign: "right",
    color: "#121212",
    fontWeight: 700,
  },
  totalsSection: {
    width: "40%",
    alignSelf: "flex-end",
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 11,
    color: "#575757",
  },
  totalLabel: {
    fontWeight: 700,
    fontFamily: "Garet",
    color: "#3f3f3f",
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid #E5E7EB",
    fontSize: 14,
    fontWeight: 700,
    color: "#121212",
    fontFamily: "Garet",
  },
  footer: {
    position: "absolute",
    bottom: 60,
    left: 60,
    right: 60,
    fontSize: 8,
    fontWeight: 500,
    color: "#717171",
    textAlign: "center",
    paddingTop: 20,
    borderTop: "1px solid #E5E7EB",
  },
  status: {
    fontSize: 20,
    fontWeight: 700,
    color: "#89f95e",
    position: "absolute",
    top: 60,
    right: 60,
    fontFamily: "Garet",
  },
  hashText: {
    fontSize: 8,
    color: "#575757",
    marginBottom: 4,
  },
});

interface Token {
  name: string;
  image: string;
  address: string;
  decimals: number;
}

interface Invoice {
  id: string;
  invoiceId: string;
  issuerAddress: string;
  clientAddress: string;
  tokenAddress: string;
  amount: string;
  dueDate: string;
  issuedDate: string;
  transactionHash?: string;
  paid: boolean;
  paidDate?: string;
}

interface InvoicePDFProps {
  invoice: Invoice;
  tokenInfo?: Token;
}

const InvoicePDF = ({ invoice, tokenInfo }: InvoicePDFProps) => {
  const formatAmount = (amount: string, decimals: number): string => {
    const formattedAmount = formatUnits(BigInt(amount), decimals);
    return parseFloat(formattedAmount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  };

  const getStatusText = () => {
    return invoice.paid ? "PAID" : ""; // Only show PAID status
  };

  const getStatusColor = () => {
    return "#89f95e"; // Always use green color
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceId}</Text>
          </View>
          <View style={styles.headerRight}>
            <img src={LOGO_BASE64} style={styles.logo} alt="" />
            <View style={styles.dates}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Issue Date:</Text>
                <Text style={styles.dateValue}>
                  {new Date(invoice.issuedDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Due Date:</Text>
                <Text style={styles.dateValue}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </Text>
              </View>
              {invoice.paid && invoice.paidDate && (
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Paid Date:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(invoice.paidDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>From</Text>
            <Text style={styles.addressLabel}>Wallet Address</Text>
            <Text style={styles.addressText}>{invoice.issuerAddress}</Text>
            <Text style={styles.addressLabel}>Short Format</Text>
            <Text style={[styles.addressText, { fontSize: 11 }]}>
              {formatAddress(invoice.issuerAddress)}
            </Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>To</Text>
            <Text style={styles.addressLabel}>Wallet Address</Text>
            <Text style={styles.addressText}>{invoice.clientAddress}</Text>
            <Text style={styles.addressLabel}>Short Format</Text>
            <Text style={[styles.addressText, { fontSize: 11 }]}>
              {formatAddress(invoice.clientAddress)}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.descriptionCol}>Description</Text>
            <Text style={styles.tokenCol}>Token</Text>
            <Text style={styles.amountCol}>Amount</Text>
          </View>
          <View style={styles.itemsRow}>
            <Text style={styles.descriptionCol}>Payment</Text>
            <Text style={styles.tokenCol}>{tokenInfo?.name || "ETH"}</Text>
            <Text style={styles.amountCol}>
              {tokenInfo
                ? formatAmount(invoice.amount, tokenInfo.decimals)
                : invoice.amount}
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text>
              {tokenInfo
                ? formatAmount(invoice.amount, tokenInfo.decimals)
                : invoice.amount}{" "}
              {tokenInfo?.name}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>
              {tokenInfo
                ? formatAmount(invoice.amount, tokenInfo.decimals)
                : invoice.amount}{" "}
              {tokenInfo?.name}
            </Text>
          </View>
        </View>

        {/* Status Watermark */}
        <Text
          style={[styles.status, { color: getStatusColor() }]}
          render={({ pageNumber, totalPages }) =>
            pageNumber === 1 ? getStatusText() : ""
          }
        />

        {/* Footer */}
        <View style={styles.footer}>
          {invoice.transactionHash && (
            <Text style={styles.hashText}>
              TX Hash: {formatAddress(invoice.transactionHash)}
            </Text>
          )}
          <Text>Generated by Kairo • Secure Web3 Billing</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
