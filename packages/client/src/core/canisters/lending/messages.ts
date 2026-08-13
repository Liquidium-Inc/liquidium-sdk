export interface MessageAccount {
  type: "AccountIdentifier" | "External" | "Icrc" | "Native";
  data: string;
}

interface OutflowMessageRequest {
  pool_id: string;
  amount: string;
  account: MessageAccount;
  expiry_timestamp: bigint;
  origin?: string;
}

export function createBorrowAssetMessage(
  request: OutflowMessageRequest,
  nonce: bigint
): string {
  return `Liquidium: Borrow Assets

Action: Borrow from pool
Pool ID: ${request.pool_id}
Amount: ${request.amount}
${accountTypeToString(request.account)}
${request.origin ? `Origin: ${request.origin}\n` : ""}Expires: ${request.expiry_timestamp}
Nonce: ${nonce}`;
}

export function createWithdrawAssetMessage(
  request: OutflowMessageRequest,
  nonce: bigint
): string {
  return `Liquidium: Withdraw Assets

Action: Withdraw from pool
Pool ID: ${request.pool_id}
Amount: ${request.amount}
${accountTypeToString(request.account)}
Expires: ${request.expiry_timestamp}
Nonce: ${nonce}`;
}

function accountTypeToString(accountType: MessageAccount): string {
  switch (accountType.type) {
    case "External":
      return `Address:${accountType.data}`;
    case "Icrc":
      return `Icrc:${accountType.data}`;
    case "AccountIdentifier":
      return `AccountId:${accountType.data}`;
    case "Native":
      return `Principal:${accountType.data}`;
  }
}
