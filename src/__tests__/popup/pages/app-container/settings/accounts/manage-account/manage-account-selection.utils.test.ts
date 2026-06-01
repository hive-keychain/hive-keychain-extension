import { LocalAccount } from '@interfaces/local-account.interface';
import {
  getInitialManageAccountSelection,
  getRestoredManageAccountSelection,
  MANAGE_ACCOUNT_SELECTED_NAME_PARAM,
} from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/manage-account-selection.utils';

const localAccounts = [
  { name: 'alice', keys: {} },
  { name: 'bob', keys: {} },
] as LocalAccount[];

describe('manage-account-selection.utils', () => {
  it('restores selection from manageAccountSelectedName param', () => {
    expect(
      getRestoredManageAccountSelection(
        { [MANAGE_ACCOUNT_SELECTED_NAME_PARAM]: 'bob' },
        localAccounts,
      ),
    ).toBe('bob');
  });

  it('restores selection from add-key username param', () => {
    expect(
      getRestoredManageAccountSelection({ username: 'bob' }, localAccounts),
    ).toBe('bob');
  });

  it('ignores unknown account names', () => {
    expect(
      getRestoredManageAccountSelection(
        { [MANAGE_ACCOUNT_SELECTED_NAME_PARAM]: 'missing' },
        localAccounts,
      ),
    ).toBeUndefined();
  });

  it('prefers restored account over global active default', () => {
    expect(
      getInitialManageAccountSelection('alice', localAccounts, 'bob'),
    ).toBe('bob');
  });

  it('falls back to active account when nothing is restored', () => {
    expect(getInitialManageAccountSelection('alice', localAccounts)).toBe(
      'alice',
    );
  });
});
