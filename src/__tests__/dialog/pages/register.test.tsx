import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import Register from 'src/dialog/pages/register';
import pagesMocks from 'src/__tests__/dialog/pages/mocks/pages-mocks';
import regexCases from 'src/__tests__/dialog/pages/mocks/reference-data/error/regex-cases';
import registerMessage from 'src/__tests__/dialog/pages/mocks/reference-data/props/register-message';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
describe('error tests:\n', () => {
  const { methods, spies } = pagesMocks;
  methods.config();
  const { props } = registerMessage;
  it('Must show Register dialog', async () => {
    const { asFragment } = render(<Register {...props} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot('Register dialog');
  });
  it('Must show error if invalid regex, hitting enter', async () => {
    for (let i = 0; i < regexCases.cases.length; i++) {
      const { input, msg } = regexCases.cases[i];
      render(<Register {...props} />);
      await methods.typeNClick(input, `${input}{enter}`);
      await assertion.awaitFindText(msg);
      cleanup();
    }
  });
  it('Must show error if invalid regex, clicking signup', async () => {
    for (let i = 0; i < regexCases.cases.length; i++) {
      const { input, msg } = regexCases.cases[i];
      render(<Register {...props} />);
      await methods.typeNClick(input, input, true);
      await assertion.awaitFindText(msg);
      cleanup();
    }
  });
  it('Must show error if password mismatch, hitting enter', async () => {
    render(<Register {...props} />);
    await methods.typeNClick('ThaPaswordk3ych4in', 'ThaPaswordk3ych4i{enter}');
    await assertion.awaitFindText(testsI18n.get('popup_password_mismatch'));
  });
  it('Must show error if password mismatch, clicking submit', async () => {
    render(<Register {...props} />);
    await methods.typeNClick('ThaPaswordk3ych4in', 'ThaPaswordk3ych4i', true);
    await assertion.awaitFindText(testsI18n.get('popup_password_mismatch'));
  });
  it('Must call sendMessage, hitting enter', async () => {
    render(<Register {...props} />);
    await methods.typeNClick('Th4Paswordk3', 'Th4Paswordk3{enter}');
    await waitFor(() => {
      expect(spies.sendMessage).toBeCalledWith({
        command: BackgroundCommand.REGISTER_FROM_DIALOG,
        value: {
          data: props.data.msg.data,
          tab: props.data.tab,
          mk: 'Th4Paswordk3',
          domain: props.data.domain,
          request_id: undefined,
        },
      });
    });
  });
  it('Must call sendMessage, clicking submit', async () => {
    render(<Register {...props} />);
    await methods.typeNClick('Th4Pasw0rdk3', 'Th4Pasw0rdk3', true);
    await waitFor(() => {
      expect(spies.sendMessage).toBeCalledWith({
        command: BackgroundCommand.REGISTER_FROM_DIALOG,
        value: {
          data: props.data.msg.data,
          tab: props.data.tab,
          mk: 'Th4Pasw0rdk3',
          domain: props.data.domain,
          request_id: undefined,
        },
      });
    });
  });
});
