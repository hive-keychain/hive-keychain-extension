import { screen } from '@testing-library/react';
import automatedTasks from 'src/__tests__/popup/pages/app-container/settings/user-preferences/automated-tasks/mocks/automated-tasks';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
describe('automated-tasks.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods } = automatedTasks;
  methods.afterEach;
  describe('Stored data:\n', () => {
    describe('Max mana greater than freeAccount credits:\n', () => {
      it.todo('Must load component and match snapshot');
    });
    describe('Max mana lower:\n', () => {
      beforeEach(async () => {
        _asFragment = await automatedTasks.beforeEach({
          passData: true,
          maxManaGreater: true,
        });
      });
      it('Must load component and match snapshot', () => {
        screen.debug();
      });
    });
  });
  describe('No data', () => {
    it.todo('Must load component and match snapshot');
  });
});
