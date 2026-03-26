import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('home.component dropdown hive tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
    );
  });

  it('Must expand the HIVE wallet row when clicking the dropdown arrow', async () => {
    const row = await screen.findByTestId(dataTestIdDropdown.arrow.hive);
    await act(async () => {
      await userEvent.click(row);
    });
    expect(row).toHaveClass('opened');
  });
});
