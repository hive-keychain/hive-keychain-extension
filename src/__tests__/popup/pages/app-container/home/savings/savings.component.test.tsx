import App from '@popup/App';
import React from 'react';
import savings from 'src/__tests__/popup/pages/app-container/home/savings/mocks/savings';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('savings.component tests:\n', () => {
  const { methods, constants } = savings;
  methods.afterEach;
  describe('HIVE:\n', () => {
    const currency = 'HIVE';
    beforeEach(async () => {
      await savings.beforeEach(<App />, constants.toHiveSavings);
    });
    it('Must show saving and liquid balances', () => {
      assertion.getManyByText(constants.balances.HIVE);
    });
    describe('withdraw:\n', () => {
      beforeEach(async () => {
        await methods.clickToWithdraw();
      });
      it('Must show withdraw message', () => {
        assertion.getOneByText(constants.texts.withdraw);
      });
      it('Must set input to max', async () => {
        await clickAwait([alButton.setToMax]);
        assertion.toHaveValue(alInput.amount, 10000);
      });
      it('Must load HBD withdraw page when selected', async () => {
        await methods.dropOpAssert('hbd', constants.balances.HBD);
      });
      //TODO fix cases bellow!
      // commonCasesWithdraws.showConfirmation();
      // commonCasesWithdraws.notEnoughBalance();
      // commonCasesWithdraws.fail(currency);
      // commonCasesWithdraws.success(currency);
    });
    describe('deposit:\n', () => {
      beforeEach(async () => {
        await methods.clickToDeposit();
      });
      it('Must load HIVE deposit page when selected', async () => {
        await methods.dropOpAssert('hive', constants.balances.HIVE);
      });
      it('Must display deposit button', () => {
        assertion.toHaveTextContent([
          {
            arialabel: alButton.operation.savings.submit,
            text: constants.buttonDeposit(currency),
          },
        ]);
      });
      //TODO fix test cases bellow!
      // commonCasesDeposits.showConfirmation();
      // commonCasesDeposits.notEnoughBalance();
      // commonCasesDeposits.fail(currency);
      // commonCasesDeposits.success(currency);
    });
  });
  describe('HBD:\n', () => {
    const currency = 'HBD';
    beforeEach(async () => {
      await savings.beforeEach(<App />, constants.toHbdSavings);
    });
    it('Must load saving and liquid', () => {
      assertion.getManyByText(constants.balances.HBD);
    });
    describe('withdraw:\n', () => {
      beforeEach(async () => {
        await methods.clickToWithdraw();
      });
      it('Must show withdraw message', () => {
        assertion.getOneByText(constants.texts.withdraw);
      });
      //TODO fix cases bellow!
      // commonCasesWithdraws.showConfirmation();
      // commonCasesWithdraws.notEnoughBalance();
      // commonCasesWithdraws.fail(currency);
      // commonCasesWithdraws.success(currency);
    });
    describe('deposit:\n', () => {
      beforeEach(async () => {
        await methods.clickToDeposit();
      });
      it('Must show deposit message', () => {
        assertion.getOneByText(constants.texts.depositHBD);
      });
      //TODO fix cases bellow!
      // commonCasesDeposits.showConfirmation();
      // commonCasesDeposits.notEnoughBalance();
      // commonCasesDeposits.fail(currency);
      // commonCasesDeposits.success(currency);
    });
  });
  describe('Handling no active key\n:', () => {
    beforeEach(async () => {
      await savings.beforeEach(<App />, constants.toHiveSavings, true);
    });
    it('Must show error if no active password', async () => {
      await methods.typeNClick({ amount: '100' });
      await assertion.awaitFor(constants.missingKey, QueryDOM.BYTEXT);
    });
  });
});
