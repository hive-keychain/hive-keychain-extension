import transferFund from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/transfer-fund';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
const { methods } = transferFund;
const run = (currency: string) => {
  assertion.getByLabelText(alComponent.transfersFundsPage);
  assertion.getManyByText(methods.selectBalance(currency));
};

export default { run };
