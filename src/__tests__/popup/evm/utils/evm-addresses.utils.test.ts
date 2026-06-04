import { FavoriteAddress } from '@interfaces/contacts.interface';
import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAddressesUtils, SavedEns } from '@popup/evm/utils/evm-addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { ethers } from 'ethers';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
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
    I18nUtils.getMessage = jest.fn((key: string) => key);
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

  it('treats local accounts as whitelisted on custom chains', async () => {
    const customChain = {
      ...chain,
      chainId: '0x539',
      isCustom: true,
    } as EvmChain;

    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue(customChain);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({
        [customChain.chainId]: {
          SMART_CONTRACT: [],
          WALLET_ADDRESS: [],
        },
      });
    jest
      .spyOn(EvmTokensUtils, 'getCustomTokensForAllWallets')
      .mockResolvedValue([]);

    await expect(
      EvmAddressesUtils.isWhitelisted(
        localAccountAddress,
        customChain.chainId,
        localAccounts,
      ),
    ).resolves.toBe(true);
    expect(EvmTokensUtils.getCustomTokensForAllWallets).not.toHaveBeenCalled();
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

  describe('getAddressDisplayForWarning', () => {
    const similarAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    it('uses whitelist nickname when available', async () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockImplementation(async (key: LocalStorageKeyEnum) => {
          if (key === LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES) {
            return {
              '1': {
                [EvmAddressType.SMART_CONTRACT]: [],
                [EvmAddressType.WALLET_ADDRESS]: [
                  { id: 'saved', address: similarAddress, label: 'My savings' },
                ],
              },
            };
          }
          return undefined;
        });

      await expect(
        EvmAddressesUtils.getAddressDisplayForWarning(similarAddress, '1', []),
      ).resolves.toBe('My savings');
    });

    it('uses wallet nickname from provided local accounts', async () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(undefined);

      await expect(
        EvmAddressesUtils.getAddressDisplayForWarning(
          activeWalletAddress,
          '1',
          localAccounts,
        ),
      ).resolves.toBe('Active wallet');
    });

    it('falls back to shortened address when no nickname exists', async () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(undefined);
      jest.spyOn(EvmWalletUtils, 'getAllLocalAccounts').mockResolvedValue([]);

      await expect(
        EvmAddressesUtils.getAddressDisplayForWarning(similarAddress, '1', []),
      ).resolves.toBe(EvmFormatUtils.formatAddress(similarAddress));
    });
  });

  describe('validateTransferRecipient', () => {
    const poisonedAddress = '0x0000000000000000000000000000000000001111';

    beforeEach(() => {
      jest.spyOn(ChainUtils, 'getChain').mockResolvedValue(chain);
    });

    const mockNoWhitelistedAddresses = () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(undefined);
      jest.spyOn(EvmWalletUtils, 'getAllLocalAccounts').mockResolvedValue([]);
    };

    it('rejects empty recipient', async () => {
      mockNoWhitelistedAddresses();

      await expect(
        EvmAddressesUtils.validateTransferRecipient('  ', '1', localAccounts),
      ).resolves.toEqual({
        valid: false,
        messageKey: 'evm_contact_address_invalid',
      });
    });

    it('rejects unresolved ENS', async () => {
      mockNoWhitelistedAddresses();
      jest.spyOn(EvmRequestsUtils, 'resolveEns').mockResolvedValue('');

      await expect(
        EvmAddressesUtils.validateTransferRecipient(
          'not-a-name.eth',
          '1',
          localAccounts,
        ),
      ).resolves.toEqual({
        valid: false,
        messageKey: 'evm_ens_recipient_not_existing',
      });
    });

    it('resolves ENS before validating', async () => {
      mockNoWhitelistedAddresses();
      jest
        .spyOn(EvmRequestsUtils, 'resolveEns')
        .mockResolvedValue(activeWalletAddress);

      await expect(
        EvmAddressesUtils.validateTransferRecipient(
          'trusted.eth',
          '1',
          localAccounts,
        ),
      ).resolves.toEqual({
        valid: true,
        address: activeWalletAddress,
      });
    });

    it('rejects address poisoning with nickname in error params', async () => {
      mockNoWhitelistedAddresses();

      const result = await EvmAddressesUtils.validateTransferRecipient(
        poisonedAddress,
        '1',
        localAccounts,
      );

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.messageKey).toBe(
          'evm_transaction_receiver_potential_spoofing_local_accounts',
        );
        expect(result.messageParams).toEqual(['Active wallet']);
      }
    });

    it('accepts a distinct valid recipient', async () => {
      mockNoWhitelistedAddresses();
      const safeRecipient = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      await expect(
        EvmAddressesUtils.validateTransferRecipient(
          safeRecipient,
          '1',
          [],
        ),
      ).resolves.toEqual({
        valid: true,
        address: ethers.getAddress(safeRecipient),
      });
    });
  });
});
