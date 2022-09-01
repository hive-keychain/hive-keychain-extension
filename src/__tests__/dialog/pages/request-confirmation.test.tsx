import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Config from 'src/config';
import RequestConfirmation from 'src/dialog/pages/request-confirmation';
import pagesMocks from 'src/__tests__/dialog/pages/mocks/pages-mocks';
import requestConfirmation from 'src/__tests__/dialog/pages/mocks/reference-data/props/request-confirmation';
import { Tests_Client } from 'src/__tests__/utils-for-testing/classes/dialog/request-balance';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import { PropsRequestMessage } from 'src/__tests__/utils-for-testing/types/props-types';
describe('request-confirmation tests:\n', () => {
  const { methods, mocks } = pagesMocks;
  const { requests } = requestConfirmation;
  methods.config();
  beforeEach(() => {
    mockPreset.setOrDefault({});
    mocks.dHiveHiveIO(Tests_Client);
    mocks.getUserBalance([{ symbol: 'LEO', balance: '2000.000' }]);
  });
  it('Must return each component Request', async () => {
    for (let i = 0; i < requests.length; i++) {
      const { headerKey, propsRequest } = requests[i];
      const props = {
        data: {
          command: DialogCommand.SEND_DIALOG_CONFIRM,
          data: propsRequest.data,
          rpc: DefaultRpcs[0],
          tab: 0,
          domain: 'domain',
          accounts: [mk.user.one, mk.user.two],
          hiveEngineConfig: Config.hiveEngine,
        } as PropsRequestMessage,
      };
      render(<RequestConfirmation {...props} />);
      await waitFor(() => {
        if (requests[i].default) {
          expect(screen.queryByLabelText('dialog-header-operation')).toBeNull();
        } else {
          assertion.toHaveTextContent([
            {
              arialabel: 'dialog-header-operation',
              text: testsI18n.get(headerKey),
            },
          ]);
        }
      });
      cleanup();
    }
  });
});
