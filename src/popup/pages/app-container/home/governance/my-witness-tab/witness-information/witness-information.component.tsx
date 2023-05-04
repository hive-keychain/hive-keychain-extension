import { WitnessProps } from '@hiveio/dhive/lib/utils';
import { Witness } from '@interfaces/witness.interface';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { WitnessGlobalInformationComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/witness-information/witness-global-information/witness-global-information.component';
import { WitnessInformationParametersComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/witness-information/witness-information-parameters/witness-information-parameters.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import Config from 'src/config';
import BlockchainTransactionUtils from 'src/utils/blockchain.utils';
import WitnessUtils from 'src/utils/witness.utils';
import './witness-information.component.scss';

interface WitnessInformationProps {
  witnessInfo: any;
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
}: PropsFromRedux & WitnessInformationProps) => {
  const [selectedScreen, setSelectedScreen] = useState<WitnessInfoScreen>(
    WitnessInfoScreen.INFO,
  );
  const [witnessRanking, setWitnessRanking] = useState<Witness>();

  useEffect(() => {
    setWitnessRanking(
      ranking.filter(
        (witness: Witness) => witness.name === activeAccount.name!,
      )[0],
    );
  }, [ranking]);

  const gotoNextPage = () => {
    setEditMode(true);
  };

  const getOrdinalLabelTranslation = (active_rank: string) => {
    const result = parseFloat(active_rank) % 10;
    switch (result) {
      case 1:
        return 'html_popup_witness_ranking_ordinal_st_label';
      case 2:
        return 'html_popup_witness_ranking_ordinal_nd_label';
      case 3:
        return 'html_popup_witness_ranking_ordinal_rd_label';
      default:
        return 'html_popup_witness_ranking_ordinal_th_label';
    }
  };

  const onDisableWitness = () => {
    if (!activeAccount.keys.active)
      return setErrorMessage('popup_missing_key', [KeychainKeyTypes.active]);

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_disable_witness_account_confirmation_message',
        [activeAccount.name!],
      ),
      title: `popup_html_disable_witness`,
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_update_witness_operation');
        try {
          const success = await WitnessUtils.updateWitnessParameters(
            activeAccount.name!,
            activeAccount.keys.active!,
            {
              new_signing_key: Config.myWitness.disabled_signing_key,
            } as WitnessProps,
          );
          addToLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList('html_popup_update_witness_operation');
          await BlockchainTransactionUtils.delayRefresh();
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          refreshActiveAccount();
          if (success) {
            setSelectedScreen(WitnessInfoScreen.INFO);
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
                getOrdinalLabelTranslation(witnessRanking?.active_rank!),
              )}{' '}
              {chrome.i18n.getMessage('popup_html_witness_rank_label')}{' '}
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
      {selectedScreen === WitnessInfoScreen.INFO && witnessRanking && (
        <WitnessGlobalInformationComponent
          witnessRanking={witnessRanking!}
          witnessInfo={witnessInfo}
        />
      )}
      {selectedScreen === WitnessInfoScreen.PARAMS && (
        <>
          <WitnessInformationParametersComponent witnessInfo={witnessInfo} />
          <div className="bottom-panel">
            <div className="buttons-container">
              <ButtonComponent
                label={'html_popup_button_edit_label'}
                onClick={() => gotoNextPage()}
                additionalClass="padding-top"
                disableButton={
                  witnessInfo.signing_key ===
                  Config.myWitness.disabled_signing_key
                }
              />
              {witnessInfo.signing_key !==
                Config.myWitness.disabled_signing_key && (
                <ButtonComponent
                  label="popup_html_disable_witness"
                  type={ButtonType.IMPORTANT}
                  onClick={() => onDisableWitness()}
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessInformationComponent = connector(WitnessInformation);
