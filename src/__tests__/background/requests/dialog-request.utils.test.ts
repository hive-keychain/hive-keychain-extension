import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import {
  getCurrentDialogItem,
  getVisibleDialogRequests,
} from '@background/multichain/dialog-request.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

jest.mock('@popup/evm/utils/wallet.utils', () => ({
  EvmWalletUtils: {
    hasPermission: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/chain.utils', () => ({
  ChainUtils: {
    getAllSetupChainsForType: jest.fn(),
  },
}));

describe('dialog request utils', () => {
  const dappInfo = {
    domain: 'https://app.test',
    protocol: 'https:',
    logo: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [
      'eth_requestAccounts',
      {
        request_id: 1,
        method: EvmRequestMethod.REQUEST_ACCOUNTS,
        params: [],
      },
    ],
    [
      'wallet_requestPermissions',
      {
        request_id: 2,
        method: EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
        params: [{ [EvmRequestPermission.ETH_ACCOUNTS]: {} }],
      },
    ],
  ])(
    'keeps authorized %s requests visible in the connect-accounts confirmation flow',
    async (_label, request) => {
      (EvmWalletUtils.hasPermission as jest.Mock).mockResolvedValue(true);
      (ChainUtils.getAllSetupChainsForType as jest.Mock).mockResolvedValue([
        { chainId: '0x1' },
      ]);

      const handlers = {
        hiveRequestHandler: {
          requestsData: [],
        },
        evmRequestHandler: {
          requestsData: [
            {
              request_id: request.request_id,
              request,
              tab: 7,
              dappInfo,
              arrivalOrder: 1,
            },
          ],
          accounts: [{ wallet: { address: '0xaaa' } }],
        },
      } as any;

      const visibleRequests = await getVisibleDialogRequests(handlers);
      const currentDialogItem = await getCurrentDialogItem(handlers);

      expect(visibleRequests).toHaveLength(1);
      expect(currentDialogItem.message).toEqual(
        expect.objectContaining({
          command: DialogCommand.SEND_DIALOG_CONFIRM_EVM,
          request,
          dappInfo,
          tab: 7,
        }),
      );
    },
  );
});
