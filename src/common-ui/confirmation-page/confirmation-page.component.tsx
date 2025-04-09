import { TransactionOptionsMetadata } from '@interfaces/keys.interface';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { addCaptionToLoading } from '@popup/multichain/actions/loading.actions';
import { goBack } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { KeychainKeyTypes, KeychainKeyTypesLC } from 'hive-keychain-commons';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { ConfirmationPageFields } from 'src/common-ui/confirmation-page/confirmation-field.interface';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Separator } from 'src/common-ui/separator/separator.component';

export interface ConfirmationPageParams {
  fields: ConfirmationPageFields[];
  message: string;
  warningMessage?: string;
  warningParams?: string[];
  skipWarningTranslation?: boolean;
  title: string;
  skipTitleTranslation?: boolean;
  afterConfirmAction: (options?: TransactionOptionsMetadata) => {};
  afterCancelAction?: () => {};
  formParams?: any;
  method: KeychainKeyTypes | null;
}

const ConfirmationPage = ({
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
  goBack,
  setTitleContainerProperties,
  addCaptionToLoading,
}: PropsType) => {
  const [willUseMultisig, setWillUseMultisig] = useState<boolean>();
  const [hasField] = useState(fields && fields.length !== 0);

  const [twoFABots, setTwoFABots] = useState<{ [botName: string]: string }>({});

  useEffect(() => {
    setTitleContainerProperties({
      title: title ?? 'popup_html_confirm',
      skipTitleTranslation,
      isBackButtonEnabled: true,
      onBackAdditional: () => {
        if (afterCancelAction) {
          afterCancelAction();
        }
      },
      onCloseAdditional: () => {
        if (afterCancelAction) {
          afterCancelAction();
        }
      },
    });

    checkForMultsig();
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
    // AnalyticsUtils.sendRequestEvent(title);
    if (willUseMultisig) {
      addCaptionToLoading(
        twoFABots && Object.keys(twoFABots).length > 0
          ? 'multisig_transmitting_to_2fa'
          : 'multisig_transmitting_to_multisig',
      );
      metadata = { twoFACodes: twoFABots };
    }
    afterConfirmAction({ metaData: metadata });
  };

  const handleClickOnCancel = async () => {
    if (afterCancelAction) {
      afterCancelAction();
    }
    goBack();
  };

  return (
    <div
      className="confirmation-page"
      data-testid={`${Screen.CONFIRMATION_PAGE}-page`}>
      <div
        className={`confirmation-top ${
          twoFABots && Object.keys(twoFABots).length > 0 ? 'twofa' : ''
        }`}>
        <div
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: message,
          }}></div>

        {warningMessage && (
          <div data-testid="warning-message" className="warning-message">
            {skipWarningTranslation
              ? warningMessage
              : chrome.i18n.getMessage(warningMessage, warningParams)}
          </div>
        )}
        {willUseMultisig && (
          <div data-testid="use-multisig-message" className="multisig-message">
            <img src="/assets/images/multisig/logo.png" className="logo" />
            <div className="message">
              {chrome.i18n.getMessage('multisig_disclaimer_message')}
            </div>
          </div>
        )}
        {hasField && (
          <div className="fields">
            {fields.map((field, index) => (
              <React.Fragment key={field.label}>
                <div className="field">
                  <div className="label">
                    {chrome.i18n.getMessage(field.label)}
                  </div>
                  <div className={`value ${field.valueClassName ?? ''}`}>
                    {field.value}
                  </div>
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
        )}
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
                label={chrome.i18n.getMessage('multisig_bot_two_fa_code', [
                  botName,
                ])}
                skipLabelTranslation
              />
            ))}
          </div>
        )}
      </div>

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
  return {
    message: state.navigation.stack[0].params.message as string,
    fields: state.navigation.stack[0].params.fields as ConfirmationPageFields[],
    warningMessage: state.navigation.stack[0].params.warningMessage as string,
    warningParams: state.navigation.stack[0].params.warningParams,
    skipWarningTranslation:
      state.navigation.stack[0].params.skipWarningTranslation,
    afterConfirmAction: state.navigation.stack[0].params.afterConfirmAction,
    afterCancelAction: state.navigation.stack[0].params.afterCancelAction,
    title: state.navigation.stack[0].params.title,
    skipTitleTranslation: state.navigation.stack[0].params.skipTitleTranslation,
    method: state.navigation.stack[0].params.method as KeychainKeyTypes,
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  setTitleContainerProperties,
  addCaptionToLoading,
});
type PropsType = ConnectedProps<typeof connector> & ConfirmationPageParams;

export const ConfirmationPageComponent = connector(ConfirmationPage);
