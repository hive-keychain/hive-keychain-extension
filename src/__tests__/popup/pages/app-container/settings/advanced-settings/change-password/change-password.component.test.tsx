import changePassword from 'src/__tests__/popup/pages/app-container/settings/advanced-settings/change-password/mocks/change-password';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
describe('change-password.component tests:\n', () => {
  let _asFragment: () => {};
  const { methods, constants, extraMocks } = changePassword;
  const { clickNType } = methods;
  const { message, input, mk } = constants;
  methods.afterEach;
  beforeEach(async () => {
    _asFragment = await changePassword.beforeEach();
  });
  it('Must show message and inputs', () => {
    expect(_asFragment()).toMatchSnapshot(constants.snapshotName.default);
  });
  describe('Click cases:\n', () => {
    it('Must show error when wrong old password after click', async () => {
      for (let i = 0; i < input.wrongPassword.length; i++) {
        await clickNType({ old: input.wrongPassword[i] }, true);
        await assertion.awaitFor(message.wrongPassword, QueryDOM.BYTEXT);
      }
    });
    it('Must show error when different new password confirmation after click', async () => {
      await clickNType(
        {
          old: mk,
          new: input.badConfirmation[0],
          confirmation: input.badConfirmation[1],
        },
        true,
      );
      await assertion.awaitFor(message.passwordMismatch, QueryDOM.BYTEXT);
    });
    it('Must show error when new password not valid after click', async () => {
      for (let i = 0; i < input.invalids.length; i++) {
        await clickNType(
          {
            old: mk,
            new: input.invalids[i],
            confirmation: input.invalids[i],
          },
          true,
        );
        await assertion.awaitFor(message.invalidPassword, QueryDOM.BYTEXT);
      }
    });
    it('Must set new password, show message and go home after click', async () => {
      extraMocks.saveAccounts();
      await clickNType(
        {
          old: mk,
          new: 'valid16CharactersPLUS',
          confirmation: 'valid16CharactersPLUS',
        },
        true,
      );
      await assertion.awaitFor(message.masterChanged, QueryDOM.BYTEXT);
      assertion.getByLabelText(alComponent.homePage);
    });
  });
  describe('Pressing Enter cases:\n', () => {
    it('Must show error when wrong old password after enter', async () => {
      for (let i = 0; i < input.wrongPassword.length; i++) {
        await clickNType({ old: input.wrongPassword[i] + `{enter}` });
        await assertion.awaitFor(message.wrongPassword, QueryDOM.BYTEXT);
      }
    });
    it('Must show error when different new password confirmation after enter', async () => {
      await clickNType({
        old: mk,
        new: input.badConfirmation[0],
        confirmation: input.badConfirmation[1] + '{enter}',
      });
      await assertion.awaitFor(message.passwordMismatch, QueryDOM.BYTEXT);
    });
    it('Must show error when new password not valid after enter', async () => {
      for (let i = 0; i < input.invalids.length; i++) {
        await clickNType({
          old: mk,
          new: input.invalids[i],
          confirmation: input.invalids[i] + '{enter}',
        });
        await assertion.awaitFor(message.invalidPassword, QueryDOM.BYTEXT);
      }
    });
    it('Must set new password, show message and go home after enter', async () => {
      extraMocks.saveAccounts();
      await clickNType({
        old: mk,
        new: 'valid16CharactersPLUS',
        confirmation: 'valid16CharactersPLUS' + '{enter}',
      });
      await assertion.awaitFor(message.masterChanged, QueryDOM.BYTEXT);
      assertion.getByLabelText(alComponent.homePage);
    });
  });
});
