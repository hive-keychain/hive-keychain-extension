import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { Screen } from '@interfaces/screen.interface';
import { ExportTransactionUtils } from '@popup/hive/utils/export-transactions.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
  setLoadingPercentage,
} from '@popup/multichain/actions/loading.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { KeychainError } from 'src/keychain-error';
import { setTitleContainerProperties } from 'src/popup/multichain/actions/title-container.actions';
import { RootState } from 'src/popup/multichain/store';

import { I18nUtils } from 'src/utils/i18n.utils';
type HiveAccountOption = OptionItem & {
  value: string;
};

const ExportTransactions = ({
  accounts,
  activeAccountName,
  setTitleContainerProperties,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setLoadingPercentage,
}: PropsFromRedux) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedAccountName, setSelectedAccountName] = useState(
    activeAccountName ?? accounts[0]?.name,
  );

  const accountOptions: HiveAccountOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.name,
    img: `https://images.hive.blog/u/${account.name}/avatar`,
  }));
  const selectedAccountOption = accountOptions.find(
    (accountOption) => accountOption.value === selectedAccountName,
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_export_transactions',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    if (!selectedAccountName && activeAccountName) {
      setSelectedAccountName(activeAccountName);
    }
  }, [activeAccountName, selectedAccountName]);

  useEffect(() => {
    if (
      selectedAccountName &&
      accountOptions.some(
        (accountOption) => accountOption.value === selectedAccountName,
      )
    ) {
      return;
    }

    setSelectedAccountName(activeAccountName ?? accounts[0]?.name);
  }, [accounts, activeAccountName, selectedAccountName]);

  const handleClickOnDownload = async () => {
    if (!selectedAccountName) {
      return;
    }

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
        selectedAccountName,
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
          __html: I18nUtils.getMessage(
            'popup_html_pref_export_transactions_info',
          ),
        }}
      />
      {selectedAccountOption && (
        <div className="settings-hive-account-select-panel">
          <ComplexeCustomSelect
            options={accountOptions}
            selectedItem={selectedAccountOption}
            setSelectedItem={(option) =>
              setSelectedAccountName(option.value)
            }
            background="white"
          />
        </div>
      )}
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
    accounts: state.hive.accounts,
    activeAccountName: state.hive.activeAccount.name,
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
