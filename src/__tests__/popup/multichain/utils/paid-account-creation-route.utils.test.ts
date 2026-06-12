import { Screen } from '@interfaces/screen.interface';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { PaidAccountCreationRouteUtils } from '@popup/multichain/utils/paid-account-creation-route.utils';

jest.mock('@popup/multichain/utils/detached-extension-tab.utils', () => ({
  DetachedExtensionTabUtils: {
    openDetachedExtension: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('PaidAccountCreationRouteUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds and parses EVM payment status hashes', () => {
    const hash =
      PaidAccountCreationRouteUtils.buildPaymentStatusHash('request-1');

    expect(hash).toBe('#account-creation/evm-payment?requestId=request-1');
    expect(PaidAccountCreationRouteUtils.parseHash(hash)).toEqual({
      screen: Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
      params: {
        requestId: 'request-1',
      },
    });
  });

  it('ignores unrelated or incomplete hashes', () => {
    expect(
      PaidAccountCreationRouteUtils.parseHash('#evm/create'),
    ).toBeUndefined();
    expect(
      PaidAccountCreationRouteUtils.parseHash('#account-creation/evm-payment'),
    ).toBeUndefined();
  });

  it('opens the EVM payment status route outside the toolbar popup', async () => {
    await PaidAccountCreationRouteUtils.openPaymentStatusInSidePanel(
      'request-1',
    );

    expect(DetachedExtensionTabUtils.openDetachedExtension).toHaveBeenCalledWith(
      '#account-creation/evm-payment?requestId=request-1',
    );
  });

  it('clears the current hash without changing the path', () => {
    const replaceStateSpy = jest
      .spyOn(window.history, 'replaceState')
      .mockImplementation();

    PaidAccountCreationRouteUtils.clearHash();

    expect(replaceStateSpy).toHaveBeenCalledWith(
      null,
      document.title,
      window.location.pathname + window.location.search,
    );
  });
});
