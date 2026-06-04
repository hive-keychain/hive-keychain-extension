import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { ActionButton } from '@interfaces/action-button.interface';
import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { setStatus as setEvmStatus } from '@popup/evm/actions/app-status.actions';
import { setIsLedgerSupported } from '@popup/hive/actions/app-status.actions';
import { setHasFinishedSignup } from '@popup/multichain/actions/has-finished-signup.actions';
import { navigateToPaidHiveAccountCreation } from '@popup/multichain/actions/hive-promotion.actions';
import { resetMessage } from '@popup/multichain/actions/message.actions';
import { setMk } from '@popup/multichain/actions/mk.actions';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import { ModalProperties } from '@popup/multichain/interfaces/modal.interface';
import { EvmOnlyHivePromotionPopupComponent } from '@popup/multichain/pages/evm-only-hive-promotion-popup/evm-only-hive-promotion-popup.component';
import { SignInRouterComponent } from '@popup/multichain/pages/sign-in/sign-in-router.component';
import { SignUpComponent } from '@popup/multichain/pages/sign-up/sign-up.component';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
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
import { EvmOnlyHivePromotionUtils } from 'src/utils/evm-only-hive-promotion.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import PopupUtils from 'src/utils/popup.utils';
import VaultUtils from 'src/utils/vault.utils';

type Props = { screen: SignUpScreen };
const EVM_ONLY_HIVE_PROMOTION_SNOOZE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

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
  openModal,
  closeModal,
  navigateToPaidHiveAccountCreation,
  nav,
  currentPage,
}: Props & PropsFromRedux) => {
  const [hasHydratedMk, setHasHydratedMk] = useState(false);
  const [hasHandledEvmOnlyHivePromotion, setHasHandledEvmOnlyHivePromotion] =
    useState(false);
  const [keylessKeychainEnabled, setKeylessKeychainEnabled] = useState<
    boolean | null
  >(null);
  const isRouterReady =
    hasHydratedMk &&
    hasFinishedSignup !== null &&
    keylessKeychainEnabled !== null;

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

  useEffect(() => {
    if (
      !isRouterReady ||
      hasHandledEvmOnlyHivePromotion ||
      modal ||
      !mk ||
      mk.length === 0
    ) {
      return;
    }

    let isCancelled = false;
    const sensitiveFlowActive = nav?.currentPage !== MultichainScreen.HOME_PAGE;
    const handleCreateHiveAccountPromotion = async () => {
      closeModal();
      await navigateToPaidHiveAccountCreation();
    };

    const maybeShowPromotion = async () => {
      const shouldShowPromotion =
        await EvmOnlyHivePromotionUtils.getEvmOnlyHivePromotionEligibility({
          mk,
          walletUnlocked: true,
          sensitiveFlowActive,
        });

      if (isCancelled || !shouldShowPromotion) {
        return;
      }

      openModal({
        title: '',
        closeOnOverlayClick: false,
        showCloseButton: false,
        children: (
          <EvmOnlyHivePromotionPopupComponent
            onCreateHiveAccount={handleCreateHiveAccountPromotion}
            onMaybeLater={() => {
              const snoozedUntil = new Date(
                Date.now() + EVM_ONLY_HIVE_PROMOTION_SNOOZE_DAYS * DAY_MS,
              );
              void EvmOnlyHivePromotionUtils.snoozeEvmOnlyHivePromotion(
                snoozedUntil,
              );
              closeModal();
            }}
            onDontShowAgain={() => {
              void EvmOnlyHivePromotionUtils.dismissEvmOnlyHivePromotionPermanently();
              closeModal();
            }}
          />
        ),
      });
      setHasHandledEvmOnlyHivePromotion(true);
      await EvmOnlyHivePromotionUtils.setEvmOnlyHivePromotionLastShown();
    };

    void maybeShowPromotion();

    return () => {
      isCancelled = true;
    };
  }, [
    closeModal,
    hasHandledEvmOnlyHivePromotion,
    isRouterReady,
    mk,
    modal,
    nav?.currentPage,
    navigateToPaidHiveAccountCreation,
    openModal,
  ]);

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
    setHasFinishedSignup(hasFinishedSignup);
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
    nav: state.navigation.stack[0],
    currentPage: state.navigation.stack[0],
  };
};

const connector = connect(mapStateToProps, {
  setIsLedgerSupported,
  setEvmStatus,
  setMk,
  setHasFinishedSignup,
  resetMessage,
  openModal,
  closeModal,
  navigateToPaidHiveAccountCreation,
});
//TODO : setIsLedgerSupported : move out of appStatus with other global app statuses
type PropsFromRedux = ConnectedProps<typeof connector> & ActionButton;

export const ChainRouterComponent = connector(ChainRouter);
