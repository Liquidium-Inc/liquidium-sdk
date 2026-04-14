export const USDC_CONTRACT_ADDRESS =
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const USDT_CONTRACT_ADDRESS =
  "0xdac17f958d2ee523a2206206994597c13d831ec7";
export const CK_DEPOSIT_CONTRACT_ADDRESS =
  "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68";

export const MAX_UINT256 =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

export const ERC20_ABI = [
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
] as const;

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
