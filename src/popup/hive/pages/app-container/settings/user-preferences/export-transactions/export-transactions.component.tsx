import { ExportTransactionUtils } from '@popup/hive/utils/export-transactions.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
  setLoadingPercentage,
} from '@popup/multichain/actions/loading.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { KeychainError } from 'src/keychain-error';
import { setTitleContainerProperties } from 'src/popup/multichain/actions/title-container.actions';
import { RootState } from 'src/popup/multichain/store';

const ExportTransactions = ({
  activeAccount,
  setTitleContainerProperties,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setLoadingPercentage,
}: PropsFromRedux) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_export_transactions',
      isBackButtonEnabled: true,
    });
  }, []);

  const handleClickOnDownload = async () => {
    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() > new Date(endDate).getTime()
    ) {
      setErrorMessage('export_transactions_incorrect_dates');
      return;
    }
    addToLoadingList(
      'popup_html_pref_export_transactions_downloading_loading_message',
    );
    try {
      await ExportTransactionUtils.downloadTransactions(
        activeAccount.name!,
        startDate,
        endDate,
        (percentage) => {
          setLoadingPercentage(percentage);
        },
      );
    } catch (err) {
      const error = err as KeychainError;
      setErrorMessage(error.message, error.messageParams);
    } finally {
      removeFromLoadingList(
        'popup_html_pref_export_transactions_downloading_loading_message',
      );
    }
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_EXPORT_TRANSACTIONS}-page`}
      className="export-transactions-page">
      <div
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage(
            'popup_html_pref_export_transactions_info',
          ),
        }}
      />
      <SelectAccountSectionComponent fullSize background="white" />
      <FormContainer onSubmit={handleClickOnDownload}>
        <div className="form-fields">
          <InputComponent
            onChange={setStartDate}
            value={startDate}
            dataTestId="input-startDate"
            type={InputType.DATE}
            placeholder="popup_html_start_date"
            label="popup_html_start_date"
          />
          <InputComponent
            onChange={setEndDate}
            value={endDate}
            dataTestId="input-endDate"
            type={InputType.DATE}
            placeholder="popup_html_end_date"
            label="popup_html_end_date"
          />
        </div>
        <ButtonComponent
          label="popup_html_download"
          dataTestId="export-transactions-download"
          onClick={handleClickOnDownload}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setLoadingPercentage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ExportTransactionsComponent = connector(ExportTransactions);
