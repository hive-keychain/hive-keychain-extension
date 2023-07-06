import WitnessUtils from '@hiveapp/utils/witness.utils';
import { Witness } from '@interfaces/witness.interface';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import { EditMyWitnessComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/edit-my-witness/edit-my-witness.component';
import { WitnessInformationComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/witness-information/witness-information.component';
import { RootState } from 'src/popup/hive/store';
import './my-witness-tab.component.scss';

type Props = {
  ranking: Witness[];
};

const MyWitnessTab = ({
  ranking,
  globalProperties,
  activeAccount,
  currencyPrices,
  setErrorMessage,
}: PropsFromRedux & Props) => {
  const [witnessInfo, setWitnessInfo] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setIsLoading(true);
    try {
      const result = await WitnessUtils.getWitnessInfo(
        activeAccount.name!,
        globalProperties,
        currencyPrices,
      );

      setWitnessInfo(result);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('popup_html_error_retrieving_witness_information');
    }
  };

  return (
    <div className="my-witness-tab">
      {!isLoading &&
        witnessInfo &&
        (!editMode ? (
          <WitnessInformationComponent
            ranking={ranking}
            setEditMode={setEditMode}
            witnessInfo={witnessInfo}
          />
        ) : (
          <EditMyWitnessComponent
            setEditMode={setEditMode}
            witnessInfo={witnessInfo}
          />
        ))}
      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
      {hasError && (
        <div aria-label="error-witness" className="error-witness">
          <Icon name={Icons.ERROR} type={IconType.OUTLINED}></Icon>
          <span>
            {chrome.i18n.getMessage(
              'popup_html_error_retrieving_witness_information',
            )}
          </span>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    globalProperties: state.globalProperties,
    currencyPrices: state.currencyPrices,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const MyWitnessTabComponent = connector(MyWitnessTab);
