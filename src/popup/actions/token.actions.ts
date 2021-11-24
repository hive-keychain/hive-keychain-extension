import { hiveEngineAPI, hsc } from '@api/hiveEngine';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload, AppThunk } from '@popup/actions/interfaces';
import {
  Token,
  TokenBalance,
  TokenMarket,
  TokenTransaction,
} from 'src/interfaces/tokens.interface';

export const loadTokens = (): AppThunk => async (dispatch) => {
  const action: ActionPayload<Token[]> = {
    type: ActionType.LOAD_TOKENS,
    payload: await hsc.find('tokens', 'tokens', {}, 1000, 0, []),
  };
  dispatch(action);
};

export const loadTokensMarket = (): AppThunk => async (dispatch) => {
  const action: ActionPayload<TokenMarket[]> = {
    type: ActionType.LOAD_TOKENS_MARKET,
    payload: await hsc.find('market', 'metrics', {}, 1000, 0, []),
  };
  dispatch(action);
};

export const loadUserTokens =
  (account: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch({
        type: ActionType.CLEAR_USER_TOKENS,
      });
      let tokensBalance: TokenBalance[] = await hsc.find('tokens', 'balances', {
        account,
      });
      tokensBalance = tokensBalance
        .filter((t) => parseFloat(t.balance) !== 0)
        .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
      const action: ActionPayload<TokenBalance[]> = {
        type: ActionType.LOAD_USER_TOKENS,
        payload: tokensBalance,
      };
      dispatch(action);
    } catch (e) {
      console.log(e);
    }
  };

export const loadTokenHistory =
  (account: string, currency: string): AppThunk =>
  async (dispatch) => {
    let tokenHistory: TokenTransaction[] = (
      await hiveEngineAPI.get('accountHistory', {
        params: { account, symbol: currency, type: 'user' },
      })
    ).data;
    tokenHistory = tokenHistory.map((e) => {
      e.amount = `${e.quantity} ${e.symbol}`;
      return e;
    });
    const action: ActionPayload<TokenTransaction[]> = {
      type: ActionType.LOAD_TOKEN_HISTORY,
      payload: tokenHistory,
    };
    dispatch(action);
  };
