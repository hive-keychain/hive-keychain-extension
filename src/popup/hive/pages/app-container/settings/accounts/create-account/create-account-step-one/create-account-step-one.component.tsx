import { Asset } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  AccountCreationType,
  AccountCreationUtils,
} from '@popup/hive/utils/account-creation.utils';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { Icons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { navigateToWithParams } from 'src/popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import HiveUtils from 'src/popup/hive/utils/hive.utils';

import './create-account-step-one.component.scss';

interface SelectOption {
  label: string;
  value: string;
}

const CreateAccountStepOne = ({
  activeAccount,
  accounts,
  currencyLabels,
  setErrorMessage,
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [accountOptions, setAccountOptions] = useState<SelectOption[]>();
  const [selectedAccount, setSelectedAccount] = useState<SelectOption>();
  const [accountName, setAccountName] = useState('');
  const [price, setPrice] = useState(3);
  const [creationType, setCreationType] = useState<AccountCreationType>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_create_account',
      isBackButtonEnabled: true,
    });
    initPrice();
  }, []);

  const initPrice = async () => {
    setPrice(await HiveUtils.getAccountPrice());
  };

  useEffect(() => {
    setSelectedAccount({
      label: `@${activeAccount.name!}`,
      value: activeAccount.name!,
    });
  }, [activeAccount]);

  useEffect(() => {
    initAccountOptions();
  }, [accounts]);

  const initAccountOptions = async () => {
    const options = [];
    for (const account of accounts as LocalAccount[]) {
      options.push({
        label: `@${account.name!}`,
        value: account.name!,
      });
    }
    setAccountOptions(options);
  };

  useEffect(() => {
    onSelectedAccountChanged(selectedAccount?.value!);
  }, [selectedAccount]);

  const onSelectedAccountChanged = async (username: string) => {
    if (!selectedAccount) {
      return;
    }
    const account = (await AccountUtils.getExtendedAccount(username)) as any;

    if (account.pending_claimed_accounts > 0) {
      setPrice(0);
      setCreationType(AccountCreationType.USING_TICKET);
    } else {
      setPrice(3);
      setCreationType(AccountCreationType.BUYING);
    }
  };

  const validateAccountName = async () => {
    if (accountName.length < 3) {
      setErrorMessage('html_popup_create_account_username_too_short');
      return false;
    }
    if (!AccountCreationUtils.validateUsername(accountName)) {
      setErrorMessage('html_popup_create_account_account_name_not_valid');
      return false;
    }
    if (await AccountCreationUtils.checkAccountNameAvailable(accountName)) {
      return true;
    } else {
      setErrorMessage('html_popup_create_account_username_already_used');
      return false;
    }
  };

  const customLabelRender = (selectProps: SelectRenderer<SelectOption>) => {
    return (
      <div
        className="selected-account-panel"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        <img
          src={`https://images.hive.blog/u/${selectProps.props.values[0].value}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div
          className="selected-account-name"
          data-testid="selected-account-name">
          {selectProps.props.values[0].label}
        </div>
      </div>
    );
  };
  const customItemRender = (selectProps: SelectItemRenderer<SelectOption>) => {
    return (
      <div
        data-testid={`select-account-item-${selectProps.item.value}`}
        className={`select-account-item ${
          selectProps.props.values[0]?.label === selectProps.item.value
            ? 'selected'
            : ''
        }`}
        onClick={() => {
          setSelectedAccount(selectProps.item);
          selectProps.methods.dropDown('close');
        }}>
        <img
          src={`https://images.hive.blog/u/${selectProps.item.value}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="account-name">{selectProps.item.label}</div>
      </div>
    );
  };

  const getPriceLabel = () => {
    switch (creationType) {
      case AccountCreationType.BUYING:
        return `${price} ${currencyLabels.hive}`;
      case AccountCreationType.USING_TICKET:
        return chrome.i18n.getMessage('html_popup_ticket', ['1']);
    }
  };

  const goToNextPage = async () => {
    if (await validateAccountName()) {
      const account = await AccountUtils.getExtendedAccount(
        selectedAccount?.value!,
      );
      const balance = Asset.fromString(account.balance.toString());
      if (
        creationType === AccountCreationType.USING_TICKET ||
        (creationType === AccountCreationType.BUYING && balance.amount >= 3)
      ) {
        navigateToWithParams(Screen.CREATE_ACCOUNT_PAGE_STEP_TWO, {
          usedAccount: accounts.find(
            (localAccount: LocalAccount) =>
              localAccount.name === selectedAccount?.value,
          ),
          newUsername: accountName,
          creationType: creationType,
          price: price,
        });
      } else {
        setErrorMessage('html_popup_account_creation_not_enough_found');
      }
    }
  };

  return (
    <div
      data-testid={`${Screen.CREATE_ACCOUNT_PAGE_STEP_ONE}-page`}
      className="create-account-step-one">
      {selectedAccount && accountOptions && (
        <Select
          values={[selectedAccount]}
          options={accountOptions}
          onChange={() => undefined}
          contentRenderer={customLabelRender}
          itemRenderer={customItemRender}
          className="select-operation-type select-dropdown"
        />
      )}
      <div className="price-panel">
        <span className="label">
          {chrome.i18n.getMessage('html_popup_price')}
        </span>
        <span className="price">{getPriceLabel()}</span>
      </div>
      <InputComponent
        onChange={setAccountName}
        value={accountName}
        logo={Icons.AT}
        placeholder="popup_html_username"
        label="popup_html_username"
        type={InputType.TEXT}
      />
      <ButtonComponent
        label="html_popup_next"
        onClick={() => goToNextPage()}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    accounts: state.accounts,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const CreateAccountStepOneComponent = connector(CreateAccountStepOne);
