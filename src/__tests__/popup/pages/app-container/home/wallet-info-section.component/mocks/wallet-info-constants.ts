import { Asset, ExtendedAccount } from '@hiveio/dhive';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';

const spanElementsHive = [
  alDropdown.span.send,
  alDropdown.span.buy,
  alDropdown.span.powerUp,
  alDropdown.span.convert,
  alDropdown.span.savings,
];

const pagesToAssertHive = [
  alComponent.transfersFundsPage,
  alComponent.buyCoinsPage,
  alComponent.powerUpDownPage,
  alComponent.conversionPage,
  alComponent.savingsPage,
];

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  extendedAccount: { ...accounts.extended } as ExtendedAccount,
  arraysInfo: {
    balanceRepeated: ['1,000.000', '+ 10,000.000', '(savings)'],
    repetitions: 2,
    balanceCurrencies: ['HIVE', 'HBD'],
    delegatios: ['5.459', '+ 10.863', 'HP', '(Deleg.)'],
    dropDownElements: [
      alDropdown.arrow.hbd,
      alDropdown.arrow.hive,
      alDropdown.arrow.hp,
    ],
    span: {
      hive: spanElementsHive,
      hbd: [
        ...spanElementsHive.filter((span) => span !== alDropdown.span.powerUp),
      ],
      hp: [alDropdown.span.delegations, alDropdown.span.powerDown],
    },
    pages: {
      tofindOn: {
        hive: pagesToAssertHive,
        hbd: [
          ...pagesToAssertHive.filter(
            (page) => page !== alComponent.powerUpDownPage,
          ),
        ],
        hp: [alComponent.delegationsPage, alComponent.powerUpDownPage],
      },
    },
  },
  zeroBalances: {
    delegated_vesting_shares: new Asset(0, 'VESTS'),
    received_vesting_shares: new Asset(0, 'VESTS'),
    balance: new Asset(0, 'HIVE'),
    savings_balance: new Asset(0, 'HBD'),
    hbd_balance: new Asset(0, 'HBD'),
    savings_hbd_balance: new Asset(0, 'HBD'),
    vesting_shares: new Asset(0, 'VESTS'),
  },
};

export default {
  constants,
};
