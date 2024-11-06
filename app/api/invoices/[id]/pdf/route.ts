import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer-core";
import chrome from "@sparticuz/chromium";
import path from "path";

const prisma = new PrismaClient();

async function getBase64File(filePath: string): Promise<string> {
  try {
    const fs = require("fs");
    console.log(`[getBase64File] Reading file: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    return buffer.toString("base64");
  } catch (error) {
    console.error(`[getBase64File] Failed to read file ${filePath}:`, error);
    throw error;
  }
}

async function loadAssets() {
  try {
    console.log("[loadAssets] Starting to load assets...");
    const montserrat = await getBase64File(
      "public/fonts/Montserrat-VariableFont_wght.ttf"
    );
    console.log("[loadAssets] Successfully loaded Montserrat font");

    const kairoLogo = await getBase64File("public/kairo-dark.svg");
    console.log("[loadAssets] Successfully loaded Kairo logo");

    return { montserrat, kairoLogo };
  } catch (error) {
    console.error("[loadAssets] Failed to load assets:", error);
    throw error;
  }
}

async function getTokenImageBase64(tokenAddress: string): Promise<string> {
  console.log(
    `[getTokenImageBase64] Processing token address: ${tokenAddress}`
  );

  const tokenMap: { [key: string]: string } = {
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "USDC",
    "0x552ceaDf3B47609897279F42D3B3309B604896f3": "DAI",
  };

  const tokenSymbol = tokenMap[tokenAddress] || "Unknown";
  console.log(`[getTokenImageBase64] Resolved token symbol: ${tokenSymbol}`);

  const imagePath = `public/tokens/${tokenSymbol}.png`;
  console.log(
    `[getTokenImageBase64] Attempting to read image from: ${imagePath}`
  );

  try {
    const fs = require("fs");
    const imageBuffer = fs.readFileSync(imagePath);
    console.log(
      `[getTokenImageBase64] Successfully loaded token image for ${tokenSymbol}`
    );
    return imageBuffer.toString("base64");
  } catch (error) {
    console.error(
      `[getTokenImageBase64] Error reading token image for ${tokenSymbol}:`,
      error
    );
    return ""; // Return empty string if image can't be loaded
  }
}

function formatAmount(amount: string, tokenAddress: string) {
  const tokenMap: { [key: string]: { symbol: string; decimals: number } } = {
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": {
      symbol: "USDC",
      decimals: 6,
    },
    "0x552ceaDf3B47609897279F42D3B3309B604896f3": {
      symbol: "DAI",
      decimals: 18,
    },
  };

  const tokenInfo = tokenMap[tokenAddress] || {
    symbol: "Unknown",
    decimals: 18,
  };
  const formattedAmount = Number(amount) / Math.pow(10, tokenInfo.decimals);
  return `${formattedAmount.toLocaleString()} ${tokenInfo.symbol}`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log("[GET] Starting PDF generation process");
  let browser;

  try {
    console.log("[GET] Attempting to launch browser");
    browser = await puppeteer.launch({
      args: [...chrome.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath(),
      headless: true,
    });
    console.log("[GET] Browser launched successfully");

    const resolvedParams = await context.params;
    const { id } = resolvedParams;
    console.log(`[GET] Processing invoice ID: ${id}`);

    const userAddress = request.headers.get("x-user-address");
    if (!userAddress) {
      console.log("[GET] Request rejected: No wallet address provided");
      return NextResponse.json(
        { error: "Wallet not connected" },
        { status: 401 }
      );
    }

    console.log("[GET] Fetching invoice from database");
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceId: id },
      include: {
        payments: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!invoice) {
      console.log(`[GET] Invoice not found for ID: ${id}`);
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    console.log("[GET] Invoice found successfully");

    const isAuthorized =
      userAddress.toLowerCase() === invoice.issuerAddress.toLowerCase() ||
      userAddress.toLowerCase() === invoice.clientAddress.toLowerCase();

    if (!isAuthorized) {
      console.log(
        `[GET] Unauthorized access attempt from address: ${userAddress}`
      );
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "You must be either the invoice issuer or recipient to download this invoice",
        },
        { status: 403 }
      );
    }

    const amount = formatAmount(invoice.amount, invoice.tokenAddress);
    const fee = formatAmount(
      ((BigInt(invoice.amount) * BigInt(1)) / BigInt(100)).toString(),
      invoice.tokenAddress
    );
    const total = formatAmount(
      (
        BigInt(invoice.amount) +
        (BigInt(invoice.amount) * BigInt(1)) / BigInt(100)
      ).toString(),
      invoice.tokenAddress
    );

    console.log("[GET] Calculated amounts:", { amount, fee, total });

    console.log("[GET] Creating new browser page");
    const page = await browser.newPage();

    console.log("[GET] Loading assets");
    const assets = await loadAssets();
    console.log("[GET] Assets loaded successfully");

    console.log("[GET] Setting page content");
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @font-face {
              font-family: 'Montserrat';
              src: url(data:font/ttf;base64,${
                assets.montserrat
              }) format('truetype');
              font-weight: 100 900;
              font-style: normal;
            }
            
            body {
              font-family: 'Montserrat', sans-serif;
              margin: 0;
              padding: 0;
              color: #111827;
              background-color: #09090b;
              line-height: 1.5;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 60px;
              background-color: #09090b;
              color: #ffffff;
            }

            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 48px;
            }

            .logo-section {
              flex: 1;
            }

            .logo {
              width: 120px;
              height: auto;
              margin-bottom: 16px;
            }

            .invoice-meta {
              text-align: right;
            }

            .invoice-title {
              font-size: 32px;
              font-weight: 800;
              color: #ffffff;
              margin-bottom: 16px;
              font-family: 'Montserrat', sans-serif;
            }

            .invoice-number {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.6);
              margin-bottom: 8px;
            }

            .invoice-date {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.6);
            }

            .parties-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 48px;
              padding-bottom: 48px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .party-box {
              flex: 1;
              max-width: 300px;
            }

            .party-label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: rgba(255, 255, 255, 0.6);
              margin-bottom: 8px;
              font-weight: 600;
            }

            .party-value {
              font-size: 14px;
              color: #ffffff;
              word-break: break-all;
              line-height: 1.6;
            }

            .details-section {
              margin-bottom: 48px;
            }

            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 32px;
            }

            .details-table th {
              background-color: rgba(255, 255, 255, 0.05);
              padding: 12px 16px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.6);
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .details-table td {
              padding: 16px;
              font-size: 14px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              color: #ffffff;
            }

            .amount-cell {
              text-align: right;
            }

            .token-container {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 8px;
            }

            .token-image {
              width: 20px;
              height: 20px;
              border-radius: 50%;
            }

            .totals-section {
              width: 300px;
              margin-left: auto;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
              color: #ffffff;
            }

            .total-row.final {
              border-top: 2px solid rgba(255, 255, 255, 0.1);
              margin-top: 8px;
              padding-top: 16px;
              font-weight: 700;
            }

            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 9999px;
              font-size: 13px;
              font-weight: 600;
              margin-top: 16px;
            }
            
            .status-paid {
              background-color: rgba(234, 88, 12, 0.1);
              color: #ea580c;
              border: 1px solid rgba(234, 88, 12, 0.2);
            }
            
            .status-pending {
              background-color: rgba(255, 255, 255, 0.1);
              color: #ffffff;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .footer {
              margin-top: 64px;
              padding-top: 24px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              text-align: center;
              color: rgba(255, 255, 255, 0.4);
              font-size: 12px;
            }

            .payment-info {
              margin-top: 32px;
              padding: 24px;
              background-color: rgba(255, 255, 255, 0.05);
              border-radius: 8px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .payment-info-title {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 16px;
              color: #ffffff;
            }

            .payment-detail {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.6);
              margin-bottom: 8px;
            }

            .hash-value {
              font-family: monospace;
              font-size: 12px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="invoice-header">
              <div class="logo-section">
                <img 
                  src="data:image/svg+xml;base64,${assets.kairoLogo}" 
                  alt="Kairo"
                  class="logo"
                />
              </div>
              <div class="invoice-meta">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#${id}</div>
                <div class="invoice-date">
                  Issue Date: ${new Date(invoice.issuedDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
                <div class="invoice-date">
                  Due Date: ${new Date(invoice.dueDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
                <div class="status-badge ${
                  invoice.paid ? "status-paid" : "status-pending"
                }">
                  ${invoice.paid ? "Paid" : "Pending"}
                </div>
              </div>
            </div>

            <div class="parties-section">
              <div class="party-box">
                <div class="party-label">From</div>
                <div class="party-value">${invoice.issuerAddress}</div>
              </div>
              <div class="party-box">
                <div class="party-label">To</div>
                <div class="party-value">${invoice.clientAddress}</div>
              </div>
            </div>

            <div class="details-section">
              <table class="details-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Invoice Amount</td>
                    <td class="amount-cell">
                      <div class="token-container">
                        <img 
                          src="data:image/png;base64,${await getTokenImageBase64(
                            invoice.tokenAddress
                          )}" 
                          class="token-image"
                        />
                        ${amount}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Platform Fee (1%)</td>
                    <td class="amount-cell">
                      <div class="token-container">
                        <img 
                          src="data:image/png;base64,${await getTokenImageBase64(
                            invoice.tokenAddress
                          )}" 
                          class="token-image"
                        />
                        ${fee}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="totals-section">
                <div class="total-row final">
                  <span>Total Amount</span>
                  <div class="token-container">
                    <img 
                      src="data:image/png;base64,${await getTokenImageBase64(
                        invoice.tokenAddress
                      )}" 
                      class="token-image"
                    />
                    ${total}
                  </div>
                </div>
              </div>
            </div>

            ${
              invoice.paid && invoice.payments[0]
                ? `
              <div class="payment-info">
                <div class="payment-info-title">Payment Information</div>
                <div class="payment-detail">
                  Payment Date: ${invoice.payments[0].createdAt.toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
                <div class="payment-detail">
                  Transaction Hash:<br/>
                  <span class="hash-value">${
                    invoice.paymentTransactionHash
                  }</span>
                </div>
              </div>
            `
                : ""
            }

            <div class="footer">
              This invoice was generated by Kairo, a decentralized invoicing platform.
            </div>
          </div>
        </body>
      </html>
    `);
    console.log("[GET] Page content set successfully");

    console.log("[GET] Generating PDF");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });
    console.log("[GET] PDF generated successfully");

    await browser.close();
    console.log("[GET] Browser closed successfully");

    console.log("[GET] Sending PDF response");
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[GET] Critical error in PDF generation:", {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : "Unknown error type",
      browserStatus: browser ? "Initialized" : "Not initialized",
    });

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        console.log("[GET] Attempting to close browser in finally block");
        await browser.close();
        console.log("[GET] Browser closed successfully in finally block");
      } catch (error) {
        console.error("[GET] Error closing browser in finally block:", error);
      }
    }

    try {
      console.log("[GET] Disconnecting from Prisma");
      await prisma.$disconnect();
      console.log("[GET] Prisma disconnected successfully");
    } catch (error) {
      console.error("[GET] Error disconnecting from Prisma:", error);
    }
  }
}
