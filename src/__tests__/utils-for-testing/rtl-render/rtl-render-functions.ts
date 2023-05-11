import { RootState } from '@popup/store';
import { waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import loadingValuesConfiguration, {
  TestsAppLoadingValues,
  TestsConfigureModules,
} from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';

/**
 * Belongs to: E2E testing.
 * It will render the component using:
 * initialState: initial Redux state wanted for the app.
 * Params:
 *  1. modules: Configure/add/update modules needed before loading.
 *  2. app: All values needed when loading the app that will affect the state & app behaviour.
 * @see Important: ->> If no params, the function will load default values on app state.
 */
const renderWithConfiguration = async (
  reactComponent: ReactElement,
  initialState: RootState,
  params?: {
    modules?: TestsConfigureModules;
    app?: TestsAppLoadingValues;
  },
) => {
  loadingValuesConfiguration.set(params);
  customRender(reactComponent, { initialState: initialState });
  //Necessary line bellow. It will wait for promises/timers to execute and render after all async processes.
  await waitFor(() => {});
};

const reactTestingLibrary = { renderWithConfiguration };

export default reactTestingLibrary;
