import { PageTitleProps } from 'src/common-ui/page-title/page-title.component';

export const buildAddAccountSetupTitleProperties = (
  hasAnyAccounts: boolean,
  onResetChain?: () => void,
): PageTitleProps => ({
  title: 'popup_html_setup',
  isBackButtonEnabled: true,
  onBackAdditional: hasAnyAccounts ? undefined : onResetChain,
  isCloseButtonDisabled: !hasAnyAccounts,
});
