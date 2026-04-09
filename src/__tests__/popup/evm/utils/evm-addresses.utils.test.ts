import { FavoriteAddress } from '@interfaces/contacts.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAddressesUtils, SavedEns } from '@popup/evm/utils/evm-addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('evm-addresses.utils tests:\n', () => {
  const chain = {
    chainId: '0x1',
    name: 'Ethereum',
    type: ChainType.EVM,
    logo: '',
    rpcs: [{ url: 'https://rpc.example', isDefault: true }],
    mainToken: 'ETH',
    defaultTransactionType: EvmTransactionType.EIP_1559,
  } as EvmChain;

  const activeWalletAddress = '0x1111111111111111111111111111111111111111';
  const localAccountAddress = '0x2222222222222222222222222222222222222222';
  const contactAddress = '0x3333333333333333333333333333333333333333';

  const localAccounts = [
    {
      id: 0,
      seedId: 1,
      path: "m/44'/60'/0'/0/0",
      seedNickname: 'Primary seed',
      nickname: 'Active wallet',
      wallet: { address: activeWalletAddress },
    },
    {
      id: 1,
      seedId: 1,
      path: "m/44'/60'/0'/0/1",
      seedNickname: 'Primary seed',
      nickname: 'Spare wallet',
      wallet: { address: localAccountAddress },
    },
  ] as any;

  const savedWalletAddresses: FavoriteAddress[] = [
    {
      id: 'local-duplicate',
      address: localAccountAddress,
      label: 'Duplicated local account',
    },
    {
      id: 'contact-address',
      address: contactAddress,
    },
  ];

  const cachedEns: SavedEns[] = [
    {
      address: contactAddress,
      ens: 'contact.eth',
      avatar: 'https://example.com/contact.png',
      expirationDate: Date.now() + 60_000,
    },
  ];

  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('builds whitelist autocomplete from local data without live ENS lookups', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key: LocalStorageKeyEnum) => {
        switch (key) {
          case LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES:
            return {
              [chain.chainId]: {
                SMART_CONTRACT: [],
                WALLET_ADDRESS: savedWalletAddresses,
              },
            };
          case LocalStorageKeyEnum.EVM_ENS:
            return cachedEns;
          default:
            return undefined;
        }
      });

    const getAllLocalAccountsSpy = jest.spyOn(
      EvmWalletUtils,
      'getAllLocalAccounts',
    );
    const getEnsForAddressSpy = jest.spyOn(EvmRequestsUtils, 'getEnsForAddress');
    const getDataForEnsSpy = jest.spyOn(EvmRequestsUtils, 'getDataForEns');

    const autocomplete = await EvmAddressesUtils.getWhiteListAutocomplete(
      chain,
      localAccounts,
      activeWalletAddress,
    );

    const walletValues =
      autocomplete.categories.find((category) => category.title === 'evm_wallets')
        ?.values ?? [];
    const localAccountValues =
      autocomplete.categories.find(
        (category) => category.title === 'local_accounts',
      )?.values ?? [];

    expect(walletValues).toHaveLength(1);
    expect(walletValues[0]).toMatchObject({
      value: contactAddress,
      label: 'contact.eth',
      subLabel: EvmFormatUtils.formatAddress(contactAddress),
      img: 'https://example.com/contact.png',
    });

    expect(localAccountValues).toHaveLength(1);
    expect(localAccountValues[0]).toMatchObject({
      value: localAccountAddress,
      label: 'Spare wallet',
      subLabel: EvmFormatUtils.formatAddress(localAccountAddress),
    });

    expect(
      [...walletValues, ...localAccountValues].some(
        (item) => item.value === activeWalletAddress,
      ),
    ).toBe(false);
    expect(getAllLocalAccountsSpy).not.toHaveBeenCalled();
    expect(getEnsForAddressSpy).not.toHaveBeenCalled();
    expect(getDataForEnsSpy).not.toHaveBeenCalled();
  });

  it('enriches wallet autocomplete entries with ENS data and persists the cache', async () => {
    const autocomplete = {
      categories: [
        {
          title: 'evm_wallets',
          translateTitle: true,
          values: [
            {
              value: contactAddress,
              label: EvmFormatUtils.formatAddress(contactAddress),
              subLabel: '',
              img: 'identicon://contact',
            },
          ],
        },
      ],
    };

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue();
    jest
      .spyOn(EvmRequestsUtils, 'getEnsForAddress')
      .mockResolvedValue('contact.eth');
    jest.spyOn(EvmRequestsUtils, 'getDataForEns').mockResolvedValue({
      address: contactAddress,
      avatar: 'https://example.com/contact.png',
    });

    const enriched = await EvmAddressesUtils.enrichWhiteListAutocomplete(
      autocomplete,
    );

    expect(enriched.categories[0].values[0]).toMatchObject({
      value: contactAddress,
      label: 'contact.eth',
      subLabel: EvmFormatUtils.formatAddress(contactAddress),
      img: 'https://example.com/contact.png',
    });
    expect(saveSpy).toHaveBeenCalledWith(LocalStorageKeyEnum.EVM_ENS, [
      expect.objectContaining({
        address: contactAddress,
        ens: 'contact.eth',
        avatar: 'https://example.com/contact.png',
      }),
    ]);
  });

  it('keeps the base autocomplete when ENS enrichment fails', async () => {
    const autocomplete = {
      categories: [
        {
          title: 'evm_wallets',
          translateTitle: true,
          values: [
            {
              value: contactAddress,
              label: EvmFormatUtils.formatAddress(contactAddress),
              subLabel: '',
              img: 'identicon://contact',
            },
          ],
        },
      ],
    };

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);
    jest
      .spyOn(EvmRequestsUtils, 'getEnsForAddress')
      .mockRejectedValue(new Error('ENS is unavailable'));

    await expect(
      EvmAddressesUtils.enrichWhiteListAutocomplete(autocomplete),
    ).resolves.toEqual(autocomplete);
  });
});
