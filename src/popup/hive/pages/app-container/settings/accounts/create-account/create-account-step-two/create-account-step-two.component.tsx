import { PrivateKey } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  AccountCreationType,
  AccountCreationUtils,
  GeneratedKeys,
} from '@popup/hive/utils/account-creation.utils';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';
import { addAccount } from 'src/popup/hive/actions/account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { navigateTo } from 'src/popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import FormatUtils from 'src/utils/format.utils';

import './create-account-step-two.component.scss';

const CreateAccountStepTwo = ({
  navParams,
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
  addAccount,
  addToLoadingList,
  removeFromLoadingList,
  navigateTo,
}: PropsFromRedux) => {
  const emptyKeys = {
    owner: { public: '', private: '' },
    active: { public: '', private: '' },
    posting: { public: '', private: '' },
    memo: { public: '', private: '' },
  } as GeneratedKeys;

  const [masterKey, setMasterKey] = useState('');
  const [generatedKeys, setGeneratedKeys] = useState(emptyKeys);
  const [keysTextVersion, setKeysTextVersion] = useState('');

  const accountName = navParams?.newUsername;
  const price = navParams?.price;
  const creationType = navParams?.creationType;
  const selectedAccount = navParams?.usedAccount as LocalAccount;

  const [paymentUnderstanding, setPaymentUnderstanding] = useState(false);
  const [safelyCopied, setSafelyCopied] = useState(false);
  const [notPrimaryStorageUnderstanding, setNotPrimaryStorageUnderstanding] =
    useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_create_account',
      isBackButtonEnabled: true,
    });
    generateMasterKey();
  }, []);

  useEffect(() => {
    if (masterKey === '') {
      setGeneratedKeys(emptyKeys);
      return;
    }
    const posting = PrivateKey.fromLogin(accountName, masterKey, 'posting');
    const active = PrivateKey.fromLogin(accountName, masterKey, 'active');
    const memo = PrivateKey.fromLogin(accountName, masterKey, 'memo');
    const owner = PrivateKey.fromLogin(accountName, masterKey, 'owner');

    setGeneratedKeys({
      owner: {
        private: owner.toString(),
        public: owner.createPublic().toString(),
      },
      active: {
        private: active.toString(),
        public: active.createPublic().toString(),
      },
      posting: {
        private: posting.toString(),
        public: posting.createPublic().toString(),
      },
      memo: {
        private: memo.toString(),
        public: memo.createPublic().toString(),
      },
    });
  }, [masterKey]);

  useEffect(() => {
    if (masterKey.length) {
      setKeysTextVersion(generateKeysTextVersion());
    } else {
      setKeysTextVersion('');
    }
    setNotPrimaryStorageUnderstanding(false);
    setSafelyCopied(false);
  }, [generatedKeys]);

  const generateMasterKey = async () => {
    if (accountName.length < 3) {
      setMasterKey('');
      setErrorMessage('html_popup_create_account_username_too_short');
      return;
    }
    if (!AccountCreationUtils.validateUsername(accountName)) {
      setMasterKey('');
      setErrorMessage('html_popup_create_account_account_name_not_valid');
      return;
    }
    if (await AccountCreationUtils.checkAccountNameAvailable(accountName)) {
      setMasterKey(AccountCreationUtils.generateMasterKey());
    } else {
      setMasterKey('');
      setErrorMessage('html_popup_create_account_username_already_used');
    }
  };

  const copyAllKeys = () => {
    navigator.clipboard.writeText(
      FormatUtils.removeHtmlTags(generateKeysTextVersion()),
    );
    setSuccessMessage('popup_html_copied');
  };

  const generateKeysTextVersion = () => {
    return `
    <span class='username'>Account name: @${accountName}</span><br/>
    <span class="key-name">Master password:</span><br/>
    ${masterKey}<br/>
    -----------------------------------------<br/>
    <span class="key-name">Owner key:</span><br/>
    <span class="key-type">Private</span><br/>
    ${generatedKeys.owner.private}<br/>
    <span class="key-type">Public</span><br/>
    ${generatedKeys.owner.public}<br/>
    -----------------------------------------<br/>
    <span class="key-name">Active key:</span><br/>
    <span class="key-type">Private</span><br/>
    ${generatedKeys.active.private}<br/>
    <span class="key-type">Public</span><br/>
    ${generatedKeys.active.public}<br/>
    -----------------------------------------<br/>
    <span class="key-name">Posting key:</span><br/>
    <span class="key-type">Private</span><br/>
    ${generatedKeys.posting.private}<br/>
    <span class="key-type">Public</span><br/>
    ${generatedKeys.posting.public}<br/>
    -----------------------------------------<br/>
    <span class="key-name">Memo key:</span><br/>
    <span class="key-type">Private</span><br/>
    ${generatedKeys.memo.private}<br/>
    <span class="key-type">Public</span><br/>
    ${generatedKeys.memo.public}`;
  };

  const createAccount = async () => {
    if (
      paymentUnderstanding &&
      safelyCopied &&
      notPrimaryStorageUnderstanding
    ) {
      addToLoadingList('html_popup_creating_account');
      try {
        const result = await AccountCreationUtils.createAccount(
          creationType,
          accountName,
          selectedAccount.name!,
          selectedAccount.keys.active!,
          AccountCreationUtils.generateAccountAuthorities(generatedKeys),
          price,
          generatedKeys,
        );

        if (result) {
          setSuccessMessage('html_popup_create_account_successful');
          addAccount(result as LocalAccount);
          navigateTo(Screen.HOME_PAGE, true);
        } else {
          setErrorMessage('html_popup_create_account_failed');
        }
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        removeFromLoadingList('html_popup_creating_account');
      }
    } else {
      setErrorMessage('html_popup_create_account_need_accept_terms_condition');
      return;
    }
  };

  const getPaymentCheckboxLabel = () => {
    switch (creationType) {
      case AccountCreationType.BUYING:
        return chrome.i18n.getMessage(
          'html_popup_create_account_buy_method_message',
          [price.toString(), selectedAccount.name],
        );
      case AccountCreationType.USING_TICKET:
        return chrome.i18n.getMessage(
          'html_popup_create_account_claim_account_method_message',
          [selectedAccount.name],
        );
    }
  };

  return (
    <div
      className="create-account-step-two"
      data-testid={`${Screen.CREATE_ACCOUNT_PAGE_STEP_TWO}-page`}>
      {keysTextVersion.length > 0 && (
        <>
          <div
            className="keys-display"
            dangerouslySetInnerHTML={{
              __html: keysTextVersion,
            }}></div>

          <CheckboxComponent
            title={getPaymentCheckboxLabel()}
            skipTranslation
            checked={paymentUnderstanding}
            onChange={() => {
              setPaymentUnderstanding(!paymentUnderstanding);
            }}></CheckboxComponent>
          <CheckboxComponent
            title="html_popup_create_account_safely_copied_keys"
            checked={safelyCopied}
            onChange={() => {
              setSafelyCopied(!safelyCopied);
            }}></CheckboxComponent>
          <CheckboxComponent
            title="html_popup_create_account_storage_understanding"
            checked={notPrimaryStorageUnderstanding}
            onChange={() => {
              setNotPrimaryStorageUnderstanding(
                !notPrimaryStorageUnderstanding,
              );
            }}></CheckboxComponent>
          <div className="button-panel">
            <ButtonComponent
              label="html_popup_copy"
              onClick={() => copyAllKeys()}
            />
            <ButtonComponent
              label="html_popup_create"
              onClick={() => createAccount()}
            />
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    accounts: state.accounts,
    navParams: state.navigation.params,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
  addAccount,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const CreateAccountStepTwoComponent = connector(CreateAccountStepTwo);
