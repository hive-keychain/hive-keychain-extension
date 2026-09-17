import '@testing-library/jest-dom';
import { Screen } from '@interfaces/screen.interface';
import { GuidedTourComponent } from '@popup/multichain/guided-tour/guided-tour.component';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import {
  GuidedTourId,
  GuidedTourStatus,
  GuidedTourTarget,
} from '@reference-data/guided-tour.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { initialStateForHome } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const mockTargetRect = {
  x: 16,
  y: 80,
  top: 80,
  left: 16,
  right: 216,
  bottom: 130,
  width: 200,
  height: 50,
  toJSON: () => ({}),
} as DOMRect;

const getTourState = () => ({
  ...initialStateForHome,
  navigation: {
    stack: [{ currentPage: Screen.HOME_PAGE }],
  },
  evm: {
    ...initialStateForHome.evm,
    accounts: [],
  },
});

const renderTour = (ui: React.ReactElement, state = getTourState()) =>
  customRender(ui, { initialState: state });

describe('GuidedTourComponent', () => {
  beforeEach(() => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.GUIDED_TOURS) {
          return undefined;
        }
        return undefined;
      });
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined as never);
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(mockTargetRect);
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('shows the first step when the user has no EVM accounts and the target is present', async () => {
    renderTour(
      <>
        <button
          data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER}
          style={{ borderRadius: '16px' }}>
          Accounts
        </button>
        <GuidedTourComponent />
      </>,
    );

    expect(await screen.findByTestId('guided-tour-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('guided-tour-overlay')).toHaveClass('theme');
    expect(screen.getByTestId('guided-tour-highlight')).toHaveStyle({
      borderRadius: '16px',
    });
    expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
      'New: EVM wallets',
    );
    expect(
      screen.queryByTestId('guided-tour-dismiss-button'),
    ).not.toBeInTheDocument();
  });

  it('does not show the tour when the user already has an EVM account', async () => {
    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER}>
          Accounts
        </button>
        <GuidedTourComponent />
      </>,
      {
        ...getTourState(),
        evm: {
          ...initialStateForHome.evm,
          accounts: [
            {
              id: 1,
              seedId: 1,
              path: "m/44'/60'/0'/0/0",
              source: EvmAccountSource.SEED,
              hide: false,
            } as any,
          ],
        },
      },
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByTestId('guided-tour-overlay')).not.toBeInTheDocument();
  });

  it('advances to the next step when the highlighted control is clicked', async () => {
    const user = userEvent.setup();
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER}>
          Accounts
        </button>
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_CREATE_BUTTON}>
          Add account
        </button>
        <GuidedTourComponent />
      </>,
    );

    expect(await screen.findByTestId('guided-tour-overlay')).toBeInTheDocument();

    await user.click(screen.getByText('Accounts'));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GUIDED_TOURS,
        expect.objectContaining({
          [GuidedTourId.ADD_EVM_ACCOUNT]: {
            status: GuidedTourStatus.IN_PROGRESS,
            currentStep: 1,
          },
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
        'Add an account',
      );
    });
  });

  it('highlights the last step when navigation mounted it before storage caught up', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.GUIDED_TOURS) {
          return {
            [GuidedTourId.ADD_EVM_ACCOUNT]: {
              status: GuidedTourStatus.IN_PROGRESS,
              currentStep: 1,
            },
          };
        }
        return undefined;
      });
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM}>
          EVM
        </button>
        <GuidedTourComponent />
      </>,
    );

    expect(await screen.findByTestId('guided-tour-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
      'Select EVM',
    );
    expect(screen.getByTestId('guided-tour-dismiss-button')).toBeInTheDocument();

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GUIDED_TOURS,
        expect.objectContaining({
          [GuidedTourId.ADD_EVM_ACCOUNT]: {
            status: GuidedTourStatus.IN_PROGRESS,
            currentStep: 2,
          },
        }),
      );
    });
  });

  it('shows dismiss only on the last step and stores dismissed progress', async () => {
    const user = userEvent.setup();
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.GUIDED_TOURS) {
          return {
            [GuidedTourId.ADD_EVM_ACCOUNT]: {
              status: GuidedTourStatus.IN_PROGRESS,
              currentStep: 2,
            },
          };
        }
        return undefined;
      });
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM}>
          EVM
        </button>
        <GuidedTourComponent />
      </>,
    );

    expect(await screen.findByTestId('guided-tour-dismiss-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('guided-tour-dismiss-button'));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GUIDED_TOURS,
        expect.objectContaining({
          [GuidedTourId.ADD_EVM_ACCOUNT]: {
            status: GuidedTourStatus.DISMISSED,
            currentStep: 2,
          },
        }),
      );
    });
  });

  it('marks the tour completed when the last highlighted control is clicked', async () => {
    const user = userEvent.setup();
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.GUIDED_TOURS) {
          return {
            [GuidedTourId.ADD_EVM_ACCOUNT]: {
              status: GuidedTourStatus.IN_PROGRESS,
              currentStep: 2,
            },
          };
        }
        return undefined;
      });
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM}>
          EVM
        </button>
        <GuidedTourComponent />
      </>,
    );

    expect(await screen.findByTestId('guided-tour-overlay')).toBeInTheDocument();

    await user.click(screen.getByText('EVM'));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GUIDED_TOURS,
        expect.objectContaining({
          [GuidedTourId.ADD_EVM_ACCOUNT]: {
            status: GuidedTourStatus.COMPLETED,
            currentStep: 2,
          },
        }),
      );
    });
  });

  it('hides the tour while another popup overlay is open', async () => {
    renderTour(
      <>
        <div className="popup-container">Blocking popup</div>
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER}>
          Accounts
        </button>
        <GuidedTourComponent />
      </>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByTestId('guided-tour-overlay')).not.toBeInTheDocument();
  });
});
