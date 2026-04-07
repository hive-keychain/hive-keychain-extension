import { waitFor } from '@testing-library/react';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  LoadingValuesConfiguration,
} from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import CurrencyPricesUtils from 'src/popup/hive/utils/currency-prices.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
};

describe('HiveApp startup', () => {
  beforeEach(() => {
    LoadingValuesConfiguration.set();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps the splashscreen visible and hides the startup shell', async () => {
    const pricesDeferred = createDeferred<Record<string, unknown>>();

    jest
      .spyOn(CurrencyPricesUtils, 'getPrices')
      .mockImplementation(() => pricesDeferred.promise);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(false);

    const { container, queryByTestId } = customRender(<HiveAppComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        mk: '',
        hasFinishedSignup: true,
      },
    });

    await waitFor(() => {
      expect(container.querySelector('.splashscreen')).not.toBeNull();
    });
    expect(container.querySelector('.loading-container')).toBeNull();
    expect(queryByTestId('sign-in-page')).toBeNull();

    pricesDeferred.resolve({});

    await waitFor(() => {
      expect(queryByTestId('sign-in-page')).not.toBeNull();
    });
  });
});
