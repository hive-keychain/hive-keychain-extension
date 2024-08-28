import BgdAccountsUtils from '@background/utils/accounts.utils';
import { LocalAccount } from '@interfaces/local-account.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { ObjectUtils } from 'src/utils/object.utils';

const start = async () => {
  Logger.info(
    `Will autostake tokens every ${Config.autoStakeTokens.FREQUENCY}m`,
  );
  chrome.alarms.create({ periodInMinutes: Config.autoStakeTokens.FREQUENCY });
  await alarmHandler();
};

const alarmHandler = async () => {
  const mk = await LocalStorageUtils.getValueFromSessionStorage(
    LocalStorageKeyEnum.__MK,
  );
  if (!mk) return;

  const localStorage = await LocalStorageUtils.getMultipleValueFromLocalStorage(
    [
      LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE,
      LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE_TOKENS,
    ],
  );
  const autoStakeUsernameList =
    localStorage[LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE];
  const autoStakeTokenList =
    localStorage[LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE_TOKENS];
  if (autoStakeUsernameList && autoStakeTokenList) {
    await initAutoStakeTokens(autoStakeUsernameList, autoStakeTokenList, mk);
  }
};

chrome.alarms.onAlarm.addListener(alarmHandler);

const initAutoStakeTokens = async (
  autoStakeUserList: { [x: string]: boolean },
  autoStakeTokenList: { [x: string]: { symbol: string }[] },
  mk: string,
) => {
  if (
    ObjectUtils.isPureObject(autoStakeUserList) &&
    ObjectUtils.isPureObject(autoStakeTokenList)
  ) {
    const users = Object.keys(autoStakeUserList).filter(
      (user) => autoStakeUserList[user] === true,
    );
    let tokens: any[] = [];
    Object.entries(autoStakeTokenList).map((value) => {
      if (value[1].length > 0) {
        tokens.push({
          user: value[0],
          tokenList: value[1].map((t) => t.symbol),
        });
      }
    });

    if (tokens.length > 0) {
      await iterateAutoStakeAccounts(users, tokens, mk);
    }
  } else {
    Logger.error(
      'startAutoStakeTokens: autoStakeUserList/autoStakeTokenList not defined',
    );
  }
};

const iterateAutoStakeAccounts = async (
  users: string[],
  tokens: {
    user: string;
    tokenList: string[];
  }[],
  mk: string,
) => {
  const localAccounts: LocalAccount[] = (
    await BgdAccountsUtils.getAccountsFromLocalStorage(mk)
  ).filter((l) => users.includes(l.name));
  //TODO line below when added makes work the getUserBalance, waiting for fix!
  AccountUtils;

  for (const acc of localAccounts) {
    let loggerMessage = null;
    if (!acc.keys.active) {
      loggerMessage = "Can't autostake token, active key is not in Keychain";
    } else if (KeysUtils.isUsingLedger(acc.keys.active)) {
      loggerMessage =
        "Can't autostake token because active key is saved in Ledger";
    }
    if (loggerMessage) {
      Logger.warn(`@${acc.name}` + loggerMessage);
      await AutomatedTasksUtils.saveUsernameAutoStake(acc.name, false);
      continue;
    }
    const userTokens = tokens.find((t) => t.user === acc.name);
    if (userTokens) {
      let tokensBalance: TokenBalance[] = (
        await TokensUtils.getUserBalance(acc.name)
      ).filter(
        (tb) =>
          userTokens.tokenList.includes(tb.symbol) &&
          parseFloat(tb.balance) > 0,
      );
      let tokenOperationResult: HiveEngineTransactionStatus;
      for (const token of tokensBalance) {
        tokenOperationResult = await TokensUtils.stakeToken(
          acc.name,
          token.symbol,
          token.balance,
          acc.keys.active!,
          acc.name!,
        );
        if (tokenOperationResult.tx_id) {
          Logger.info(
            `autostake module staked ${token.balance} ${token.symbol} using @${acc.name}`,
          );
        }
      }
    }
  }
};

const AutoStakeTokensModule = {
  start,
};

export default AutoStakeTokensModule;
