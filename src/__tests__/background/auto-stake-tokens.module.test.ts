import MkModule from '@background/mk.module';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import AutoStakeTokensModule, {
  alarmHandler,
  initAutoStakeTokens,
} from '@background/auto-stake-tokens.module';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import Config from 'src/config';

jest.mock('@popup/hive/utils/tokens.utils', () => ({
  __esModule: true,
  default: {
    getUserBalance: jest.fn(),
    stakeToken: jest.fn(),
  },
}));

describe('auto-stake-tokens.module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('creates periodic alarm and runs alarm handler once', async () => {
      jest.spyOn(MkModule, 'getMk').mockResolvedValue(null);
      const create = jest.spyOn(chrome.alarms, 'create').mockReturnValue(undefined);
      const info = jest.spyOn(Logger, 'info').mockImplementation(() => {});

      await AutoStakeTokensModule.start();

      expect(info).toHaveBeenCalledWith(
        `Will autostake tokens every ${Config.autoStakeTokens.FREQUENCY}m`,
      );
      expect(create).toHaveBeenCalledWith({
        periodInMinutes: Config.autoStakeTokens.FREQUENCY,
      });
    });
  });

  describe('alarmHandler', () => {
    it('returns early when mk is missing', async () => {
      jest.spyOn(MkModule, 'getMk').mockResolvedValue(null);
      const getMulti = jest.spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage');

      await alarmHandler();

      expect(getMulti).not.toHaveBeenCalled();
    });

    it('loads config and runs init when both lists are present', async () => {
      jest.spyOn(MkModule, 'getMk').mockResolvedValue('mk');
      jest.spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage').mockResolvedValue({
        [LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE]: { alice: true },
        [LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE_TOKENS]: {
          alice: [{ symbol: 'ONE' }],
        },
      } as any);
      jest.spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage').mockResolvedValue([
        { name: 'alice', keys: { active: 'k' } },
      ] as any);
      jest.spyOn(KeysUtils, 'isUsingLedger').mockReturnValue(false);
      (TokensUtils.getUserBalance as jest.Mock).mockResolvedValue([
        { symbol: 'ONE', balance: '10' },
      ]);
      (TokensUtils.stakeToken as jest.Mock).mockResolvedValue({ tx_id: 'abc' });

      await alarmHandler();

      expect(TokensUtils.stakeToken).toHaveBeenCalledWith(
        'alice',
        'ONE',
        '10',
        'k',
        'alice',
      );
    });
  });

  describe('initAutoStakeTokens', () => {
    it('logs when storage payloads are not plain objects', async () => {
      const err = jest.spyOn(Logger, 'error').mockImplementation(() => {});

      await initAutoStakeTokens([] as any, {}, 'mk');

      expect(err).toHaveBeenCalledWith(
        'startAutoStakeTokens: autoStakeUserList/autoStakeTokenList not defined',
      );
    });

    it('stakes matching token balances when active key is present', async () => {
      jest.spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage').mockResolvedValue([
        { name: 'alice', keys: { active: 'activekey' } },
      ] as any);
      jest.spyOn(KeysUtils, 'isUsingLedger').mockReturnValue(false);
      (TokensUtils.getUserBalance as jest.Mock).mockResolvedValue([
        { symbol: 'TKN', balance: '5' },
      ]);
      (TokensUtils.stakeToken as jest.Mock).mockResolvedValue({ tx_id: 'x' });
      const info = jest.spyOn(Logger, 'info').mockImplementation(() => {});

      await initAutoStakeTokens(
        { alice: true },
        { alice: [{ symbol: 'TKN' }] },
        'mk',
      );

      expect(TokensUtils.stakeToken).toHaveBeenCalledWith(
        'alice',
        'TKN',
        '5',
        'activekey',
        'alice',
      );
      expect(info).toHaveBeenCalled();
    });

    it('disables auto-stake for account when active key is missing', async () => {
      jest.spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage').mockResolvedValue([
        { name: 'bob', keys: {} },
      ] as any);
      const saveOff = jest
        .spyOn(AutomatedTasksUtils, 'saveUsernameAutoStake')
        .mockResolvedValue(undefined);
      const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      await initAutoStakeTokens({ bob: true }, { bob: [{ symbol: 'TKN' }] }, 'mk');

      expect(warn).toHaveBeenCalled();
      expect(saveOff).toHaveBeenCalledWith('bob', false);
      expect(TokensUtils.stakeToken).not.toHaveBeenCalled();
    });

    it('disables auto-stake when active key is on Ledger', async () => {
      jest.spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage').mockResolvedValue([
        { name: 'carol', keys: { active: 'ledger' } },
      ] as any);
      jest.spyOn(KeysUtils, 'isUsingLedger').mockReturnValue(true);
      const saveOff = jest
        .spyOn(AutomatedTasksUtils, 'saveUsernameAutoStake')
        .mockResolvedValue(undefined);

      await initAutoStakeTokens({ carol: true }, { carol: [{ symbol: 'TKN' }] }, 'mk');

      expect(saveOff).toHaveBeenCalledWith('carol', false);
    });

    it('does not stake when no user has tokens configured', async () => {
      jest.spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage').mockResolvedValue([
        { name: 'alice', keys: { active: 'k' } },
      ] as any);
      jest.spyOn(KeysUtils, 'isUsingLedger').mockReturnValue(false);

      await initAutoStakeTokens({ alice: true }, { alice: [] }, 'mk');

      expect(TokensUtils.getUserBalance).not.toHaveBeenCalled();
      expect(TokensUtils.stakeToken).not.toHaveBeenCalled();
    });
  });
});
