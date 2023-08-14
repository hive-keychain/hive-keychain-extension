import {
  Witness,
  WitnessInfo,
  WitnessParamsForm,
} from '@interfaces/witness.interface';
import { Screen } from '@reference-data/screen.enum';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { ButtonType } from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import Icon from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import {
  goBack,
  navigateToWithParams,
} from 'src/popup/hive/actions/navigation.actions';
import { WitnessGlobalInformationComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/witness-information/witness-global-information/witness-global-information.component';
import { WitnessInformationParametersComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/witness-information/witness-information-parameters/witness-information-parameters.component';
import { RootState } from 'src/popup/hive/store';
import BlockchainTransactionUtils from 'src/popup/hive/utils/blockchain.utils';
import WitnessUtils, {
  WITNESS_DISABLED_KEY,
} from 'src/popup/hive/utils/witness.utils';
import FormatUtils from 'src/utils/format.utils';
import './witness-information.component.scss';

interface WitnessInformationProps {
  witnessInfo: WitnessInfo;
  ranking: Witness[];
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

enum WitnessInfoScreen {
  INFO = 'INFO',
  PARAMS = 'PARAMS',
}

const WitnessInformation = ({
  activeAccount,
  witnessInfo,
  ranking,
  setEditMode,
  navigateToWithParams,
  addToLoadingList,
  setErrorMessage,
  setSuccessMessage,
  removeFromLoadingList,
  refreshActiveAccount,
  goBack,
}: PropsFromRedux & WitnessInformationProps) => {
  const [selectedScreen, setSelectedScreen] = useState<WitnessInfoScreen>(
    WitnessInfoScreen.INFO,
  );
  const [witnessRanking, setWitnessRanking] = useState<Witness>();
  const [lastSigningKey, setLastSigningKey] = useState<string | null>(null);

  useEffect(() => {
    initLastSigningKey();
    setWitnessRanking(
      ranking.filter(
        (witness: Witness) => witness.name === activeAccount.name!,
      )[0],
    );
  }, [ranking]);

  const initLastSigningKey = async () => {
    setLastSigningKey(
      await WitnessUtils.getLastSigningKeyForWitness(activeAccount.name!),
    );
  };

  const gotoNextPage = () => {
    setEditMode(true);
  };

  const disableWitness = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_disable_witness_account_confirmation_message',
        [activeAccount.name!],
      ),
      title: `popup_html_disable_witness`,
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_update_witness_operation');

        try {
          await WitnessUtils.saveLastSigningKeyForWitness(
            activeAccount.name!,
            witnessInfo.signingKey,
          );

          const success = await WitnessUtils.updateWitnessParameters(
            activeAccount.name!,
            {
              accountCreationFee: witnessInfo.params.accountCreationFee,
              maximumBlockSize: witnessInfo.params.maximumBlockSize,
              hbdInterestRate: witnessInfo.params.hbdInterestRate,
              signingKey: WITNESS_DISABLED_KEY,
              url: witnessInfo.url,
            } as WitnessParamsForm,
            activeAccount.keys.active!,
          );
          addToLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList('html_popup_update_witness_operation');
          await BlockchainTransactionUtils.delayRefresh();
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          refreshActiveAccount();
          if (success) {
            goBack();
            setSuccessMessage('popup_success_witness_account_update');
          } else {
            setErrorMessage('popup_error_witness_account_update', [
              `${activeAccount.name!}`,
            ]);
          }
        } catch (err: any) {
          setErrorMessage(err.message);
          removeFromLoadingList('html_popup_update_witness_operation');
          removeFromLoadingList('html_popup_confirm_transaction_operation');
        } finally {
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList('html_popup_confirm_transaction_operation');
        }
      },
    });
  };
  const enableWitness = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_disable_witness_account_confirmation_message',
        [activeAccount.name!],
      ),
      title: `popup_html_enable_witness`,
      fields: [
        {
          label: 'popup_html_witness_information_signing_key_label',
          value: lastSigningKey,
          valueClassName: 'xs-font',
        },
      ],
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_update_witness_operation');
        try {
          const success = await WitnessUtils.updateWitnessParameters(
            activeAccount.name!,
            {
              accountCreationFee: witnessInfo.params.accountCreationFee,
              maximumBlockSize: witnessInfo.params.maximumBlockSize,
              hbdInterestRate: witnessInfo.params.hbdInterestRate,
              signingKey: lastSigningKey,
              url: witnessInfo.url,
            } as WitnessParamsForm,
            activeAccount.keys.active!,
          );
          addToLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList('html_popup_update_witness_operation');
          await BlockchainTransactionUtils.delayRefresh();
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          refreshActiveAccount();
          if (success) {
            goBack();
            setSuccessMessage('popup_success_witness_account_update');
          } else {
            setErrorMessage('popup_error_witness_account_update', [
              `${activeAccount.name!}`,
            ]);
          }
        } catch (err: any) {
          setErrorMessage(err.message);
          removeFromLoadingList('html_popup_update_witness_operation');
          removeFromLoadingList('html_popup_confirm_transaction_operation');
        } finally {
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList('html_popup_confirm_transaction_operation');
        }
      },
    });
  };

  const changeSelectedScreen = (selectedValue: WitnessInfoScreen) => {
    setSelectedScreen(selectedValue);
  };

  return (
    <div className="witness-information">
      <div className="top-panel">
        <SwitchComponent
          onChange={changeSelectedScreen}
          selectedValue={selectedScreen}
          leftValue={WitnessInfoScreen.INFO}
          rightValue={WitnessInfoScreen.PARAMS}
          leftValueLabel={'html_popup_witness_information_info_label'}
          rightValueLabel={'html_popup_witness_information_params_label'}
        />
      </div>
      <div className="witness-profile-container">
        <div className="witness-profile">
          <img
            src={`https://images.hive.blog/u/${activeAccount.name!}/avatar`}
            onError={(e: any) => {
              e.target.onError = null;
              e.target.src = '/assets/images/accounts.png';
            }}
          />
          <div className="info-container">
            <div className="witness-name">@{activeAccount.name!}</div>
            {witnessRanking && (
              <div className="witness-ranking">
                {witnessRanking?.active_rank}
                {chrome.i18n.getMessage(
                  FormatUtils.getOrdinalLabelTranslation(
                    witnessRanking?.active_rank!,
                  ),
                )}{' '}
                {/* {chrome.i18n.getMessage('popup_html_witness_rank_label')}{' '} */}
                {(witnessRanking?.active_rank as any).toString() !==
                  (witnessRanking?.rank as any).toString() && (
                  <div>
                    {'('}
                    {witnessRanking?.rank}
                    {')'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {witnessInfo.isDisabled && (
          <Icon
            additionalClassName="witness-disabled"
            name={Icons.WITNESS_DISABLED}
            tooltipMessage="popup_html_witness_information_witness_disabled_text"
            tooltipPosition="left"
          />
        )}
      </div>
      {selectedScreen === WitnessInfoScreen.INFO && witnessRanking && (
        <WitnessGlobalInformationComponent witnessInfo={witnessInfo} />
      )}
      {selectedScreen === WitnessInfoScreen.PARAMS && (
        <>
          <WitnessInformationParametersComponent witnessInfo={witnessInfo} />
          <div className="bottom-panel">
            <div className="buttons-container">
              <OperationButtonComponent
                requiredKey={KeychainKeyTypesLC.active}
                onClick={() => gotoNextPage()}
                label={'html_popup_button_edit_label'}
                additionalClass="padding-top"
              />
              {!witnessInfo.isDisabled && (
                <OperationButtonComponent
                  requiredKey={KeychainKeyTypesLC.active}
                  onClick={() => disableWitness()}
                  label={'popup_html_disable_witness'}
                  type={ButtonType.DEFAULT}
                />
              )}
              {witnessInfo.isDisabled && lastSigningKey && (
                <OperationButtonComponent
                  requiredKey={KeychainKeyTypesLC.active}
                  onClick={() => enableWitness()}
                  label={'popup_html_enable_witness'}
                  type={ButtonType.DEFAULT}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  addToLoadingList,
  setErrorMessage,
  setSuccessMessage,
  removeFromLoadingList,
  refreshActiveAccount,
  goBack,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessInformationComponent = connector(WitnessInformation);
