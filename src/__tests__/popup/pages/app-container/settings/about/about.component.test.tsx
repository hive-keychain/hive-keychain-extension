import App from '@popup/App';
import { screen } from '@testing-library/react';
import React from 'react';
import settings from 'src/__tests__/popup/pages/app-container/settings/mocks/settings';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
describe('about.component tests:\n', () => {
  settings.methods.afterEach;
  beforeEach(async () => {
    await settings.beforeEach(<App />);
  });
  it('Must show about message', () => {
    let cleaned = manipulateStrings.removeHtmlTags(
      settings.constants.messages.about,
    );
    expect(screen.getByLabelText(alDiv.about.content)).toHaveTextContent(
      cleaned,
    );
  });
});
