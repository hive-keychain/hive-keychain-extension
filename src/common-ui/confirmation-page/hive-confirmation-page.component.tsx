import { ActiveAccount } from '@interfaces/active-account.interface';
import { Screen } from '@interfaces/screen.interface';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { addCaptionToLoading } from '@popup/multichain/actions/loading.actions';
import { goBack } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { KeychainKeyTypes, KeychainKeyTypesLC } from 'hive-keychain-commons';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { ConfirmationPageFieldType } from 'src/common-ui/confirmation-page/confirmation-field.interface';
import {
  ConfirmationPageFields,
  EmbeddedConfirmationPageProps,
  HiveConfirmationPageParams,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import { HtmlUtils } from 'src/utils/html.utils';

import { I18nUtils } from 'src/utils/i18n.utils';

export type HiveConfirmationPageContentProps = Omit<
  HiveConfirmationPageParams,
  'afterConfirmAction' | 'afterCancelAction'
> &
  EmbeddedConfirmationPageProps & {
    fields: ConfirmationPageFields[];
    message: string;
    warningMessage?: string;
    warningParams?: string[];
    skipWarningTranslation?: boolean;
    title?: string;
    skipTitleTranslation?: boolean;
    afterConfirmAction: (params?: {
      metaData?: { twoFACodes?: Record<string, string> };
    }) => void | Promise<void>;
    afterCancelAction?: () => void | boolean | Promise<void | boolean>;
    activeAccount: ActiveAccount;
    method: KeychainKeyTypes | null;
    extraComponent?: React.ReactNode;
    tokens: RootState['hive']['tokens'];
    goBack?: () => void;
    setTitleContainerProperties?: typeof setTitleContainerProperties;
    addCaptionToLoading?: typeof addCaptionToLoading;
  };

export const HiveConfirmationPageContent = ({
  fields,
  message,
  afterConfirmAction,
  afterCancelAction,
  warningMessage,
  warningParams,
  skipWarningTranslation,
  title,
  skipTitleTranslation,
  activeAccount,
  method,
  extraComponent,
  embedded = false,
  onDismiss,
  goBack,
  setTitleContainerProperties,
  addCaptionToLoading,
  tokens,
}: HiveConfirmationPageContentProps) => {
  const [willUseMultisig, setWillUseMultisig] = useState<boolean>();
  const [hasField] = useState(fields && fields.length !== 0);

  const [twoFABots, setTwoFABots] = useState<{ [botName: string]: string }>({});

  useEffect(() => {
    if (!embedded && setTitleContainerProperties) {
      setTitleContainerProperties({
        title: title ?? 'popup_html_confirm',
        skipTitleTranslation,
        isBackButtonEnabled: true,
        onBackAdditional: async () => {
          if (afterCancelAction) {
            return await afterCancelAction();
          }
        },
        onCloseAdditional: async () => {
          if (afterCancelAction) {
            await afterCancelAction();
          }
        },
      });
    }

    void checkForMultsig();
  }, []);

  const checkForMultsig = async () => {
    let useMultisig = false;
    switch (method) {
      case KeychainKeyTypes.active: {
        if (activeAccount.keys.active) {
          useMultisig = KeysUtils.isUsingMultisig(
            activeAccount.keys.active,
            activeAccount.account,
            activeAccount.keys.activePubkey?.startsWith('@')
              ? activeAccount.keys.activePubkey.replace('@', '')
              : activeAccount.account.name,
            method.toLowerCase() as KeychainKeyTypesLC,
          );
          setWillUseMultisig(useMultisig);
          if (useMultisig) {
            const accounts = await MultisigUtils.get2FAAccounts(
              activeAccount.account,
              method,
            );

            accounts.forEach((acc) =>
              setTwoFABots((old) => {
                return { ...old, [acc]: '' };
              }),
            );
          }
        }
        break;
      }
      case KeychainKeyTypes.posting: {
        if (activeAccount.keys.posting) {
          useMultisig = KeysUtils.isUsingMultisig(
            activeAccount.keys.posting,
            activeAccount.account,
            activeAccount.keys.postingPubkey?.startsWith('@')
              ? activeAccount.keys.postingPubkey.replace('@', '')
              : activeAccount.account.name,
            method.toLowerCase() as KeychainKeyTypesLC,
          );
          setWillUseMultisig(useMultisig);

          if (useMultisig) {
            const accounts = await MultisigUtils.get2FAAccounts(
              activeAccount.account,
              method,
            );
            accounts.forEach((acc) =>
              setTwoFABots((old) => {
                return { ...old, [acc]: '' };
              }),
            );
          }
        }
        break;
      }
    }
  };

  const handleClickOnConfirm = () => {
    let metadata;
    if (willUseMultisig) {
      addCaptionToLoading?.(
        twoFABots && Object.keys(twoFABots).length > 0
          ? 'multisig_transmitting_to_2fa'
          : 'multisig_transmitting_to_multisig',
      );
      metadata = { twoFACodes: twoFABots };
    }
    void afterConfirmAction({ metaData: metadata });
  };

  const handleClickOnCancel = async () => {
    let skipGoBack = false;
    if (afterCancelAction) {
      skipGoBack = (await afterCancelAction()) === true;
    }
    if (skipGoBack) return;
    if (embedded) {
      onDismiss?.();
      return;
    }
    goBack?.();
  };
  const getIcon = (field: ConfirmationPageFields) => {
    switch (field.tokenSymbol) {
      case 'HIVE':
        return SVGIcons.WALLET_HIVE_LOGO;
      case 'HBD':
        return SVGIcons.WALLET_HBD_LOGO;
      case 'HP':
        return SVGIcons.WALLET_HP_LOGO;
      default:
        return undefined;
    }
  };
  const getFieldComponent = (field: ConfirmationPageFields) => {
    switch (field.tag) {
      case ConfirmationPageFieldType.USERNAME:
        return (
          <div className={`value ${field.valueClassName ?? ''}`}>
            <UsernameWithAvatar username={field.value as string} />
          </div>
        );
      case ConfirmationPageFieldType.AMOUNT:
        return (
          <div className={`value ${field.valueClassName ?? ''}`}>
            <AmountWithLogo
              amount={field.value as string}
              symbol={field.tokenSymbol}
              logoUrl={field.tokenLogoUrl}
              icon={getIcon(field)}
              tokens={tokens}
            />
          </div>
        );
      default:
        return (
          <div className={`value ${field.valueClassName ?? ''}`}>
            {field.value}
          </div>
        );
    }
  };

  const renderFields = () => {
    return (
      <div className="fields">
        {fields.map((field, index) => (
          <React.Fragment key={field.label}>
            <div className="field">
              <div
                className="label"
                style={{ display: 'flex', alignItems: 'center' }}>
                {I18nUtils.getMessage(field.label as string)}
              </div>
              {getFieldComponent(field)}
            </div>
            {index !== fields.length - 1 && (
              <Separator
                key={` separator-${field.label}`}
                type={'horizontal'}
                fullSize
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`confirmation-page ${embedded ? 'confirmation-page--embedded' : ''}`}
      data-testid={`${Screen.CONFIRMATION_PAGE}-page`}>
      <div
        className={`confirmation-top ${
          twoFABots && Object.keys(twoFABots).length > 0 ? 'twofa' : ''
        }`}>
        <div
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: HtmlUtils.sanitizeHtml(message),
          }}></div>

        {warningMessage && (
          <div data-testid="warning-message" className="warning-message-panel">
            {skipWarningTranslation
              ? warningMessage
              : I18nUtils.getMessage(warningMessage, warningParams)}
          </div>
        )}
        {willUseMultisig && (
          <div data-testid="use-multisig-message" className="multisig-message">
            <img src="/assets/images/multisig/logo.png" className="logo" />
            <div className="message">
              {I18nUtils.getMessage('multisig_disclaimer_message')}
            </div>
          </div>
        )}
        {hasField && renderFields()}
        {twoFABots && Object.keys(twoFABots).length > 0 && (
          <div className="two-fa-codes-panel">
            {Object.entries(twoFABots).map(([botName, code]) => (
              <InputComponent
                key={`${botName}-2fa-code`}
                type={InputType.TEXT}
                value={code}
                onChange={(value) => {
                  setTwoFABots((old) => {
                    return { ...old, [botName]: value };
                  });
                }}
                label={I18nUtils.getMessage('multisig_bot_two_fa_code', [
                  botName,
                ])}
                skipLabelTranslation
              />
            ))}
          </div>
        )}
      </div>

      {extraComponent && <div className="extra-info">{extraComponent}</div>}

      <div className="bottom-panel">
        <ButtonComponent
          dataTestId="dialog_cancel-button"
          label={'dialog_cancel'}
          onClick={handleClickOnCancel}
          type={ButtonType.ALTERNATIVE}></ButtonComponent>
        <ButtonComponent
          dataTestId="dialog_confirm-button"
          label={'popup_html_confirm'}
          onClick={($event: BaseSyntheticEvent) => {
            $event.target.disabled = true;
            handleClickOnConfirm();
          }}
          type={ButtonType.IMPORTANT}></ButtonComponent>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const params = state.navigation.stack[0].params;
  return {
    message: params.message as string,
    fields: params.fields as ConfirmationPageFields[],
    warningMessage: params.warningMessage as string,
    warningParams: params.warningParams,
    skipWarningTranslation:
      state.navigation.stack[0].params.skipWarningTranslation,
    afterConfirmAction: params.afterConfirmAction,
    afterCancelAction: params.afterCancelAction,
    title: params.title,
    skipTitleTranslation: params.skipTitleTranslation,
    method: params.method as KeychainKeyTypes,
    activeAccount: (params.activeAccountOverride ??
      state.hive.activeAccount) as ActiveAccount,
    extraComponent: params.extraComponent,
    tokens: state.hive.tokens,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  setTitleContainerProperties,
  addCaptionToLoading,
});
type PropsType = ConnectedProps<typeof connector> & HiveConfirmationPageParams;

export const HiveConfirmationPageComponent = connector((props: PropsType) => (
  <HiveConfirmationPageContent {...props} embedded={false} />
));
