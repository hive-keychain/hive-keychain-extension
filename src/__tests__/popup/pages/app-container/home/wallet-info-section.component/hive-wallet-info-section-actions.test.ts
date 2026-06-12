import { Screen } from '@interfaces/screen.interface';
import { HiveWalletInfoSectionActions } from 'src/popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-actions';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('hive-wallet-info-section-actions tests:\n', () => {
  it('sets HIVE send label params', () => {
    const sendAction = HiveWalletInfoSectionActions('HIVE')[0];

    expect(sendAction.nextScreen).toBe(Screen.TRANSFER_FUND_PAGE);
    expect(sendAction.label).toBe('popup_html_send');
    expect(sendAction.labelParams).toEqual(['HIVE']);
    expect(
      I18nUtils.getMessage(sendAction.label, sendAction.labelParams),
    ).toBe('Send HIVE');
  });

  it('sets HBD send label params', () => {
    const sendAction = HiveWalletInfoSectionActions('HBD')[0];

    expect(sendAction.nextScreen).toBe(Screen.TRANSFER_FUND_PAGE);
    expect(sendAction.label).toBe('popup_html_send');
    expect(sendAction.labelParams).toEqual(['HBD']);
    expect(
      I18nUtils.getMessage(sendAction.label, sendAction.labelParams),
    ).toBe('Send HBD');
  });
});
