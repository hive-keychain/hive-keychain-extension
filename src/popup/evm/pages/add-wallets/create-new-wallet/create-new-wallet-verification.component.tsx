import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { MathUtils } from 'src/utils/math.utils';

const CreateNewWalletVerification = ({
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
  wallet,
  mk,
  setEvmAccounts,
}: PropsType) => {
  const [hiddenWordIndexes, setHiddenWordIndexes] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const missingWordsInput = useRef<HTMLInputElement | null>(null);

  const [allWordsVerified, setAllWordsVerified] = useState(false);
  const [safelyCopied, setSafelyCopied] = useState(false);
  const [notPrimaryStorageUnderstanding, setNotPrimaryStorageUnderstanding] =
    useState(false);

  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    setTitleContainerProperties({
      title: 'html_popup_evm_create_wallet_verification_title',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: true,
    });

    const randoms = MathUtils.generateOrderedRandomWithoutDuplicates(0, 11, 3);
    setHiddenWordIndexes(randoms);
    if (wallet.mnemonic) {
      const displayedWords = wallet.mnemonic?.phrase
        .split(' ')
        .map((w, index) => {
          return randoms.includes(index) ? '' : w;
        });
      setWords(displayedWords);
    }
  }, []);

  useEffect(() => {
    if (missingWordsInput && missingWordsInput.current)
      missingWordsInput.current.focus();
  }, [missingWordsInput]);

  const submitForm = async (): Promise<void> => {
    if (!safelyCopied || !notPrimaryStorageUnderstanding) {
      setErrorMessage('html_popup_evm_create_wallet_condition_missing');
      return;
    }

    const derivedWallet = wallet.deriveChild(0);
    const account: EvmAccount = {
      id: derivedWallet.index,
      path: derivedWallet.path!,
      wallet: derivedWallet,
      seedId: 0,
    };
    await EvmWalletUtils.addSeedAndAccounts(wallet, [account], mk, nickname);
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
  };

  const verifyWord = () => {
    const newWords = [...words];
    if (
      wallet.mnemonic?.phrase.split(' ')[
        hiddenWordIndexes[currentWordIndex]
      ] === currentWord
    ) {
      newWords[hiddenWordIndexes[currentWordIndex]] = currentWord;
      setWords(newWords);
      setCurrentWord('');
      setCurrentWordIndex((old) => old + 1);
      setAllWordsVerified(currentWordIndex >= hiddenWordIndexes.length - 1);
    } else {
      setErrorMessage(
        'html_popup_evm_create_wallet_verification_verify_word_error',
      );
    }
  };

  return (
    <div
      data-testid={`${Screen.CREATE_EVM_WALLET_VERIFICATION}-page`}
      className="create-new-wallet-verification-page">
      <FormContainer>
        <div className="caption">
          {chrome.i18n.getMessage(
            'html_popup_evm_create_wallet_verification_caption',
          )}
        </div>
        <InputComponent
          value={nickname}
          onChange={setNickname}
          type={InputType.TEXT}
          label="evm_address_nickname"
          placeholder="evm_address_nickname"
        />
        <div className="mnemonic-container">
          <div className={`words-container`}>
            {hiddenWordIndexes.length &&
              words.length > 0 &&
              words.map((word, index) => (
                <div
                  className={`word-card ${
                    hiddenWordIndexes.includes(index) && word.length === 0
                      ? 'empty'
                      : ''
                  } ${
                    hiddenWordIndexes.includes(index) && word.length > 0
                      ? 'filled'
                      : ''
                  } `}
                  key={`word-card-${index}`}>
                  <span className="number">{index + 1}</span>
                  {word}
                </div>
              ))}
          </div>
        </div>
        {!allWordsVerified && (
          <InputComponent
            ref={missingWordsInput}
            value={currentWord}
            onChange={setCurrentWord}
            onEnterPress={() => verifyWord()}
            label={chrome.i18n.getMessage(
              'html_popup_evm_create_wallet_verification_enter_word',
              [(hiddenWordIndexes[currentWordIndex] + 1).toString()],
            )}
            skipLabelTranslation
            type={InputType.TEXT}
          />
        )}
        {allWordsVerified && (
          <>
            <CheckboxPanelComponent
              title="html_popup_evm_create_wallet_safely_copied_seed"
              checked={safelyCopied}
              onChange={() => {
                setSafelyCopied(!safelyCopied);
              }}></CheckboxPanelComponent>
            <CheckboxPanelComponent
              title="html_popup_evm_create_wallet_storage_understanding"
              checked={notPrimaryStorageUnderstanding}
              onChange={() => {
                setNotPrimaryStorageUnderstanding(
                  !notPrimaryStorageUnderstanding,
                );
              }}></CheckboxPanelComponent>
          </>
        )}
        <div className="fill-space"></div>
        <ButtonComponent
          dataTestId="submit-button"
          label={'popup_html_submit'}
          onClick={submitForm}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    wallet: state.navigation.stack[0].params as HDNodeWallet,
    mk: state.mk,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
  setEvmAccounts,
});
type PropsType = ConnectedProps<typeof connector>;

export const CreateNewWalletVerificationComponent = connector(
  CreateNewWalletVerification,
);
