import { RootState } from '@popup/store';
import { waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';

/**
 * Belongs to: E2E testing.
 * It will render the component using the configuration + initial state passed.
 */
const renderWithConfiguration = async (
  reactComponent: ReactElement,
  initialState: RootState,
) => {
  customRender(reactComponent, { initialState: initialState });
  await waitFor(() => {});
};

const reactTestingLibrary = { renderWithConfiguration };

export default reactTestingLibrary;
