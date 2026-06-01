import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { ActionButton } from '@interfaces/action-button.interface';
import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { setStatus as setEvmStatus } from '@popup/evm/actions/app-status.actions';
import { setIsLedgerSupported } from '@popup/hive/actions/app-status.actions';
import { setHasFinishedSignup } from '@popup/multichain/actions/has-finished-signup.actions';
import { resetMessage } from '@popup/multichain/actions/message.actions';
import { setMk } from '@popup/multichain/actions/mk.actions';
import { ModalProperties } from '@popup/multichain/interfaces/modal.interface';
import { SignInRouterComponent } from '@popup/multichain/pages/sign-in/sign-in-router.component';
import { SignUpComponent } from '@popup/multichain/pages/sign-up/sign-up.component';
import { SignUpScreen } from '@popup/multichain/sign-up.context';
import { RootState } from '@popup/multichain/store';
import { UnlockedAppComponent } from '@popup/multichain/unlocked-app.component';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MessageContainerComponent } from 'src/common-ui/message-container/message-container.component';
import { ModalComponent } from 'src/common-ui/modal/modal.component';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';
import { CopyToastContainer } from 'src/common-ui/toast/copy-toast.component';
import { EvmLedgerUtils } from 'src/popup/evm/utils/evm-ledger.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import PopupUtils from 'src/utils/popup.utils';
import VaultUtils from 'src/utils/vault.utils';

type Props = { screen: SignUpScreen };

const ChainRouter = ({
  message,
  mk,
  setMk,
  setIsLedgerSupported,
  setEvmStatus,
  hasFinishedSignup,
  setHasFinishedSignup,
  resetMessage,
  modal,
}: Props & PropsFromRedux) => {
  const [hasHydratedMk, setHasHydratedMk] = useState(false);
  const [keylessKeychainEnabled, setKeylessKeychainEnabled] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    PopupUtils.fixPopupOnMacOs();
    initAutoLock();
    checkIfHasFinishedSignup();
    initMk();
    Promise.all([
      LedgerUtils.isLedgerSupported(),
      EvmLedgerUtils.isLedgerSupported(),
    ]).then(([isHiveLedgerSupported, isEvmLedgerSupported]) => {
      setIsLedgerSupported(isHiveLedgerSupported);
      setEvmStatus({ isLedgerSupported: isEvmLedgerSupported });
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.IS_LEDGER_SUPPORTED,
        isHiveLedgerSupported,
      );
    });
    LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
    ).then((enabled) => {
      setKeylessKeychainEnabled(!!enabled);
    });
  }, []);

  const initMk = async () => {
    try {
      const mkFromStorage = await VaultUtils.getValueFromVault(VaultKey.__MK);
      if (mkFromStorage) {
        setMk(mkFromStorage, false);
      }
    } finally {
      setHasHydratedMk(true);
    }
  };
  const checkIfHasFinishedSignup = async () => {
    let hasFinishedSignup: boolean =
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HAS_FINISHED_SIGNUP,
      )) || false;
    setTimeout(() => {
      setHasFinishedSignup(hasFinishedSignup);
    }, 500);
  };

  const initAutoLock = async () => {
    let autolock: Autolock = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    );
    if (
      autolock &&
      [AutoLockType.DEVICE_LOCK, AutoLockType.IDLE_LOCK].includes(autolock.type)
    ) {
      chrome.runtime.onMessage.addListener(onReceivedAutolockCmd);
    }
  };

  const onReceivedAutolockCmd = (message: BackgroundMessage) => {
    if (message.command === BackgroundCommand.LOCK_APP) {
      setMk('', false);
      chrome.runtime.onMessage.removeListener(onReceivedAutolockCmd);
    }
  };

  const renderChain = () => {
    const isKeylessKeychainEnabled = !!keylessKeychainEnabled;
    if (!mk || mk.length === 0) {
      if (!hasFinishedSignup && !isKeylessKeychainEnabled) {
        return <SignUpComponent />;
      } else {
        return <SignInRouterComponent />;
      }
    } else {
      return <UnlockedAppComponent />;
    }
  };

  const isRouterReady =
    hasHydratedMk &&
    hasFinishedSignup !== null &&
    keylessKeychainEnabled !== null;

  if (!isRouterReady) {
    return <SplashscreenComponent />;
  }

  return (
    <>
      {renderChain()}
      {message?.key && (
        <MessageContainerComponent
          message={message}
          onResetMessage={resetMessage}
        />
      )}
      {modal && <ModalComponent {...modal} />}
      <CopyToastContainer />
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    message: state.message,
    mk: state.mk,
    hasFinishedSignup: state.hasFinishedSignup,
    modal: state.modal as ModalProperties,
  };
};

const connector = connect(mapStateToProps, {
  setIsLedgerSupported,
  setEvmStatus,
  setMk,
  setHasFinishedSignup,
  resetMessage,
});
//TODO : setIsLedgerSupported : move out of appStatus with other global app statuses
type PropsFromRedux = ConnectedProps<typeof connector> & ActionButton;

export const ChainRouterComponent = connector(ChainRouter);
