import { Transactions } from '@interfaces/transaction.interface';
import { fetchAccountTransactions } from '@popup/hive/actions/transaction.actions';
import TransactionUtils, {
  NB_TRANSACTION_FETCHED,
} from '@popup/hive/utils/transaction.utils';
import { Screen } from '@reference-data/screen.enum';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import { FormUtils } from 'src/utils/form.utils';

interface ExportTransactionsForm {
  startDate: string;
  endDate: string;
}

const exportTransactionsRules = FormUtils.createRules<ExportTransactionsForm>({
  startDate: Joi.string(),
  endDate: Joi.string(),
});

const MINIMUM_FETCHED_TRANSACTIONS = 1;

const ExportTransactions = ({
  activeAccount,
  setTitleContainerProperties,
  transactions,
  fetchAccountTransactions,
}: PropsFromRedux) => {
  let lastOperationFetched = -1;
  const { control, handleSubmit } = useForm<ExportTransactionsForm>({
    defaultValues: {
      startDate: '',
      endDate: '',
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_export_transactions',
      isBackButtonEnabled: true,
    });
    loadTransactions(activeAccount.name!);
    setLoading(true);
    init();
  }, []);

  useEffect(() => {
    loadTransactions(activeAccount.name!);
    setLoading(true);
  }, [activeAccount.name]);

  const loadTransactions = async (accountName: string) => {
    //TODO important:
    //  - 2 ways:
    //      -> manipulate const op = dHiveUtils.operationOrders; from params, when calling
    //          -> fetchAccountTransactions & later on in the call of: 'getAccountTransactions'
    lastOperationFetched = await TransactionUtils.getLastTransaction(
      accountName,
    );
    fetchAccountTransactions(accountName, lastOperationFetched);
  };

  useEffect(() => {
    console.log({ transactions }); //TODO remove line
    if (transactions.lastUsedStart !== -1) {
      if (
        transactions.list.length < MINIMUM_FETCHED_TRANSACTIONS &&
        !transactions.list.some((t) => t.last)
      ) {
        if (transactions.lastUsedStart === 1) {
          setLoading(false);
          return;
        }
        setLoading(true);
        fetchAccountTransactions(
          activeAccount.name!,
          transactions.lastUsedStart - NB_TRANSACTION_FETCHED,
        );
      } else {
        // setTimeout(() => {
        //   filterTransactions();
        // }, 0);
        // setLastTransactionIndex(
        //   ArrayUtils.getMinValue(transactions.list, 'index'),
        // );
        setLoading(false);
      }
    }
  }, [transactions]);

  const init = async () => {
    //TODo bellow if needed
  };

  const handleClickOnDownload = async (form: ExportTransactionsForm) => {
    console.log('handleClickOnDownload', { form, transactions }); //TODO remove line
    const start_date = form.startDate.trim().length
      ? form.startDate
      : undefined;
    const end_date = form.endDate.trim().length ? form.endDate : undefined;
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_EXPORT_TRANSACTIONS}-page`}
      className="export-transactions-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_pref_export_transactions_info')}
      </div>

      <SelectAccountSectionComponent fullSize background="white" />
      <LoadingComponent hide={!loading} />
      {!loading && (
        <FormContainer onSubmit={handleSubmit(handleClickOnDownload)}>
          <div className="form-fields">
            <FormInputComponent
              name="startDate"
              control={control}
              dataTestId="input-startDate"
              type={InputType.TEXT}
              placeholder="popup_html_start_date"
              label="popup_html_start_date"
            />
            <FormInputComponent
              name="endDate"
              control={control}
              dataTestId="input-endDate"
              type={InputType.TEXT}
              placeholder="popup_html_end_date"
              label="popup_html_end_date"
            />
            <ButtonComponent
              label="popup_html_download"
              dataTestId="export-transactions-download"
              onClick={handleSubmit(handleClickOnDownload)}
            />
          </div>
        </FormContainer>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    transactions: state.transactions as Transactions,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  fetchAccountTransactions,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ExportTransactionsComponent = connector(ExportTransactions);
