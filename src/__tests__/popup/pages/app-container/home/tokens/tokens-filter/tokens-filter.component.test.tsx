import App from '@popup/App';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { screen } from '@testing-library/react';
import React from 'react';
import tokens from 'src/__tests__/popup/pages/app-container/home/tokens/mocks/tokens';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants } = tokens;
const { messages, data, typeValue } = constants;
const { tokensFilter } = data;
describe('tokens-filter.component tests:\n', () => {
  methods.afterEach;
  describe('No hidden tokens:\n', () => {
    beforeEach(async () => {
      await tokens.beforeEach(<App />);
    });
    it('Must show filter icon', () => {
      assertion.getByLabelText(alIcon.tokens.openFilter);
    });
    describe('Opening the filter:\n', () => {
      beforeEach(async () => await methods.clickOnFilter());
      it('Must load tokens filter and show disclaimer, tokens list', async () => {
        tokensFilter.list.asDisplayed.forEach((token) => {
          assertion.getManyByText([token.name, token.issuedBy, token.supply]);
        });
        expect(screen.queryByDisplayValue(messages.tokenFilter.disclaimer));
        assertion.getByLabelText(alComponent.tokensFilter);
      });
      it('Must set filter value', async () => {
        await clickTypeAwait([
          {
            ariaLabel: alInput.filterBox,
            event: EventType.TYPE,
            text: typeValue.tokenFilter.toFind,
          },
        ]);
        assertion.toHaveValue(alInput.filterBox, typeValue.tokenFilter.toFind);
      });
      it('Must show one token', async () => {
        await clickTypeAwait([
          {
            ariaLabel: alInput.filterBox,
            event: EventType.TYPE,
            text: typeValue.tokenFilter.toFind,
          },
        ]);
        await assertion.allToHaveLength(alDiv.token.list.item.description, 1);
      });
      it('Must show no token', async () => {
        await clickTypeAwait([
          {
            ariaLabel: alInput.filterBox,
            event: EventType.TYPE,
            text: typeValue.tokenFilter.nonExistent,
          },
        ]);
        assertion.queryByLabel(alDiv.token.list.item.description, false);
      });
      it('Must include token as hidden', async () => {
        await clickAwait([alCheckbox.tokensFilter.selectToken.preFix + 'BEE']);
        expect(methods.spyLocalStorage().mock.calls[1]).toEqual([
          LocalStorageKeyEnum.HIDDEN_TOKENS,
          ['BEE'],
        ]);
      });
    });
  });
  describe('Having hidden tokens:\n', () => {
    beforeEach(async () => {
      await tokens.beforeEach(<App />, { reImplementGetLS: true });
      await methods.clickOnFilter();
    });
    it.skip('Must show hidden tokens as unchecked', () => {
      //TODO finish this part.
      // it seems the reImplementations needs a second eye as it may need to use the tokenList instead of tokenUser.
      screen.debug();
      //   tokensList.alltokens
      //     .filter((token) => token.symbol !== 'PAL')
      //     .forEach((nonChecked) => {
      //       expect(
      //         screen.getByLabelText(alDiv.token.list.preFix + nonChecked.symbol),
      //       ).toHaveAttribute('aria-checked', true);
      //     });
    });
  });
});
