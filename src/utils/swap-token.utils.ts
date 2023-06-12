import { KeychainSwapApi } from '@api/keychain-swap';
import { Asset, ExtendedAccount } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Swap, SwapConfig, SwapStep } from '@interfaces/swap-token.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import { BaseCurrencies } from 'src/utils/currency.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import TokensUtils from 'src/utils/tokens.utils';
import TransferUtils from 'src/utils/transfer.utils';

const getSwapTokenStartList = async (account: ExtendedAccount) => {
  let userTokenList: TokenBalance[] = await TokensUtils.getUserBalance(
    account.name,
  );
  userTokenList = userTokenList.filter(
    (token) => parseFloat(token.balance) > 0,
  );
  userTokenList = userTokenList.sort((a, b) =>
    b.symbol.toLowerCase() > a.symbol.toLowerCase() ? -1 : 1,
  );

  if (Asset.fromString(account.balance.toString()).amount > 0) {
    userTokenList.unshift({
      account: account.name,
      balance: Asset.fromString(account.balance.toString()).amount.toString(),
      symbol: BaseCurrencies.HIVE.toUpperCase(),
    } as TokenBalance);
  }
  if (Asset.fromString(account.hbd_balance.toString()).amount > 0) {
    userTokenList.unshift({
      account: account.name,
      balance: Asset.fromString(
        account.hbd_balance.toString(),
      ).amount.toString(),
      symbol: BaseCurrencies.HBD.toUpperCase(),
    } as TokenBalance);
  }

  return userTokenList;
};

const getSwapTokenEndList = () => {};

const getEstimate = async (
  startToken: string,
  endToken: string,
  amount: string,
) => {
  if (startToken && endToken && amount.length && parseFloat(amount) > 0) {
    const res = await KeychainSwapApi.get(
      `token-swap/estimate/${startToken}/${endToken}/${parseFloat(amount)}`,
    );

    if (res.error) {
      throw res.error;
    }

    return res.result;
  }
};

const saveEstimate = async (
  steps: SwapStep[],
  slipperage: number,
  startToken: string,
  endToken: string,
  amount: number,
  username: string,
): Promise<string> => {
  const response = await KeychainSwapApi.post(`token-swap/estimate/save`, {
    slipperage,
    steps,
    startToken,
    endToken,
    amount,
    username,
  });
  if (response.error) {
    throw response.error;
  } else {
    return response.result.estimateId;
  }
};

const processSwap = async (
  estimateId: string,
  startToken: string,
  amount: number,
  activeAccount: ActiveAccount,
) => {
  if (
    startToken === BaseCurrencies.HBD.toUpperCase() ||
    startToken === BaseCurrencies.HIVE.toUpperCase()
  ) {
    const status = await TransferUtils.sendTransfer(
      activeAccount.name!,
      Config.swaps.swapAccount,
      `${amount.toFixed(3)} ${startToken}`,
      estimateId,
      false,
      0,
      0,
      activeAccount.keys.active!,
    );
    return status?.tx_id;
  } else {
    const tokenInfo = await TokensUtils.getTokenInfo(startToken);
    const status = await TokensUtils.sendToken(
      startToken,
      Config.swaps.swapAccount,
      `${amount.toFixed(tokenInfo.precision)}`,
      estimateId,
      activeAccount.keys.active!,
      activeAccount.name!,
    );
    return status.tx_id;
  }
};

const retrieveSwapHistory = async (username: string): Promise<Swap[]> => {
  const res = await KeychainSwapApi.get(`token-swap/history/${username}`);
  if (res.error) {
    return [];
  }
  const swaps = [];
  for (const s of res.result) {
    const precisionStartToken = await TokensUtils.getTokenPrecision(
      s.startToken,
    );
    const precisionEndToken = await TokensUtils.getTokenPrecision(s.endToken);
    swaps.push({
      ...s,
      amount: Number(s.amount).toFixed(precisionStartToken),
      estimatedFinalAmount:
        s.steps.length !== 0
          ? Number(s.steps[s.steps.length - 1].estimate).toFixed(
              precisionEndToken,
            )
          : '...',
    });
  }
  return swaps;
};

const cancelSwap = async (swapId: string) => {
  await KeychainSwapApi.post(`token-swap/${swapId}/cancel`, {});
};

const getServerStatus = async () => {
  const res = await KeychainSwapApi.get(`server/status`);
  return res.result;
};

const getConfig = async (): Promise<SwapConfig> => {
  const res = await KeychainSwapApi.get(`token-swap/public-config`);
  console.log(res);
  return res.result;
};

const saveLastUsed = async (from: string, to: string) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SWAP_LAST_USED_TOKENS,
    { from, to },
  );
};
const getLastUsed = async () => {
  const lastUsed = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SWAP_LAST_USED_TOKENS,
  );
  if (!lastUsed) return { from: null, to: null };
  else return lastUsed;
};

export const SwapTokenUtils = {
  getSwapTokenStartList,
  getSwapTokenEndList,
  processSwap,
  getEstimate,
  saveEstimate,
  retrieveSwapHistory,
  cancelSwap,
  getServerStatus,
  getConfig,
  saveLastUsed,
  getLastUsed,
};
