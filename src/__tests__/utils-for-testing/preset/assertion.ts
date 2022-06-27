import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
/**
 * Await for assertion, until loads username's on screen.
 */
const awaitMk = async (mk: string) => {
  expect(await screen.findByText(mk)).toBeInTheDocument();
};
/**
 * Await for assertion. using waitFor under the hood.
 * Can select bewteen getByLabelText or
 */
const awaitFor = async (ariaLabel: string, query: QueryDOM) => {
  await waitFor(() => {
    switch (query) {
      case QueryDOM.BYLABEL:
        expect(screen.getByLabelText(ariaLabel)).toBeInTheDocument();
        break;
      case QueryDOM.BYTEXT:
        expect(screen.getByText(ariaLabel)).toBeInTheDocument();
    }
  });
};

export default { awaitMk, awaitFor };
