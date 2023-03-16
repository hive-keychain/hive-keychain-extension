export interface ConfirmationResult {
  tx_id: string;
  id: string;
  status: string;
  block_num: number;
}

export interface HiveTxConfirmationResult {
  block_num: number;
  status: string;
  tx_id: string;
}

export interface HiveTxBroadcastSuccessResponse {
  id: number;
  jsonrpc: string;
  result: HiveTxConfirmationResult;
}

export interface HiveTxBroadcastErrorResponse {
  error: object;
}
