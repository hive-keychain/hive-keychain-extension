export interface HiveTxConfirmationResult {
  confirmed: boolean;
  tx_id: string;
  id: string;
  status: string;
}

export interface HiveTxBroadcastSuccessResponse {
  id: number;
  jsonrpc: string;
  result: HiveTxConfirmationResult;
}

export interface HiveTxBroadcastErrorResponse {
  error: object;
}
