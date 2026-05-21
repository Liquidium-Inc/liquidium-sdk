import { getAddress, isAddress } from "viem";

/** Ethereum mainnet USDC contract address. */
export const USDC_CONTRACT_ADDRESS =
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
/** Ethereum mainnet USDT contract address. */
export const USDT_CONTRACT_ADDRESS =
  "0xdac17f958d2ee523a2206206994597c13d831ec7";
/** Ethereum mainnet ckETH minter ERC-20 deposit helper contract address. */
export const CK_ETH_DEPOSIT_CONTRACT_ADDRESS =
  "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68";

/** Largest uint256 value, used for max-allowance ERC-20 approvals. */
export const MAX_UINT256 =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

/** Minimal ERC-20 ABI used by the SDK for balance, allowance, approval, and transfers. */
export const ERC20_ABI = [
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "remaining", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/** ckETH minter deposit helper ABI used for ERC-20 deposits into ICRC accounts. */
export const CK_DEPOSIT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "erc20Address", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes32", name: "principal", type: "bytes32" },
      { internalType: "bytes32", name: "subaccount", type: "bytes32" },
    ],
    name: "depositErc20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/** Returns an EIP-55 checksum address when `address` is valid EVM input. */
export function normalizeEvmAddress(address: string): string {
  if (!isAddress(address)) {
    return address;
  }

  return getAddress(address);
}
