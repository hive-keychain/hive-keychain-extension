import TokensUtils from '@hiveapp/utils/tokens.utils';
import { TokenMarket } from '@interfaces/tokens.interface';
import tokenMarket from 'src/__tests__/utils-for-testing/data/tokens/token-market';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';

describe('tokens.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
  });
  const swapHiveBalance = {
    _id: 13429,
    account: userData.one.username,
    symbol: 'SWAP.HIVE',
    balance: '38.861',
    stake: '1.060',
    pendingUnstake: '0',
    delegationsIn: '1',
    delegationsOut: '1',
    pendingUndelegations: '0',
  };
  describe('getHiveEngineTokenValue tests;\n', () => {
    it('Must return token engine value', () => {
      expect(
        TokensUtils.getHiveEngineTokenValue(
          tokensUser.balances[0],
          tokenMarket.all,
        ),
      ).toBe(6956.57);
    });

    it('Must return 0, if symbol not found on market', () => {
      const clonedTokenMarket = objects.clone(tokenMarket.all) as TokenMarket[];
      expect(
        TokensUtils.getHiveEngineTokenValue(
          tokensUser.balances[0],
          clonedTokenMarket.filter((tkn) => tkn.symbol !== 'LEO'),
        ),
      ).toBe(0);
    });

    it('Must return HE tkn value, if symbol is SWAP.HIVE', () => {
      const clonedTokenMarket = objects.clone(tokenMarket.all) as TokenMarket[];
      expect(
        TokensUtils.getHiveEngineTokenValue(
          swapHiveBalance,
          clonedTokenMarket.filter((tkn) => tkn.symbol !== 'SWAP.HIVE'),
        ),
      ).toBe(40.921);
    });
  });
});
