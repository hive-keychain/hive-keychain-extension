import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';

export const buildAddAccountSetupTitleProperties = (
  hasAnyAccounts: boolean,
): PageTitleProps => ({
  title: 'popup_html_setup',
  isBackButtonEnabled: hasAnyAccounts,
  isCloseButtonDisabled: !hasAnyAccounts,
});
