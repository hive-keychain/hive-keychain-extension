import { Keys } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { ErrorUtils } from 'src/popup/hive/utils/error.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

enum SynchronizeLedgerStep {
  DISCOVER_ACCOUNTS = 'add_accounts_from_ledger',
  SELECT_ACCOUNTS = 'select_account_from_ledger',
  ADD_MISSING_KEYS = 'ledger_add_missing_keys_to',
  FINISHED = 'add_accounts_from_ledger_finished',
}

interface ImportAccountFrom {
  name: string;
  keys: Keys;
  useMasterKey: boolean;
  masterKey: string;
  errors: ImportAccountFormErrors;
}

interface ImportAccountFormErrors {
  [key: string]: string;
}

const AddAccountsComponent = () => {
  const [loading, setLoading] = useState(false);
  const [selectableAccounts, setSelectableAccounts] = useState<LocalAccount[]>(
    [],
  );
  const [currentAccount, setCurrentAccount] = useState(0);
  const [accountsForm, setAccountsForm] = useState<ImportAccountFrom[]>([]);
  const [step, setStep] = useState(SynchronizeLedgerStep.DISCOVER_ACCOUNTS);
  const [message, setMessage] = useState('');

  const [theme, setTheme] = useState<Theme>();
  useEffect(() => {
    initTheme();
  }, []);

  const initTheme = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    HiveTxUtils.setRpc(await RpcUtils.getCurrentRpc());
  };

  const discoverAccounts = async () => {
    setMessage('');
    setLoading(true);
    try {
      if (await LedgerUtils.init(true)) {
        let discoveredAccounts = await LedgerUtils.getAllAccounts();
        if (discoveredAccounts.length === 0) {
          setMessage('no_account_found_on_ledger_error');
          setStep(SynchronizeLedgerStep.FINISHED);
          return;
        }

        const filteredDiscoveredAccounts = await filterFromExistingAccounts(
          discoveredAccounts,
        );
        setSelectableAccounts(filteredDiscoveredAccounts);

        setAccountsForm(
          filteredDiscoveredAccounts.map((a) => {
            return {
              name: a.name,
              keys: {
                active: a.keys.active ?? '',
                activePubkey: a.keys.activePubkey ?? '',
                posting: a.keys.posting ?? '',
                postingPubkey: a.keys.postingPubkey ?? '',
                memo: a.keys.memo ?? '',
                memoPubkey: a.keys.memoPubkey ?? '',
              },
              useMasterKey: false,
              masterKey: '',
              errors: {},
            };
          }),
        );

        setLoading(false);
        if (filteredDiscoveredAccounts.length === 0) {
          setMessage('all_ledger_accounts_already_imported');
          setStep(SynchronizeLedgerStep.FINISHED);
          return;
        } else if (filteredDiscoveredAccounts.length === 1) {
          setStep(SynchronizeLedgerStep.ADD_MISSING_KEYS);
        } else {
          setStep(SynchronizeLedgerStep.SELECT_ACCOUNTS);
        }
      } else {
        Logger.error('Unable to detect Ledger');
        return;
      }
    } catch (err: any) {
      Logger.log(err);
      setLoading(false);
      setMessage(ErrorUtils.parseLedger(err).message);
    }
  };

  const toggleAccount = (account: LocalAccount) => {
    if (isSelected(account)) {
      setAccountsForm((oldAccountForms) =>
        oldAccountForms.filter((a) => a.name !== account.name),
      );
    } else {
      const accounts = [...accountsForm];
      accounts.push({
        name: account.name,
        keys: {
          active: account.keys.active ?? '',
          activePubkey: account.keys.activePubkey ?? '',
          posting: account.keys.posting ?? '',
          postingPubkey: account.keys.postingPubkey ?? '',
          memo: account.keys.memo ?? '',
          memoPubkey: account.keys.memoPubkey ?? '',
        },
        useMasterKey: false,
        masterKey: '',
        errors: {},
      });
      setAccountsForm(accounts);
    }
  };

  const isSelected = (account: LocalAccount) => {
    return !!accountsForm.find((a) => a.name === account.name);
  };

  const filterFromExistingAccounts = async (
    discoveredAccounts: LocalAccount[],
  ) => {
    const mk = await LocalStorageUtils.getValueFromSessionStorage(
      LocalStorageKeyEnum.__MK,
    );
    let localAccounts = await AccountUtils.getAccountsFromLocalStorage(mk);
    if (!localAccounts) return discoveredAccounts;
    return discoveredAccounts.filter((discoveredAccount) => {
      return localAccounts.find(
        (account) => account.name === discoveredAccount.name,
      )
        ? false
        : true;
    });
  };

  const processDiscoveredAccounts = async () => {
    setLoading(true);
    const localAccounts: LocalAccount[] = [];
    for (const accForm of accountsForm) {
      localAccounts.push({
        name: accForm.name,
        keys: accForm.keys,
      });
    }
    await AccountUtils.addMultipleAccounts(localAccounts);
    setMessage('add_accounts_from_ledger_sucessful');
    setStep(SynchronizeLedgerStep.FINISHED);
    setLoading(false);
  };

  const verifyForm = async () => {
    const accForm = accountsForm[currentAccount];
    let keys: Keys | null = accForm.keys;
    if (accForm.useMasterKey) {
      try {
        let importedKeys = await AccountUtils.getKeys(
          accForm.name,
          accForm.masterKey,
        );
        return { ...keys, ...importedKeys };
      } catch (err: any) {
        setError('master', currentAccount, err.message);
        return;
      }
    } else {
      if (
        accForm.keys.active &&
        !KeysUtils.isUsingLedger(accForm.keys.active)
      ) {
        try {
          const k = await AccountUtils.getKeys(
            accForm.name,
            accForm.keys.active,
          );
          keys = { ...keys, active: k.active, activePubkey: k.activePubkey };
        } catch (err: any) {
          setError('active', currentAccount, err.message);
          return;
        }
      }
      if (
        accForm.keys.posting &&
        !KeysUtils.isUsingLedger(accForm.keys.posting)
      ) {
        try {
          const k = await AccountUtils.getKeys(
            accForm.name,
            accForm.keys.posting,
          );
          keys = {
            ...keys,
            posting: k.posting,
            postingPubkey: k.postingPubkey,
          };
        } catch (err: any) {
          setError('posting', currentAccount, err.message);
          return;
        }
      }
      if (accForm.keys.memo && !KeysUtils.isUsingLedger(accForm.keys.memo)) {
        try {
          const k = await AccountUtils.getKeys(accForm.name, accForm.keys.memo);
          keys = { ...keys, memo: k.memo, memoPubkey: k.memoPubkey };
        } catch (err: any) {
          setError('memo', currentAccount, err.message);
          return;
        }
      }
    }
    return keys;
  };

  const selectAccounts = () => {
    setStep(SynchronizeLedgerStep.ADD_MISSING_KEYS);
  };

  const setUseMasterKey = (newValue: boolean, accountIndex: number) => {
    const newForm = [...accountsForm];
    newForm[accountIndex].useMasterKey = newValue;
    setAccountsForm(newForm);
  };

  const setMasterKey = (masterKey: string, accountIndex: number) => {
    const newForm = [...accountsForm];
    newForm[accountIndex].masterKey = masterKey;
    setAccountsForm(newForm);
  };
  const setActiveKey = (key: string, accountIndex: number) => {
    const newForm = [...accountsForm];
    newForm[accountIndex].keys.active = key;
    setAccountsForm(newForm);
  };
  const setPostingKey = (key: string, accountIndex: number) => {
    const newForm = [...accountsForm];
    newForm[accountIndex].keys.posting = key;
    setAccountsForm(newForm);
  };
  const setMemoKey = (key: string, accountIndex: number) => {
    const newForm = [...accountsForm];
    newForm[accountIndex].keys.memo = key;
    setAccountsForm(newForm);
  };

  const setError = (key: string, accountIndex: number, error: string) => {
    const newForm = [...accountsForm];
    newForm[accountIndex].errors[key] = error;
    setAccountsForm(newForm);
  };
  const resetErrors = () => {
    const newForm = [...accountsForm];
    newForm[currentAccount].errors = {};
    setAccountsForm(newForm);
  };

  const goNextPage = async () => {
    setLoading(true);
    const keys = await verifyForm();
    setLoading(false);
    if (keys) {
      const newForm = [...accountsForm];
      newForm[currentAccount].keys = keys;
      setAccountsForm(newForm);
      if (accountsForm.length - 1 === currentAccount) {
        await processDiscoveredAccounts();
      } else {
        setCurrentAccount(currentAccount + 1);
        resetErrors();
      }
    }
  };

  return (
    <div className={`theme ${theme} connect-ledger`}>
      <div className="title-panel">
        <SVGIcon icon={NewIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">{chrome.i18n.getMessage(step)}</div>
      </div>

      {step === SynchronizeLedgerStep.DISCOVER_ACCOUNTS && (
        <div className="account-discovery">
          <div className="caption">
            {chrome.i18n.getMessage('ledger_account_discovery_caption')}
          </div>
          <div className="error">{chrome.i18n.getMessage(message)}</div>
          <div className="fill-space"></div>
          <ButtonComponent
            label="synchronize_ledger_button"
            onClick={discoverAccounts}
          />
        </div>
      )}
      {step === SynchronizeLedgerStep.SELECT_ACCOUNTS && (
        <div className="select-accounts">
          <div className="caption">
            {chrome.i18n.getMessage('ledger_select_account_caption')}
          </div>
          <div className="list">
            {selectableAccounts.map((sa) => (
              <CheckboxPanelComponent
                key={sa.name}
                title={sa.name}
                skipTranslation
                checked={isSelected(sa)}
                onChange={() => toggleAccount(sa)}
              />
            ))}
          </div>
          <div className="fill-space"></div>
          <ButtonComponent
            label="ledger_select_accounts"
            onClick={selectAccounts}
          />
        </div>
      )}

      {step === SynchronizeLedgerStep.ADD_MISSING_KEYS && (
        <div className="add-missing-keys">
          <div className="caption">
            {chrome.i18n.getMessage('ledger_add_missing_keys_caption')}
          </div>
          <div className="username">@{accountsForm[currentAccount].name}</div>
          <div className="missing-keys">
            <CheckboxPanelComponent
              checked={accountsForm[currentAccount].useMasterKey}
              onChange={(value) => setUseMasterKey(value, currentAccount)}
              title="ledger_add_key_use_master_key"
            />

            {accountsForm[currentAccount].useMasterKey && (
              <InputComponent
                value={accountsForm[currentAccount].masterKey}
                onChange={(value) => setMasterKey(value, currentAccount)}
                label="popup_html_master"
                placeholder="popup_html_master"
                type={InputType.TEXT}
                hint={accountsForm[currentAccount].errors?.master}
              />
            )}
            {!accountsForm[currentAccount].useMasterKey && (
              <>
                {!KeysUtils.isUsingLedger(
                  accountsForm[currentAccount].keys.active!,
                ) && (
                  <InputComponent
                    value={accountsForm[currentAccount].keys.active}
                    onChange={(value) => setActiveKey(value, currentAccount)}
                    label="popup_html_active"
                    placeholder="popup_html_active"
                    type={InputType.TEXT}
                    hint={accountsForm[currentAccount].errors?.active}
                  />
                )}
                {!KeysUtils.isUsingLedger(
                  accountsForm[currentAccount].keys.posting!,
                ) && (
                  <InputComponent
                    value={accountsForm[currentAccount].keys.posting}
                    onChange={(value) => setPostingKey(value, currentAccount)}
                    label="popup_html_posting"
                    placeholder="popup_html_posting"
                    type={InputType.TEXT}
                    hint={accountsForm[currentAccount].errors?.posting}
                  />
                )}
                {!KeysUtils.isUsingLedger(
                  accountsForm[currentAccount].keys.memo!,
                ) && (
                  <InputComponent
                    value={accountsForm[currentAccount].keys.memo}
                    onChange={(value) => setMemoKey(value, currentAccount)}
                    label="popup_html_memo"
                    placeholder="popup_html_memo"
                    type={InputType.TEXT}
                    hint={accountsForm[currentAccount].errors?.memo}
                  />
                )}
              </>
            )}
          </div>
          <div className="fill-space"></div>
          <div className="bottom-button-panel">
            {currentAccount !== 0 && accountsForm.length > 1 && (
              <ButtonComponent
                label="popup_html_previous"
                onClick={() => setCurrentAccount(currentAccount - 1)}
                type={ButtonType.ALTERNATIVE}
              />
            )}

            {accountsForm.length >= 1 && (
              <ButtonComponent
                label="popup_html_next"
                onClick={() => goNextPage()}
              />
            )}
          </div>
        </div>
      )}

      {step === SynchronizeLedgerStep.FINISHED && (
        <>
          <div>{chrome.i18n.getMessage(message)}</div>
          <div className="fill-space"></div>
          <div className="bottom-button-panel">
            <ButtonComponent
              label="popup_html_close"
              onClick={() => window.close()}
            />
          </div>
        </>
      )}

      <LoadingComponent hide={!loading} />
    </div>
  );
};

export default AddAccountsComponent;
