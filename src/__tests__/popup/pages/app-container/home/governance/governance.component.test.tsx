import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdTab from 'src/__tests__/utils-for-testing/data-testid/data-testid-tab';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('governance.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.HIVE),
      );
    });
  });

  it('Must load governance page & witness tab by default', async () => {
    expect(
      await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByTestId(dataTestIdDiv.rankingItem),
    ).toHaveLength(witness.ranking.length);
  });

  it('Must load proxy tab', async () => {
    await act(async () => {
      await userEvent.click(screen.getAllByRole('tab')[1]);
    });
    expect(await screen.findByTestId(dataTestIdTab.proxy)).toBeInTheDocument();
  });

  it('Must load proposal tab', async () => {
    await act(async () => {
      await userEvent.click(screen.getAllByRole('tab')[2]);
    });
    expect(
      await screen.findByTestId(dataTestIdTab.proposal),
    ).toBeInTheDocument();
  });
});
