import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Screen } from '@interfaces/screen.interface';
import {
  AccountCreationMode,
  AccountCreationUtils,
} from '@popup/hive/utils/account-creation.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import React from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateWAccountsWActiveAccountStore,
} from 'src/__tests__/utils-for-testing/initial-states';
import * as copyToastUtils from 'src/common-ui/toast/copy-toast.utils';
import { CreateAccountStepTwoComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-two/create-account-step-two.component';
import { PaidAccountCreationUtils } from 'src/popup/hive/utils/paid-account-creation.utils';

describe('CreateAccountStepTwoComponent', () => {
  const hiveChain = defaultChainList.find(
    (chain) => chain.type === ChainType.HIVE,
  )!;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest
      .spyOn(AccountCreationUtils, 'checkAccountNameAvailable')
      .mockResolvedValue(true);
    jest.spyOn(copyToastUtils, 'copyTextWithToast').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not render a payment currency selector for EVM paid creation', async () => {
    renderStepTwo();

    await waitFor(() => {
      expect(screen.getByText('Master password')).toBeInTheDocument();
    });
    expect(screen.queryByText('Payment currency')).not.toBeInTheDocument();
  });

  it('shows Next for EVM paid creation', async () => {
    renderStepTwo();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'Create' }),
    ).not.toBeInTheDocument();
  });

  it('shows Create for non-EVM account creation', async () => {
    renderStepTwo({
      mode: AccountCreationMode.DEFAULT,
      paymentSelection: undefined,
    });

    await waitFor(() => {
      expect(screen.getByText('Master password')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: 'Create' }),
    ).toBeInTheDocument();
  });

  it('passes the Step 1 EVM payment selection to paid account creation and opens the confirmation controller', async () => {
    const createSpy = jest
      .spyOn(PaidAccountCreationUtils, 'createPendingPaidHiveAccountCreation')
      .mockResolvedValue({ requestId: 'request-1' } as any);
    const { container, store } = renderStepTwo();

    await waitFor(() => {
      expect(screen.getByText('Master password')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    await waitFor(() => {
      expect(copyToastUtils.copyTextWithToast).toHaveBeenCalled();
    });
    container
      .querySelectorAll('.checkbox-panel')
      .forEach((checkbox) => fireEvent.click(checkbox));
    await waitFor(() => {
      expect(container.querySelectorAll('.checkbox-panel')).toHaveLength(3);
    });
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        'new-account',
        expect.any(Object),
        {
          paymentChainId: '40',
          paymentTokenAddress: null,
        },
        'test-master-key',
      );
    });
    expect(store.getState().navigation.stack[0]).toMatchObject({
      currentPage: Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
      params: {
        requestId: 'request-1',
        autoPayWithKeychain: true,
      },
    });
    expect(store.getState().loading.loadingOperations).toEqual([
      expect.objectContaining({
        name: 'html_popup_preparing_account_creation',
        done: false,
      }),
    ]);
  });

  const defaultNavParams = {
    mode: AccountCreationMode.PAID_BACKEND_CREATION,
    newUsername: 'new-account',
    paymentSelection: {
      paymentChainId: '40',
      paymentTokenAddress: null,
    },
  } as any;

  const renderStepTwo = (navParamsOverride = {} as any) => {
    const navParams = {
      ...defaultNavParams,
      ...navParamsOverride,
    };
    const store = getFakeStore({
      ...initialStateWAccountsWActiveAccountStore,
      chain: hiveChain,
      mk: 'test-master-key',
      navigation: {
        params: navParams,
        stack: [
          {
            currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_TWO,
            params: navParams,
          },
        ],
      },
      evm: initialEmptyStateStore.evm,
    } as any);
    return {
      store,
      ...render(
        <Provider store={store}>
          <CreateAccountStepTwoComponent />
        </Provider>,
      ),
    };
  };
});
