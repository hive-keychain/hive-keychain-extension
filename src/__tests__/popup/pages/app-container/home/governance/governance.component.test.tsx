import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelTab from 'src/__tests__/utils-for-testing/aria-labels/aria-label-tab';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';

describe('governance.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.HIVE),
      );
    });
  });

  it('Must load governance page & witness tab by default', async () => {
    expect(
      await screen.findByLabelText(`${Screen.GOVERNANCE_PAGE}-page`),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByLabelText(ariaLabelDiv.rankingItem),
    ).toHaveLength(witness.ranking.length);
  });

  it('Must load proxy tab', async () => {
    await act(async () => {
      await userEvent.click(screen.getAllByRole('tab')[1]);
    });
    expect(
      await screen.findByLabelText(ariaLabelTab.proxy),
    ).toBeInTheDocument();
  });

  it('Must load proposal tab', async () => {
    await act(async () => {
      await userEvent.click(screen.getAllByRole('tab')[2]);
    });
    expect(
      await screen.findByLabelText(ariaLabelTab.proposal),
    ).toBeInTheDocument();
  });
});
