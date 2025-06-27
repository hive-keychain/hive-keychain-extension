import { LocalAccount } from '@interfaces/local-account.interface';
import {
  AccountCreationType,
  AccountCreationUtils,
  GeneratedKeys,
} from '@popup/hive/utils/account-creation.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { FormatUtils } from 'hive-keychain-commons';
import { PrivateKey } from 'hive-tx';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { addAccount } from 'src/popup/hive/actions/account.actions';

const SUBSTRING_LENGTH = 15;
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
  const [hasCopied, setHasCopied] = useState(false);

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
    setHasCopied(true);

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
    if (!hasCopied) {
      setErrorMessage('html_popup_create_account_need_copy');
      return;
    }
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
          <div className="keys-card">
            <div className="key-name">Account name: @{accountName}</div>
            <div className="key-name">Master password</div>
            <div className="key">
              {`${masterKey?.substring(SUBSTRING_LENGTH, 0)}...${masterKey
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
          </div>

          <div className="keys-card">
            <div className="key-name">Owner key</div>
            <div className="key-label">Private</div>
            <div className="key">
              {`${generatedKeys.owner.private?.substring(
                SUBSTRING_LENGTH,
                0,
              )}...${generatedKeys.owner.private
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
            <div className="key-label">Public</div>
            <div className="key">
              {`${generatedKeys.owner.public?.substring(
                SUBSTRING_LENGTH,
                0,
              )}...${generatedKeys.owner.public
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
          </div>

          <div className="keys-card">
            <div className="key-name">Active Key</div>
            <div className="key-label">Private</div>
            <div className="key">
              {`${generatedKeys.active.private?.substring(
                SUBSTRING_LENGTH,
                0,
              )}...${generatedKeys.active.private
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
            <div className="key-label">Public</div>
            <div className="key">
              {`${generatedKeys.active.public?.substring(
                SUBSTRING_LENGTH,
                0,
              )}...${generatedKeys.active.public
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
          </div>

          <div className="keys-card">
            <div className="key-name">Posting Key</div>
            <div className="key-label">Private</div>
            <div className="key">
              {`${generatedKeys.posting.private?.substring(
                SUBSTRING_LENGTH,
                0,
              )}...${generatedKeys.posting.private
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
            <div className="key-label">Public</div>
            <div className="key">
              {`${generatedKeys.posting.public?.substring(
                SUBSTRING_LENGTH,
                0,
              )}...${generatedKeys.posting.public
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
          </div>
          <div className="keys-card">
            <div className="key-name">Memo Key</div>
            <div className="key-label">Private</div>
            <div className="key">
              {`${generatedKeys.memo.private?.substring(
                SUBSTRING_LENGTH,
                0,
              )}...${generatedKeys.memo.private
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
            <div className="key-label">Public</div>
            <div className="key">
              {`${generatedKeys.memo.public?.substring(
                SUBSTRING_LENGTH,
                0,
              )}...${generatedKeys.memo.public
                ?.toString()
                .slice(-SUBSTRING_LENGTH)}`}
            </div>
          </div>
          <div className="agree-section">
            <CheckboxPanelComponent
              title={getPaymentCheckboxLabel()}
              skipTranslation
              checked={paymentUnderstanding}
              onChange={() => {
                setPaymentUnderstanding(!paymentUnderstanding);
              }}></CheckboxPanelComponent>
            <CheckboxPanelComponent
              title="html_popup_create_account_safely_copied_keys"
              checked={safelyCopied}
              onChange={() => {
                setSafelyCopied(!safelyCopied);
              }}></CheckboxPanelComponent>
            <CheckboxPanelComponent
              title="html_popup_create_account_storage_understanding"
              checked={notPrimaryStorageUnderstanding}
              onChange={() => {
                setNotPrimaryStorageUnderstanding(
                  !notPrimaryStorageUnderstanding,
                );
              }}></CheckboxPanelComponent>
          </div>
          <div className="button-panel">
            <ButtonComponent
              label="html_popup_copy"
              onClick={() => copyAllKeys()}
              type={ButtonType.ALTERNATIVE}
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
    activeAccount: state.hive.activeAccount,
    accounts: state.hive.accounts,
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
