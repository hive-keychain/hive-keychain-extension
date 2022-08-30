import { render, waitFor } from '@testing-library/react';
import React from 'react';
import Transfer from 'src/dialog/pages/requests/transfer';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import { Tests_Client } from 'src/__tests__/utils-for-testing/classes/dialog/request-balance';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import requestTransfer from 'src/__tests__/utils-for-testing/data/props/dialog/request-transfer';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import { PropsRequestTransfer } from 'src/__tests__/utils-for-testing/types/props-types';
describe('transfer-check tests:\n', () => {
  const { methods, mocks } = appMocks;
  const { props } = requestTransfer;
  methods.config();
  beforeEach(() => {
    mockPreset.setOrDefault({});
    mocks.dHiveHiveIO(Tests_Client);
  });
  it('Must set warning on header', async () => {
    const clonedProps = objects.clone(props) as PropsRequestTransfer;
    clonedProps.data.to = phishing.accounts.data[0];
    render(<Transfer {...clonedProps} />);
    await assertion.awaitFindText(
      testsI18n.get('popup_warning_phishing', [clonedProps.data.to]),
    );
  });
  it('Must not set warning on header', async () => {
    const clonedProps = objects.clone(props) as PropsRequestTransfer;
    clonedProps.data.to = 'tribaldex';
    render(<Transfer {...clonedProps} />);
    waitFor(() => {
      assertion.queryByText(
        testsI18n.get('popup_warning_phishing', [clonedProps.data.to]),
        false,
      );
    });
  });
});
