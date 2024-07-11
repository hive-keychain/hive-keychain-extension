import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';

const filterSpamTokens = (tokens: EVMToken[]) => {
  return tokens.filter(
    (token) =>
      token.tokenInfo.type === EVMTokenType.NATIVE ||
      !token.tokenInfo.possibleSpam,
  );
};

export const EvmAccountUtils = { filterSpamTokens };
