import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/hive/actions/loading.actions';
import { ExportTransactionUtils } from '@popup/hive/utils/export-transactions.utils';
import { Screen } from '@reference-data/screen.enum';
import Joi from 'joi';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
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
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const { control, handleSubmit } = useForm<ExportTransactionsForm>({
    defaultValues: {
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_export_transactions',
      isBackButtonEnabled: true,
    });
  }, []);

  const handleClickOnDownload = async (form: ExportTransactionsForm) => {
    addToLoadingList('popup_html_pref_export_transactions_loading_message');
    await ExportTransactionUtils.downloadTransactions(activeAccount.name!);
    removeFromLoadingList(
      'popup_html_pref_export_transactions_loading_message',
    );
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_EXPORT_TRANSACTIONS}-page`}
      className="export-transactions-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_pref_export_transactions_info')}
      </div>

      <SelectAccountSectionComponent fullSize background="white" />
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
        </div>
        <ButtonComponent
          label="popup_html_download"
          dataTestId="export-transactions-download"
          onClick={handleSubmit(handleClickOnDownload)}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ExportTransactionsComponent = connector(ExportTransactions);
