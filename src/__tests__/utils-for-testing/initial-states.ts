import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
export const initialEmptyStateStore = {} as RootState;

export const initialStateWAccountsWActiveAccountStore = {
  accounts: [
    {
      name: utilsT.userData.username,
      keys: utilsT.keysUserData1,
    },
    utilsT.secondAccountOnState,
  ],
  activeAccount: {
    name: utilsT.userData.username,
    account: {
      name: utilsT.userData.username,
    },
    keys: utilsT.keysUserData1,
    rc: {},
  },
} as RootState;

export const initialStateWOneKey = {
  accounts: [utilsT.secondAccountOnState],
  activeAccount: {
    name: utilsT.secondAccountOnState.name,
    account: {
      name: utilsT.secondAccountOnState.name,
    },
    keys: utilsT.secondAccountOnState.keys,
    rc: {},
  },
} as RootState;

export const initialStateDifferentAccounts = {
  accounts: [
    {
      name: utilsT.userData.username,
      keys: utilsT.keysUserData1,
    },
  ],
  activeAccount: {
    name: utilsT.secondAccountOnState.name,
    account: {
      name: utilsT.secondAccountOnState.name,
    },
    keys: utilsT.secondAccountOnState.keys,
    rc: {},
  },
} as RootState;

export const ghostState = {
  accounts: [{ name: 'theghost1980', keys: { posting: 'noKEY' } }],
  activeAccount: {
    name: 'theghost1980',
    account: {
      name: 'theghost1980',
    },
    keys: {},
    rc: {},
  },
} as RootState;
