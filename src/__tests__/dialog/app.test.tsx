import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import App from 'src/dialog/App';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alHeader from 'src/__tests__/utils-for-testing/aria-labels/al-header';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import callListeners from 'src/__tests__/utils-for-testing/jest-chrome/callListeners';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
describe('dialog app tests:\n', () => {
  const { methods, constants, spies } = appMocks;
  const { data } = constants;
  methods.config();
  beforeEach(() => {
    render(<App />);
  });
  it('Must render Unlock', async () => {
    await callListeners(data.request(DialogCommand.UNLOCK));
    await assertion.awaitOneByLabel(alHeader.dialog.header.preFix + 'unlock');
  });
  it('Must return null if no data', async () => {
    await callListeners({});
    await assertion.findLabelChildren(alComponent.dialog.component, 0);
  });
  it('Must render Unlock showing wrong password paragraph', async () => {
    await callListeners(data.request(DialogCommand.WRONG_MK));
    await assertion.awaitOneByLabel(alHeader.dialog.header.preFix + 'unlock');
    assertion.getOneByText(testsI18n.get('dialog_header_wrong_pwd'));
  });
  it('Must render DialogError', async () => {
    await callListeners(
      data.request(DialogCommand.SEND_DIALOG_ERROR, 'Error On Dialog'),
    );
    await assertion.awaitOneByLabel(alHeader.dialog.header.preFix + 'error');
    await assertion.awaitFindText('Error On Dialog');
  });
  it('Must render Register', async () => {
    await callListeners(data.request(DialogCommand.REGISTER));
    await assertion.awaitOneByLabel(alHeader.dialog.header.preFix + 'register');
  });
  it('Must render RequestConfirmation with null data', async () => {
    await callListeners(data.requestConfirmation);
    await assertion.findLabelChildren(alComponent.dialog.component, 0);
  });
  it('Must render RequestResponse', async () => {
    await callListeners(data.requestResponse);
    await assertion.awaitOneByLabel(
      alHeader.dialog.header.preFix + 'request-response',
    );
    await assertion.awaitFindText(data.requestResponse.msg.message);
  });
  it('Must call sendResponse', async () => {
    await callListeners(data.request(DialogCommand.READY), 'sendReponse CB');
    expect(spies.sendResponse).toBeCalledWith(true, 'sendReponse CB');
  });
});
