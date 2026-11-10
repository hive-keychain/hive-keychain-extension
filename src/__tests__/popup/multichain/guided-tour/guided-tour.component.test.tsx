import '@testing-library/jest-dom';
import { Screen } from '@interfaces/screen.interface';
import { GuidedTourComponent } from '@popup/multichain/guided-tour/guided-tour.component';
import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
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
import { GuidedTourUtils } from 'src/utils/guided-tour.utils';
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

const visibleEvmAccount = {
  id: 1,
  seedId: 1,
  path: "m/44'/60'/0'/0/0",
  source: EvmAccountSource.SEED,
  hide: false,
} as any;

const getEvmSelectedTourState = () => ({
  ...getTourState(),
  activeAccountType: ChainType.EVM,
  evm: {
    ...initialStateForHome.evm,
    accounts: [visibleEvmAccount],
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
    GuidedTourUtils.consumeAddEvmChainsTourRequest();
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
      'Keychain is now multichain!',
    );
    expect(
      screen.queryByTestId('guided-tour-dismiss-button'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('guided-tour-next-button'),
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
          accounts: [visibleEvmAccount],
        },
      },
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByTestId('guided-tour-overlay')).not.toBeInTheDocument();
  });

  it('advances to the manage step when the highlighted account selector is clicked', async () => {
    const user = userEvent.setup();
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER}>
          Accounts
        </button>
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_MANAGE_BUTTON}>
          Manage
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
        'Manage accounts',
      );
    });
    expect(screen.getByTestId('guided-tour-next-button')).toBeInTheDocument();
    expect(screen.getByTestId('guided-tour-highlight')).toHaveClass('blocking');
  });

  it('advances from the manage step when Next is clicked', async () => {
    const user = userEvent.setup();
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
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_MANAGE_BUTTON}>
          Manage
        </button>
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_CREATE_BUTTON}>
          Add account
        </button>
        <GuidedTourComponent />
      </>,
    );

    expect(await screen.findByTestId('guided-tour-next-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('guided-tour-next-button'));

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

    await waitFor(() => {
      expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
        'Add accounts',
      );
    });
  });

  it('does not show the tour when the user has no Hive account', async () => {
    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER}>
          Accounts
        </button>
        <GuidedTourComponent />
      </>,
      {
        ...getTourState(),
        hive: {
          ...initialStateForHome.hive,
          accounts: [],
        },
      },
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByTestId('guided-tour-overlay')).not.toBeInTheDocument();
  });

  it('highlights the last step when navigation mounted it before storage caught up', async () => {
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
    expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
      'Add an EVM account',
    );
    expect(screen.getByTestId('guided-tour-dismiss-button')).toBeInTheDocument();

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GUIDED_TOURS,
        expect.objectContaining({
          [GuidedTourId.ADD_EVM_ACCOUNT]: {
            status: GuidedTourStatus.IN_PROGRESS,
            currentStep: 3,
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
              currentStep: 3,
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
            currentStep: 3,
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
              currentStep: 3,
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
            currentStep: 3,
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

  it('shows the chain tour when an EVM account is selected for the first time', async () => {
    await GuidedTourUtils.requestAddEvmChainsTour();

    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.CHAIN_DROPDOWN_TRIGGER}>
          Chains
        </button>
        <GuidedTourComponent />
      </>,
      getEvmSelectedTourState(),
    );

    expect(await screen.findByTestId('guided-tour-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
      'Congrats on adding your first EVM account',
    );
    expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
      'You can add chains here!',
    );
  });

  it('does not show the chain tour when an EVM account was imported', async () => {
    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.CHAIN_DROPDOWN_TRIGGER}>
          Chains
        </button>
        <GuidedTourComponent />
      </>,
      getEvmSelectedTourState(),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByTestId('guided-tour-overlay')).not.toBeInTheDocument();
  });

  it('does not show the chain tour when EVM accounts exist but a Hive account is selected', async () => {
    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.CHAIN_DROPDOWN_TRIGGER}>
          Chains
        </button>
        <GuidedTourComponent />
      </>,
      {
        ...getEvmSelectedTourState(),
        activeAccountType: ChainType.HIVE,
      },
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByTestId('guided-tour-overlay')).not.toBeInTheDocument();
  });

  it('moves the spotlight onto manage chains and ignores chain clicks', async () => {
    const user = userEvent.setup();
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');
    await GuidedTourUtils.requestAddEvmChainsTour();
    saveSpy.mockClear();
    const triggerRect = {
      x: 280,
      y: 8,
      top: 8,
      left: 280,
      right: 332,
      bottom: 40,
      width: 52,
      height: 32,
      toJSON: () => ({}),
    } as DOMRect;
    const manageChainsRect = {
      x: 148,
      y: 168,
      top: 168,
      left: 148,
      right: 332,
      bottom: 200,
      width: 184,
      height: 32,
      toJSON: () => ({}),
    } as DOMRect;

    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const tourTarget = this.closest('[data-guided-tour]')?.getAttribute(
          'data-guided-tour',
        );
        if (tourTarget === GuidedTourTarget.CHAIN_DROPDOWN_MANAGE_CHAINS) {
          return manageChainsRect;
        }
        if (tourTarget === GuidedTourTarget.CHAIN_DROPDOWN_TRIGGER) {
          return triggerRect;
        }
        return {
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 260,
          bottom: 72,
          width: 260,
          height: 72,
          toJSON: () => ({}),
        } as DOMRect;
      });

    renderTour(
      <>
        <button data-guided-tour={GuidedTourTarget.CHAIN_DROPDOWN_TRIGGER}>
          Chains
        </button>
        <GuidedTourComponent />
      </>,
      getEvmSelectedTourState(),
    );

    expect(await screen.findByTestId('guided-tour-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
      'You can add chains here!',
    );

    const panel = document.createElement('div');
    const chainButton = document.createElement('button');
    chainButton.textContent = 'Ethereum';
    const manageChains = document.createElement('button');
    manageChains.setAttribute(
      'data-guided-tour',
      GuidedTourTarget.CHAIN_DROPDOWN_MANAGE_CHAINS,
    );
    manageChains.textContent = 'Manage chains';
    panel.append(chainButton, manageChains);
    act(() => {
      document.body.append(panel);
    });

    await waitFor(() => {
      expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
        'Click on Manage chains to add more',
      );
    });
    expect(
      screen.queryByTestId('guided-tour-dismiss-button'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('guided-tour-highlight')).not.toHaveClass(
      'blocking',
    );
    expect(screen.getByTestId('guided-tour-highlight')).toHaveStyle({
      top: '168px',
      left: '148px',
      width: '184px',
      height: '32px',
    });

    const tooltipTop = Number.parseFloat(
      screen.getByTestId('guided-tour-tooltip').style.top,
    );
    expect(tooltipTop).toBeGreaterThanOrEqual(manageChainsRect.bottom);

    await user.click(screen.getByText('Ethereum'));
    expect(saveSpy).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.GUIDED_TOURS,
      expect.objectContaining({
        [GuidedTourId.ADD_EVM_CHAINS]: expect.objectContaining({
          currentStep: 2,
        }),
      }),
    );

    await user.click(screen.getByText('Manage chains'));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GUIDED_TOURS,
        expect.objectContaining({
          [GuidedTourId.ADD_EVM_CHAINS]: {
            status: GuidedTourStatus.IN_PROGRESS,
            currentStep: 2,
          },
        }),
      );
    });

    panel.remove();
  });

  it('shows the manage-chains page copy after the dropdown step', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key: LocalStorageKeyEnum) => {
        if (key === LocalStorageKeyEnum.GUIDED_TOURS) {
          return {
            [GuidedTourId.ADD_EVM_CHAINS]: {
              status: GuidedTourStatus.IN_PROGRESS,
              currentStep: 1,
            },
          };
        }
        return undefined;
      });

    renderTour(
      <>
        <div data-guided-tour={GuidedTourTarget.CHAIN_SELECTOR}>
          Select a chain
        </div>
        <GuidedTourComponent />
      </>,
      getEvmSelectedTourState(),
    );

    expect(await screen.findByTestId('guided-tour-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
      'Select a chain or add one manually',
    );
    expect(screen.getByTestId('guided-tour-tooltip')).toHaveTextContent(
      'Tokens and NFTs will be detected automatically on preset chains',
    );
    expect(screen.getByTestId('guided-tour-dismiss-button')).toBeInTheDocument();
  });
});
