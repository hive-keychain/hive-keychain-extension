import { buildAddAccountSetupTitleProperties } from 'src/popup/hive/pages/add-account/add-account-setup-title.utils';

describe('buildAddAccountSetupTitleProperties', () => {
  it('enables back-to-chain reset during first-time setup', () => {
    const onResetChain = jest.fn();
    const props = buildAddAccountSetupTitleProperties(false, onResetChain);

    expect(props).toMatchObject({
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: true,
    });
    expect(props.onBackAdditional).toBe(onResetChain);
  });

  it('allows closing when accounts already exist', () => {
    const props = buildAddAccountSetupTitleProperties(true);

    expect(props.isCloseButtonDisabled).toBe(false);
    expect(props.onBackAdditional).toBeUndefined();
  });
});
