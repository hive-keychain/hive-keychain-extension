import { KeychainKeyTypes } from 'hive-keychain-commons';
import { TransactionOptions } from '@interfaces/keys.interface';
import { addCaptionToLoading } from '@popup/multichain/actions/loading.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { EvmConfirmationPageContent } from 'src/common-ui/confirmation-page/evm-confirmation-page.component';
import { HiveConfirmationPageContent } from 'src/common-ui/confirmation-page/hive-confirmation-page.component';
import { PortfolioInAppConfirmationContext } from 'src/portfolio/portfolio-in-app-confirmation.interface';
import { PortfolioEvmApprovalConfirmation } from 'src/portfolio/ui/portfolio-evm-approval-confirmation.component';

import './portfolio-confirmation-step.component.scss';

type OwnProps = {
  context: PortfolioInAppConfirmationContext;
  onDismiss: () => void;
};

type Props = OwnProps & ConnectedProps<typeof connector>;

const PortfolioConfirmationStep = ({
  context,
  onDismiss,
  setErrorMessage,
  addCaptionToLoading,
  tokens,
}: Props) => {
  if (context.kind === 'evm') {
    if (context.approveTransactionData) {
      return (
        <div className="portfolio-confirmation-step">
          <PortfolioEvmApprovalConfirmation
            context={context}
            onDismiss={onDismiss}
            setErrorMessage={setErrorMessage}
          />
        </div>
      );
    }
    return (
      <div className="portfolio-confirmation-step">
        <EvmConfirmationPageContent
          embedded
          onDismiss={onDismiss}
          message={context.message}
          title="portfolio"
          fields={context.fields}
          hasGasFee
          wallet={context.account.wallet}
          chain={context.chain}
          activeAccount={context.activeAccountOverride}
          selectedAccount={context.activeAccountOverride}
          transactionData={context.transactionData}
          tokenInfo={context.fromTokenInfo}
          amount={context.swapAmount}
          afterConfirmAction={context.onConfirm}
          setErrorMessage={setErrorMessage}
        />
      </div>
    );
  }

  return (
    <div className="portfolio-confirmation-step">
      <HiveConfirmationPageContent
        embedded
        onDismiss={onDismiss}
        message={context.message}
        title="portfolio"
        method={KeychainKeyTypes.active}
        fields={context.fields}
        activeAccount={context.activeAccount}
        tokens={tokens}
        afterConfirmAction={(params) =>
          context.onConfirm(params as TransactionOptions)
        }
        addCaptionToLoading={addCaptionToLoading}
      />
    </div>
  );
};

const connector = connect(
  (state: RootState) => ({
    tokens: state.hive.tokens,
  }),
  {
    setErrorMessage,
    addCaptionToLoading,
  },
);

export const PortfolioConfirmationStepComponent = connector(
  PortfolioConfirmationStep,
);
