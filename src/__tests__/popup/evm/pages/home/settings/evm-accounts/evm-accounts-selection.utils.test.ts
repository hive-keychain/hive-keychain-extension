import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import {
  getEvmAccountsDefaultSeedOption,
  getRestoredEvmAccountsSeedId,
  MANAGE_EVM_SELECTED_SEED_ID_PARAM,
} from 'src/popup/evm/pages/home/settings/evm-accounts/evm-accounts-selection.utils';

const accounts = [
  {
    id: 0,
    seedId: 1,
    source: EvmAccountSource.SEED,
    seedNickname: 'Seed One',
    wallet: { address: '0x1' },
  },
  {
    id: 1,
    seedId: 2,
    source: EvmAccountSource.SEED,
    seedNickname: 'Seed Two',
    wallet: { address: '0x2' },
  },
] as any[];

const seedOptions = [
  { value: 1, label: 'Seed One' },
  { value: 2, label: 'Seed Two' },
];

describe('evm-accounts-selection.utils', () => {
  it('restores selection from manageEvmSelectedSeedId param', () => {
    expect(
      getRestoredEvmAccountsSeedId(
        { [MANAGE_EVM_SELECTED_SEED_ID_PARAM]: 2 },
        accounts,
      ),
    ).toBe(2);
  });

  it('restores selection from seedId param', () => {
    expect(getRestoredEvmAccountsSeedId({ seedId: 2 }, accounts)).toBe(2);
  });

  it('ignores unknown seed ids', () => {
    expect(
      getRestoredEvmAccountsSeedId(
        { [MANAGE_EVM_SELECTED_SEED_ID_PARAM]: 99 },
        accounts,
      ),
    ).toBeUndefined();
  });

  it('prefers navigation params over previous params', () => {
    expect(
      getEvmAccountsDefaultSeedOption(accounts, seedOptions, { seedId: 2 }, {
        seedId: 1,
      }),
    ).toEqual(seedOptions[1]);
  });

  it('uses previous params when navigation params are absent', () => {
    expect(
      getEvmAccountsDefaultSeedOption(accounts, seedOptions, undefined, {
        seedId: 2,
      }),
    ).toEqual(seedOptions[1]);
  });

  it('falls back to the first seed option when nothing is restored', () => {
    expect(getEvmAccountsDefaultSeedOption(accounts, seedOptions)).toEqual(
      seedOptions[0],
    );
  });
});
