import Safe, { SafeFactory } from "@safe-global/protocol-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { SafeAccountConfig } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import SafeApiKit from "@safe-global/api-kit";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";

export class SafeAdapter {
  private safeSDK: Safe | null = null;
  private safeService: SafeApiKit | null = null;
  private ethAdapter: EthersAdapter | null = null;

  async init(provider: any, safeAddress?: string) {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();

    this.ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    });

    if (safeAddress) {
      this.safeSDK = await Safe.create({
        ethAdapter: this.ethAdapter,
        safeAddress,
      });
    }

    this.safeService = new SafeApiKit({
      txServiceUrl: "https://safe-transaction-sepolia.safe.global",
      ethAdapter: this.ethAdapter,
    });
  }

  async createSafe(owners: string[], threshold: number) {
    if (!this.ethAdapter) throw new Error("Safe not initialized");

    const safeFactory = await SafeFactory.create({
      ethAdapter: this.ethAdapter,
    });

    const safeAccountConfig: SafeAccountConfig = {
      owners,
      threshold,
    };

    const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
    const safeAddress = await safeSdk.getAddress();

    return safeAddress;
  }

  async proposeTx(transaction: SafeTransactionDataPartial) {
    if (!this.safeSDK) throw new Error("Safe not initialized");

    const safeTransaction = await this.safeSDK.createTransaction({
      safeTransactionData: transaction,
    });
    const safeTxHash = await this.safeSDK.getTransactionHash(safeTransaction);
    const senderAddress = await this.safeSDK.getAddress();

    await this.safeService?.proposeTransaction({
      safeAddress: await this.safeSDK.getAddress(),
      safeTransactionData: safeTransaction.data,
      safeTxHash,
      senderAddress,
    });

    return safeTxHash;
  }

  async executeTx(safeTxHash: string) {
    if (!this.safeSDK || !this.safeService)
      throw new Error("Safe not initialized");

    const safeAddress = await this.safeSDK.getAddress();
    const tx = await this.safeService.getTransaction(safeTxHash);
    const executeTxResponse = await this.safeSDK.executeTransaction(
      tx.transactionData
    );

    return executeTxResponse;
  }
}
