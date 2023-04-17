import { Witness } from '@interfaces/witness.interface';
import { WitnessGlobalInformationComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/witness-information/witness-global-information/witness-global-information.component';
import { WitnessInformationParametersComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/witness-information/witness-information-parameters/witness-information-parameters.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import './witness-information.component.scss';

interface WitnessInformationProps {
  witnessInfo: any;
  ranking: Witness[];
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const WitnessInformation = ({
  activeAccount,
  witnessInfo,
  ranking,
  setEditMode,
}: PropsFromRedux & WitnessInformationProps) => {
  const [isInfoParamSelected, setIsInfoParamSelected] = useState(true);
  const [witnessRanking, setWitnessRanking] = useState<Witness>();

  useEffect(() => {
    setWitnessRanking(
      ranking.filter((witness: any) => witness.name === activeAccount.name!)[0],
    );
  }, [ranking]);

  //TODO remove block
  useEffect(() => {
    console.log({ witnessRanking });
  }, [witnessRanking]);
  /////

  const gotoNextPage = () => {
    setEditMode(true);
  };

  const getOrdinalLabelTranslation = (active_rank: string) => {
    const result = parseFloat(active_rank) % 10;
    console.log({ result });
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

  return (
    <div className="witness-information">
      <div className="top-panel">
        <SwitchComponent
          onChange={(value) => setIsInfoParamSelected(value)}
          leftValueLabel="html_popup_witness_information_global_label"
          leftValue={false}
          rightValueLabel="html_popup_witness_information_params_label"
          rightValue={true}
          selectedValue={isInfoParamSelected}
        />
      </div>
      <div className="text">
        {chrome.i18n.getMessage('popup_html_witness_page_text')}
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
          <div className="witness-ranking">
            {witnessRanking?.active_rank}
            {chrome.i18n.getMessage(
              getOrdinalLabelTranslation(witnessRanking?.active_rank!),
            )}
            {'('}
            {witnessRanking?.rank}
            {')'}
          </div>
        </div>
      </div>
      {isInfoParamSelected ? (
        <WitnessInformationParametersComponent witnessInfo={witnessInfo} />
      ) : (
        <WitnessGlobalInformationComponent
          witnessRanking={witnessRanking!}
          witnessInfo={witnessInfo}
        />
      )}
      <div className="button-container">
        <ButtonComponent
          label={'html_popup_button_next_step_label'}
          onClick={() => gotoNextPage()}
          additionalClass="padding-top"
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessInformationComponent = connector(WitnessInformation);
