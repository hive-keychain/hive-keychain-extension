import { KeychainApi } from '@api/keychain';
import { FormContainer } from '@common-ui/_containers/form-container/form-container.component';
import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { Card } from '@common-ui/card/card.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { EvmAddressComponent } from '@common-ui/evm/evm-address/evm-address.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { LabelComponent } from '@common-ui/label/label.component';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import ServiceUnavailablePage from '@common-ui/service-unavailable-page/service-unavailable-page.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { ExtendedChain, LiFiStep, TokenExtended } from '@lifi/types';
import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { LiFiTokenFilter } from '@popup/evm/pages/home/evm-lifi-swap/lifi-token-filter/lifi-token-filter.component';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { Erc20Abi, LiFiAbi } from '@popup/evm/reference-data/abi.data';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { LiFiUtils } from '@popup/evm/utils/lifi.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { goBack } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { ethers, Wallet } from 'ethers';
import { FormatUtils } from 'hive-keychain-commons';
import { throttle, ThrottleSettings } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Config from 'src/config';

interface EvmSwapForm {
  fromSelectedToken: TokenExtended | null;
  toSelectedToken: TokenExtended | null;
  fromSelectedChain: ExtendedChain | null;
  toSelectedChain: ExtendedChain | null;
  amount: number;
  approvalAmount: number | null;
  currentAllowance: number | null;
  slippage: number;
  receiverAddress: string;
}

export const EvmLifiSwap = ({
  setTitleContainerProperties,
  setErrorMessage,
  goBack,
  activeChain,
  activeAccount,
}: PropsFromRedux) => {
  const [form, setForm] = useState<EvmSwapForm>({
    fromSelectedToken: null,
    toSelectedToken: null,
    fromSelectedChain: null,
    toSelectedChain: null,
    amount: 0,
    approvalAmount: null,
    currentAllowance: null,
    slippage: 0.5,
    receiverAddress: '',
  });

  const [fromTokenList, setFromTokenList] = useState<OptionItem[]>([]);
  const [toTokenList, setToTokenList] = useState<OptionItem[]>([]);
  const [chainList, setChainList] = useState<OptionItem[]>([]);
  const [tokenList, setTokenList] = useState<OptionItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [underMaintenance, setUnderMaintenance] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<
    number | null
  >(null);

  const [advancedParametersPanelOpened, setAdvancedParametersPanelOpened] =
    useState(false);

  const [lifiQuote, setLifiQuote] = useState<LiFiStep>();

  const throttledRefresh = useMemo(() => {
    return throttle(
      (newAmount, newEndToken, newStartToken, newToChain, newFromChain) => {
        if (parseFloat(newAmount) > 0 && newEndToken && newStartToken) {
          getEstimate(
            newAmount,
            newEndToken,
            newStartToken,
            newToChain,
            newFromChain,
            activeAccount.wallet.address,
            form.receiverAddress,
          );
          setAutoRefreshCountdown(Config.swaps.autoRefreshPeriodSec);
        }
      },
      1000,
      { leading: false } as ThrottleSettings,
    );
  }, []);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_token_swaps',
      isBackButtonEnabled: true,
    });
    initList();
    return () => {
      throttledRefresh.cancel();
    };
  }, []);

  useEffect(() => {
    if (form.fromSelectedChain) {
      const tokens = filterTokenList(form.fromSelectedChain, '');
      setFromTokenList(tokens);
      setForm((prev) => ({ ...prev, fromSelectedToken: tokens[0].value }));
    }
  }, [form.fromSelectedChain]);

  useEffect(() => {
    if (form.toSelectedChain) {
      const tokens = filterTokenList(form.toSelectedChain, '');
      setToTokenList(tokens);
      setForm((prev) => ({ ...prev, toSelectedToken: tokens[1].value }));
    }
  }, [form.toSelectedChain]);

  useEffect(() => {
    throttledRefresh(
      form.amount,
      form.fromSelectedToken,
      form.toSelectedToken,
      form.toSelectedChain,
      form.fromSelectedChain,
    );
  }, [form.amount, form.fromSelectedToken, form.toSelectedToken]);

  useEffect(() => {
    if (autoRefreshCountdown === null) {
      return;
    }

    if (
      autoRefreshCountdown === 0 &&
      form.fromSelectedToken &&
      form.toSelectedToken &&
      form.amount
    ) {
      getEstimate(
        form.amount,
        form.fromSelectedToken,
        form.toSelectedToken,
        form.toSelectedChain!,
        form.fromSelectedChain!,
        activeAccount.wallet.address,
        form.receiverAddress,
      );
      setAutoRefreshCountdown(Config.swaps.autoRefreshPeriodSec);
      return;
    }

    const estimateTimeout = setTimeout(() => {
      setAutoRefreshCountdown(autoRefreshCountdown! - 1);
    }, 1000);

    return () => {
      clearTimeout(estimateTimeout);
    };
  }, [autoRefreshCountdown]);

  useEffect(() => {
    refreshAllowance();
  }, [form.fromSelectedToken, form.amount]);

  const refreshAllowance = async () => {
    if (form.fromSelectedToken && form.amount > 0) {
      const chain: EvmChain = await ChainUtils.getChain<EvmChain>(
        `0x${form.fromSelectedChain!.id.toString(16)}`,
      );
      const allowance = await EvmTokensUtils.getAllowance(
        chain,
        activeAccount.wallet.address,
        form.fromSelectedToken.address,
      );

      let approvalAmount = 0;
      if (allowance < form.amount) {
        approvalAmount = form.amount;
      }
      setForm((prev) => ({
        ...prev,
        currentAllowance: allowance,
        approvalAmount: approvalAmount,
      }));
    }
  };

  const initList = async () => {
    const optionsLists = await LiFiUtils.getLiFiSwapOptionLists();

    setTokenList(optionsLists.tokens);
    setChainList(optionsLists.chains);

    const chainItem = optionsLists.chains.find(
      (chainOption) => chainOption.value.id === Number(activeChain.chainId),
    );
    setForm((prev) => ({
      ...prev,
      fromSelectedChain: chainItem!.value,
      toSelectedChain: chainItem!.value,
    }));

    setLoading(false);
  };

  const filterTokenList = (chain: ExtendedChain, query: string) => {
    if (chain.id === 0) {
      return tokenList;
    } else {
      return tokenList.filter(
        (token) =>
          token.value.chainId === chain.id &&
          (token.label.toLowerCase().includes(query.toLowerCase()) ||
            token.subLabel?.toLowerCase().includes(query.toLowerCase())),
      );
    }
  };

  const getEstimate = async (
    amount: number,
    fromToken: TokenExtended,
    toToken: TokenExtended,
    toChain: ExtendedChain,
    fromChain: ExtendedChain,
    fromAddress: string,
    toAddress: string,
  ) => {
    console.log(
      fromChain,
      fromToken,
      toChain,
      toToken,
      amount,
      fromAddress,
      toAddress,
    );
    try {
      const quote = await KeychainApi.post('evm/lifi/quote', {
        fromChain: fromChain.id,
        fromToken: fromToken.address,
        toChain: toChain.id,
        toToken: toToken.address,
        amount: EvmFormatUtils.formatTokenValue(amount, toToken.decimals),
        fromAddress,
        toAddress: toAddress?.length > 0 ? toAddress : null,
      });
      console.log(quote);
      if (quote) {
        setLifiQuote({
          ...quote,
          estimate: {
            ...quote.estimate,
            fromAmount: EvmFormatUtils.formatTokenValue(
              quote.estimate.fromAmount,
              -fromToken.decimals,
            ),
            toAmount: EvmFormatUtils.formatTokenValue(
              quote.estimate.toAmount,
              -toToken.decimals,
            ),
            feeCosts: quote.estimate.feeCosts.map((fee: any) => ({
              ...fee,
              amount: EvmFormatUtils.formatTokenValue(
                Number(fee.amount),
                -Number(fee.token.decimals),
              ),
            })),
          },
        });
      } else {
        setErrorMessage('swap_error_getting_estimate');
      }
    } catch (error) {
      setErrorMessage('swap_error_getting_estimate');
    }
  };

  const processCancel = () => {
    goBack();
  };

  const processSwap = async () => {
    if (form.approvalAmount && form.approvalAmount > 0) {
      let fields = [
        {
          label: 'popup_html_transfer_from',
          value: (
            <EvmAddressComponent
              address={activeAccount.address}
              chainId={activeChain.chainId}
            />
          ),
        },
        {
          label: 'popup_html_transfer_to',
          value: (
            <EvmAddressComponent
              address={form.receiverAddress}
              chainId={activeChain.chainId}
            />
          ),
        },
        {
          label: 'popup_html_transfer_amount',
          value: (
            <div className="value-content-horizontal">
              {form.fromSelectedToken && (
                <EvmTokenLogo
                  tokenInfo={
                    {
                      logo: form.fromSelectedToken.logoURI!,
                      name: form.fromSelectedToken.name,
                      symbol: form.fromSelectedToken.symbol,
                    } as EvmSmartContractInfo
                  }
                />
              )}
              <span>{`${FormatUtils.withCommas(form.amount.toString(), form.toSelectedToken?.decimals ?? 18, true)} ${
                form.fromSelectedToken?.symbol ?? ''
              }`}</span>
            </div>
          ),
        },
        {
          label: 'popup_html_transfer_amount',
          value: (
            <div className="value-content-horizontal">
              {form.toSelectedToken && (
                <EvmTokenLogo
                  tokenInfo={
                    {
                      logo: form.toSelectedToken.logoURI!,
                      name: form.toSelectedToken.name,
                      symbol: form.toSelectedToken.symbol,
                    } as EvmSmartContractInfo
                  }
                />
              )}
              <span>{`${FormatUtils.withCommas(form.amount.toString(), form.toSelectedToken?.decimals ?? 18, true)} ${
                form.toSelectedToken?.symbol ?? ''
              }`}</span>
            </div>
          ),
        },
      ];

      let approveTransactionData: ProviderTransactionData = {
        from: activeAccount.address,
        type: EvmTransactionType.EIP_1559,
        to: form.toSelectedToken?.address,
        data: await encodeApproveData(
          form.toSelectedToken?.address!,
          form.amount,
          lifiQuote?.estimate.approvalAddress!,
        ),
        value: '0x0',
      };

      console.log(lifiQuote, approveTransactionData);
      let swapTransactionData: ProviderTransactionData = {
        from: activeAccount.address,
        type: EvmTransactionType.EIP_1559,
        to: lifiQuote!.transactionRequest!.to,
        data: lifiQuote!.transactionRequest!.data!,
        value: '0x0',
      };

      return;
    }
  };

  const encodeApproveData = async (
    contractAddress: string,
    approvalAmount: number,
    approvalAddress: string,
  ) => {
    const provider = await EthersUtils.getProvider(activeChain);
    const connectedWallet = new Wallet(
      activeAccount.wallet.signingKey,
      provider,
    );
    const contract = new ethers.Contract(
      contractAddress,
      Erc20Abi,
      connectedWallet,
    );
    return contract.interface.encodeFunctionData('approve', [
      approvalAddress,
      approvalAmount,
    ]);
  };

  const encodeSwapData = async (contractAddress: string, amount: number) => {
    const provider = await EthersUtils.getProvider(activeChain);
    const connectedWallet = new Wallet(
      activeAccount.wallet.signingKey,
      provider,
    );
    const contract = new ethers.Contract(
      contractAddress,
      LiFiAbi,
      connectedWallet,
    );

    return contract.interface.encodeFunctionData(
      'swapTokensSingleV3ERC20ToERC20',
      [amount],
    );
  };

  return (
    <div className="evm-lifi-swap-page">
      <FormContainer>
        {!loading && (
          <div className="evm-lifi-swap-page-content">
            <div className="countdown">
              {!!autoRefreshCountdown && (
                <>
                  {
                    <span>
                      {chrome.i18n.getMessage(
                        'swap_autorefresh',
                        autoRefreshCountdown + '',
                      )}
                    </span>
                  }
                </>
              )}
            </div>
            {lifiQuote && (
              <Card className="tool-details-card">
                <div className="tool-details-title">
                  <img
                    src={`https://docs.li.fi/mintlify-assets/_mintlify/favicons/lifi/luYFsl4agEbmIn0Z/_generated/favicon/favicon-32x32.png`}
                    className="tool-logo"
                  />
                  <div className="tool-name">
                    {chrome.i18n.getMessage('evm_processed_by', ['LiFi'])}
                  </div>
                </div>
              </Card>
            )}

            <LabelComponent
              value="html_popup_swap_swap_from"
              className="swap-label"
            />
            {form && form.fromSelectedToken && form.fromSelectedChain && (
              <div className="evm-lifi-swap-chain-token-selectors">
                <ComplexeCustomSelect
                  options={fromTokenList}
                  selectedItem={LiFiUtils.getTokenOptionItem(
                    form.fromSelectedToken!,
                    form.fromSelectedChain!,
                  )}
                  setSelectedItem={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      fromSelectedToken: value.value,
                    }))
                  }
                  generateImageIfNull
                  filterable
                  customFilter={
                    <>
                      {form.fromSelectedChain && (
                        <LiFiTokenFilter
                          options={chainList}
                          selectedItem={LiFiUtils.getChainOptionItem(
                            form.fromSelectedChain!,
                          )}
                          setSelectedItem={(value) =>
                            setForm((prev) => ({
                              ...prev,
                              fromSelectedChain: value.value,
                            }))
                          }
                          onQueryChanged={(query) => {
                            setFromTokenList(
                              filterTokenList(form.fromSelectedChain!, query),
                            );
                          }}
                        />
                      )}
                    </>
                  }
                />
                <InputComponent
                  type={InputType.NUMBER}
                  value={form.amount}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, amount: value }))
                  }
                  placeholder="popup_html_transfer_amount"
                />
              </div>
            )}

            <SVGIcon icon={SVGIcons.SWAPS_SWITCH} className="swap-icon" />

            <LabelComponent
              value="html_popup_swap_swap_to"
              className="swap-label"
            />
            {form && form.toSelectedChain && form.toSelectedToken && (
              <div className="evm-lifi-swap-chain-token-selectors">
                <ComplexeCustomSelect
                  options={toTokenList}
                  selectedItem={LiFiUtils.getTokenOptionItem(
                    form.toSelectedToken!,
                    form.toSelectedChain!,
                  )}
                  setSelectedItem={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      toSelectedToken: value.value,
                    }))
                  }
                  generateImageIfNull
                  filterable
                  customFilter={
                    <>
                      {form.toSelectedChain && (
                        <LiFiTokenFilter
                          options={chainList}
                          selectedItem={LiFiUtils.getChainOptionItem(
                            form.toSelectedChain!,
                          )}
                          setSelectedItem={(value) =>
                            setForm((prev) => ({
                              ...prev,
                              toSelectedChain: value.value,
                            }))
                          }
                          onQueryChanged={(query) => {
                            setToTokenList(
                              filterTokenList(form.toSelectedChain!, query),
                            );
                          }}
                        />
                      )}
                    </>
                  }
                />
                <InputComponent
                  type={InputType.NUMBER}
                  value={lifiQuote?.estimate.toAmount ?? 0}
                  onChange={() => {}}
                  placeholder="popup_html_transfer_amount"
                  disabled
                />
              </div>
            )}

            <div className="advanced-parameters">
              <div
                className="title-panel"
                onClick={() =>
                  setAdvancedParametersPanelOpened(
                    !advancedParametersPanelOpened,
                  )
                }>
                <div className="title">
                  {chrome.i18n.getMessage('swap_advanced_parameters')}
                </div>
                <SVGIcon
                  icon={SVGIcons.GLOBAL_ARROW}
                  onClick={() =>
                    setAdvancedParametersPanelOpened(
                      !advancedParametersPanelOpened,
                    )
                  }
                  className={`advanced-parameters-toggle ${
                    advancedParametersPanelOpened ? 'open' : 'closed'
                  }`}
                />
              </div>
              {advancedParametersPanelOpened && (
                <div className="advanced-parameters-container">
                  <InputComponent
                    label="evm_swap_receiver_address"
                    type={InputType.TEXT}
                    value={form.receiverAddress}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, receiverAddress: value }))
                    }
                  />
                  <InputComponent
                    type={InputType.NUMBER}
                    min={5}
                    step={1}
                    value={form.slippage}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, slippage: value }))
                    }
                    label="html_popup_swaps_slipperage"
                    placeholder="html_popup_swaps_slipperage"
                  />
                  {form.fromSelectedToken &&
                    form.fromSelectedToken.address !==
                      '0x0000000000000000000000000000000000000000' && (
                      <InputComponent
                        type={InputType.NUMBER}
                        value={form.approvalAmount}
                        onChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            approvalAmount: value,
                          }))
                        }
                        label="evm_swap_approval_amount"
                        placeholder="evm_swap_approval_amount"
                      />
                    )}
                </div>
              )}
            </div>

            <div className="fill-space"></div>

            <div className="evm-lifi-swap-page-content-buttons">
              <ButtonComponent
                type={ButtonType.ALTERNATIVE}
                label="popup_html_button_label_cancel"
                onClick={processCancel}
              />
              <ButtonComponent
                type={ButtonType.IMPORTANT}
                label="html_popup_swaps_process_swap"
                onClick={processSwap}
              />
            </div>
          </div>
        )}
        {loading && (
          <div className="evm-lifi-swap-page-loading">
            <RotatingLogoComponent />
          </div>
        )}
      </FormContainer>
      {underMaintenance && (
        <div className="maintenance-mode">
          <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
          <div className="text">
            {chrome.i18n.getMessage('swap_under_maintenance')}
          </div>
        </div>
      )}
      {serviceUnavailable && <ServiceUnavailablePage />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    activeChain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  goBack,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmLifiSwapComponent = connector(EvmLifiSwap);
