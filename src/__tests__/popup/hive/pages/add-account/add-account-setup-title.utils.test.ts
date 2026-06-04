import { buildAddAccountSetupTitleProperties } from 'src/popup/hive/pages/add-account/add-account-setup-title.utils';

describe('buildAddAccountSetupTitleProperties', () => {
  it('disables back navigation during first-time setup', () => {
    const props = buildAddAccountSetupTitleProperties(false);

    expect(props).toMatchObject({
      title: 'popup_html_setup',
      isBackButtonEnabled: false,
      isCloseButtonDisabled: true,
    });
    expect(props.onBackAdditional).toBeUndefined();
  });

  it('allows closing when accounts already exist', () => {
    const props = buildAddAccountSetupTitleProperties(true);

    expect(props.isBackButtonEnabled).toBe(true);
    expect(props.isCloseButtonDisabled).toBe(false);
    expect(props.onBackAdditional).toBeUndefined();
  });
});
