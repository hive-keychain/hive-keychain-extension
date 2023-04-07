import { KeychainApi } from '@api/keychain';
import { Witness } from '@interfaces/witness.interface';
import { setErrorMessage } from '@popup/actions/message.actions';
import { EditMyWitnessComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/edit-my-witness/edit-my-witness.component';
import { WitnessInformationComponent } from '@popup/pages/app-container/home/governance/my-witness-tab/witness-information/witness-information.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import './my-witness-tab.component.scss';

export type MyWitnessPage = 'witness_information' | 'edit_my_witness';

type Props = {
  ranking: Witness[];
};

const MyWitnessTab = ({
  ranking,
  activeAccount,
  setErrorMessage,
}: PropsFromRedux & Props) => {
  const [page, setPage] = useState<MyWitnessPage>('witness_information');
  const [witnessInfo, setWitnessInfo] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setIsLoading(true);
    let requestResult;
    try {
      requestResult = await KeychainApi.get(
        `hive/witness/${activeAccount.name!}`,
      );
      console.log({ requestResult }); //TODO to remove
      if (!!requestResult && requestResult !== '') {
        setWitnessInfo(requestResult);
        setIsLoading(false);
      } else {
        throw new Error('Witness-info data error');
      }
    } catch (err) {
      setErrorMessage('popup_html_error_retrieving_witness_information');
    }
  };
  //TODO bellow create sccs + classes
  return (
    <div className="my-witness-tab">
      {!isLoading &&
        witnessInfo &&
        (page === 'witness_information' ? (
          <WitnessInformationComponent
            ranking={ranking}
            setPage={setPage}
            witnessInfo={witnessInfo}
          />
        ) : (
          <EditMyWitnessComponent setPage={setPage} witnessInfo={witnessInfo} />
        ))}
      {isLoading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
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
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const MyWitnessTabComponent = connector(MyWitnessTab);
