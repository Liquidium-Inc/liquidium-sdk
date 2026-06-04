interface MessageAccount {
  type: "Native" | "External";
  data: string;
}

interface OutflowMessageRequest {
  pool_id: string;
  amount: string;
  account: MessageAccount;
  expiry_timestamp: bigint;
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
Expires: ${request.expiry_timestamp}
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
    case "Native":
      return `Principal:${accountType.data}`;
  }
}
