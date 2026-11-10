type TokenRequestParamsContrat = 'tokens' | 'market';
type TokenRequestParamsTable =
  | 'tokens'
  | 'metrics'
  | 'balances'
  | 'delegations'
  | 'pendingUnstakes'
  | 'tradesHistory';

export interface TokenRequestParams {
  contract: TokenRequestParamsContrat;
  indexes: any[];
  limit: number;
  offset: number;
  query: any;
  table: TokenRequestParamsTable;
}
