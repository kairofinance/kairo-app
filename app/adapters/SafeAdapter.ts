import { SafeAppProvider } from "@safe-global/safe-apps-provider";
import { ethers } from "ethers";
import Safe from "@safe-global/protocol-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";

export class SafeAdapter {
  private safeSDK: any = null;
  private safeService: any = null;
  private ethAdapter: any = null;

  async init(provider: any, safeAddress?: string) {
    // Handle both SafeAppProvider and standard Web3Provider
    const ethersProvider =
      provider instanceof SafeAppProvider
        ? new ethers.providers.Web3Provider(provider)
        : provider;

    const signer = ethersProvider.getSigner();

    // Create EthersAdapter instance without constructor arguments
    this.ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    });

    if (safeAddress) {
      this.safeSDK = await (Safe as any).create({
        ethAdapter: this.ethAdapter,
        safeAddress,
        chainId: BigInt(11155111), // Sepolia chain ID as BigInt
      });
    }

    this.safeService = new SafeApiKit({
      txServiceUrl: "https://safe-transaction-sepolia.safe.global",
      chainId: BigInt(11155111), // Sepolia chain ID as BigInt
    });
  }

  async createSafe(owners: string[], threshold: number) {
    if (!this.ethAdapter) throw new Error("Safe not initialized");

    const safeFactory = await (Safe as any).create({
      ethAdapter: this.ethAdapter,
    });

    const safeSdk = await safeFactory.deploySafe({
      safeAccountConfig: {
        owners,
        threshold,
      },
    });

    const safeAddress = await safeSdk.getAddress();
    return safeAddress;
  }

  async proposeTx(transaction: any) {
    if (!this.safeSDK) throw new Error("Safe not initialized");

    const safeTransaction = await this.safeSDK.createTransaction({
      transactions: [transaction],
    });

    const safeTxHash = await this.safeSDK.getTransactionHash(safeTransaction);
    const senderSignature = await this.safeSDK.signTransaction(safeTransaction);
    const senderAddress = await this.safeSDK.getAddress();

    await this.safeService?.proposeTransaction({
      safeAddress: await this.safeSDK.getAddress(),
      safeTransactionData: safeTransaction.data,
      safeTxHash,
      senderAddress,
      senderSignature: senderSignature.data,
    });

    return safeTxHash;
  }

  async executeTx(safeTxHash: string) {
    if (!this.safeSDK || !this.safeService)
      throw new Error("Safe not initialized");

    const tx = await this.safeService.getTransaction(safeTxHash);

    const safeTransaction = await this.safeSDK.createTransaction({
      transactions: [
        {
          to: tx.to,
          value: tx.value,
          data: tx.data || "0x",
          operation: tx.operation,
        },
      ],
    });

    const executeTxResponse = await this.safeSDK.executeTransaction(
      safeTransaction
    );
    return executeTxResponse;
  }
}
