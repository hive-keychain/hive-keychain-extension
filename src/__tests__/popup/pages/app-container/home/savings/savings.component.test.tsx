import App from '@popup/App';
import React from 'react';
import savings from 'src/__tests__/popup/pages/app-container/home/savings/mocks/savings';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
//TODO refactor and split in files if needed.
describe('savings.component tests:\n', () => {
  const { methods, constants, extraMocks } = savings;
  methods.afterEach;
  describe('HIVE:\n', () => {
    const currency = 'HIVE';
    beforeEach(async () => {
      await savings.beforeEach(<App />, {
        arrow: alDropdown.arrow.hive,
        dropMenu: alDropdown.span.savings,
      });
    });
    it('Must show saving and liquid balances', () => {
      assertion.getManyByText(constants.balances.HIVE);
    });
    describe('withdraw:\n', () => {
      it('Must show withdraw message', () => {
        assertion.getOneByText(constants.texts.withdraw);
      });
      it('Must show confirmation page', async () => {
        await methods.typeNClick(constants.transferTo.sameUser, '100');
        assertion.getByLabelText(alComponent.confirmationPage);
      });
      it('Must show error if not enough balance', async () => {
        await methods.typeNClick(constants.transferTo.sameUser, '1000000');
        await assertion.awaitFor(constants.greaterThan, QueryDOM.BYTEXT);
      });
      it('Must show error if operation fails', async () => {
        extraMocks.withdraw(false);
        await methods.typeNClick(constants.transferTo.sameUser, '100', true);
        await assertion.awaitFor(
          constants.failed.withdraw(currency),
          QueryDOM.BYTEXT,
        );
      });
      it('Must show success message', async () => {
        extraMocks.withdraw(true);
        await methods.typeNClick(constants.transferTo.sameUser, '100', true);
        await assertion.awaitFor(
          constants.success.withdraw(currency, '100'),
          QueryDOM.BYTEXT,
        );
      });
      it.todo('Must set input to max');
      it.todo('Must load HBD withdraw when click');
    });
    describe('deposit:\n', () => {
      it.todo('Must show deposit message');
      it.todo('Must show confirmation page');
      it.todo('Must show error if not enough balance');
      it.todo('Must show error if operation fails');
      it.todo('Must show success message');
      it.todo('Must set input to max');
      it.todo('Must load HBD withdraw when click');
    });
  });
  describe('HBD:\n', () => {
    it.todo('Must load saving and liquid');
    describe('withdraw:\n', () => {
      it.todo('Must show withdraw message');
      it.todo('Must show confirmation page');
      it.todo('Must show error if not enough balance');
      it.todo('Must show error if operation fails');
      it.todo('Must show success message');
      it.todo('Must set input to max');
      it.todo('Must load HBD withdraw when click');
    });
    describe('deposit:\n', () => {
      it.todo('Must show deposit message');
      it.todo('Must show confirmation page');
      it.todo('Must show error if not enough balance');
      it.todo('Must show error if operation fails');
      it.todo('Must show success message');
      it.todo('Must set input to max');
      it.todo('Must load HBD withdraw when click');
    });
  });
  describe('Handling no active key\n:', () => {
    beforeEach(async () => {
      await savings.beforeEach(
        <App />,
        {
          arrow: alDropdown.arrow.hive,
          dropMenu: alDropdown.span.savings,
        },
        true,
      );
    });
    it('Must show error if no active password', async () => {
      await methods.typeNClick(constants.transferTo.sameUser, '100');
      await assertion.awaitFor(constants.missingKey, QueryDOM.BYTEXT);
    });
  });
});
