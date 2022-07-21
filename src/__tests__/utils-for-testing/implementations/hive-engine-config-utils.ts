import tokenMarket from 'src/__tests__/utils-for-testing/data/tokens/token-market';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import { FindSmartContractsHive } from 'src/__tests__/utils-for-testing/interfaces/implementations';
//TODO remove + delete this
const GetApiFind = (args: any[], tokensData?: FindSmartContractsHive) => {
  const contract: string = args[0];
  const table: string = args[1];
  const query:
    | {
        to?: string;
        from?: string;
        account?: string;
      }
    | undefined = args[2];
  const error = 'Please check/add, as condition not found!';
  console.log('Being called with: ', {
    contract,
    table,
    query,
    tokensData,
  });
  switch (contract) {
    case 'tokens':
      switch (table) {
        case 'tokens':
          return tokensData?.getAllTokens ?? tokensList.alltokens;
        case 'balances':
          return tokensData?.getUserBalance ?? tokensUser.balances;
        case 'delegations':
          if (query?.to) {
            return (
              tokensData?.getIncomingDelegations ??
              tokensUser.incomingDelegations
            );
          } else if (query?.from) {
            return (
              tokensData?.getOutgoingDelegations ??
              tokensUser.outcomingDelegations
            );
          }
        default:
          return error;
      }
    case 'market':
      switch (table) {
        case 'metrics':
          return tokensData?.getTokensMarket ?? tokenMarket.all;
      }
    default:
      return error;
  }
};

export default { GetApiFind };
