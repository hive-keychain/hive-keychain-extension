export interface HiveTxBroadcastSuccessResponse {
  id: number;
  jsonrpc: string;
  result: { tx_id: string; status: string };
}

export interface HiveTxBroadcastErrorResponse {
  error: object;
}
