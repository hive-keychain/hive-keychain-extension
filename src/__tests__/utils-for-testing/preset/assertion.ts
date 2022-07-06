import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import { ElementQuery } from 'src/__tests__/utils-for-testing/interfaces/elements';
/**
 * Await for assertion, until loads username's on screen.
 * using findBytext.
 */
const awaitMk = async (mk: string) => {
  expect(await screen.findByText(mk)).toBeInTheDocument();
};
/**
 * Await for assertion. findByLabelText
 */
const awaitFind = async (arialabel: string) => {
  expect(await screen.findByLabelText(arialabel)).toBeInTheDocument();
};
/**
 * Await for assertion. findByText
 */
const awaitFindText = async (arialabel: string) => {
  expect(await screen.findByText(arialabel)).toBeInTheDocument();
};
/**
 * findByText
 */
const getByLabelText = (ariaLabel: string) => {
  expect(screen.getByLabelText(ariaLabel)).toBeInTheDocument();
};
/**
 * Await for assertion. using waitFor under the hood.
 * Can select bewteen getByLabelText or getByText
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

const getByText = (domEl: ElementQuery[]) => {
  for (let index in domEl) {
    switch (domEl[index].query) {
      case QueryDOM.BYLABEL:
        expect(
          screen.getByLabelText(domEl[index].arialabelOrText),
        ).toBeInTheDocument();
        break;
      case QueryDOM.BYTEXT:
        expect(
          screen.getByText(domEl[index].arialabelOrText),
        ).toBeInTheDocument();
        break;
    }
  }
};

export default {
  awaitMk,
  awaitFor,
  awaitFind,
  getByText,
  awaitFindText,
  getByLabelText,
};