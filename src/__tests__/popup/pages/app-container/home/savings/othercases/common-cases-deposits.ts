import savings from 'src/__tests__/popup/pages/app-container/home/savings/mocks/savings';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';

const { methods, constants, extraMocks } = savings;
const success = (currency: string) => {
  it('Must show success message', async () => {
    extraMocks.deposit(true);
    await methods.typeNClick({ amount: '100', confirmButton: true });
    await assertion.awaitFor(
      constants.success.deposit(currency, '100'),
      QueryDOM.BYTEXT,
    );
  });
};
const fail = (currency: string) => {
  it('Must show error if operation fails', async () => {
    extraMocks.deposit(false);
    await methods.typeNClick({ amount: '100', confirmButton: true });
    await assertion.awaitFor(
      constants.failed.deposit(currency),
      QueryDOM.BYTEXT,
    );
  });
};
const notEnoughBalance = () => {
  it('Must show error if not enough balance', async () => {
    await methods.typeNClick({
      transferTo: constants.username,
      amount: '10000000',
    });
    await assertion.awaitFor(constants.greaterThan, QueryDOM.BYTEXT);
  });
};
const showConfirmation = () => {
  it('Must show confirmation page', async () => {
    await methods.typeNClick({
      transferTo: constants.username,
      amount: '100',
    });
    assertion.getByLabelText(alComponent.confirmationPage);
  });
};

export default {
  success,
  fail,
  notEnoughBalance,
  showConfirmation,
};
