import addByKeysMocks from 'src/__tests__/popup/pages/add-account/add-by-keys/mocks/add-by-keys-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';

const wAccounts = () => {
  const errorMessage = mocksImplementation.i18nGetMessageCustom(
    'popup_html_account_already_existing',
  );
  it('Must show error if adding existing key', async () => {
    await clickAwait([
      alButton.menu,
      alButton.menuSettingsPeople,
      alButton.menuSettingsPersonAdd,
    ]);
    await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.active);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
};

export default { wAccounts };
