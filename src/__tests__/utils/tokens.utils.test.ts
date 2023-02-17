import { TokenMarket } from '@interfaces/tokens.interface';
import TokensUtils from 'src/utils/tokens.utils';
import tokenMarket from 'src/__tests__/utils-for-testing/data/tokens/token-market';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import config from 'src/__tests__/utils-for-testing/setups/config';
import tokensUtilsMocks from 'src/__tests__/utils/mocks/tokens.utils-mocks';
describe('tokens.utils tests:\n', () => {
  config.byDefault();
  const { constants, methods } = tokensUtilsMocks;
  methods.afterEach;
  describe('getHiveEngineTokenValue tests;\n', () => {
    it('Must return token engine value', () => {
      expect(
        TokensUtils.getHiveEngineTokenValue(
          tokensUser.balances[0],
          tokenMarket.all,
        ),
      ).toBe(6606.37);
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
          constants.swapHiveBalance,
          clonedTokenMarket.filter((tkn) => tkn.symbol !== 'SWAP.HIVE'),
        ),
      ).toBe(parseFloat(constants.swapHiveBalance.balance));
    });
  });
});
