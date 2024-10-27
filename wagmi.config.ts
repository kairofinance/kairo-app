import { createPublicClient, http, Block } from "viem";
import { sepolia } from "viem/chains";

export const client = createPublicClient({
  chain: sepolia,
  transport: http(
    "https://eth-sepolia.g.alchemy.com/v2/iKBU358ywWKBZ-ewP2HPwWCAdSLb-y0J"
  ),
});
