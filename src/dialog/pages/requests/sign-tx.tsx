import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSignTx,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React, { useState } from 'react';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { buildSignTxReview } from 'src/utils/sign-tx.utils';

type Props = {
  data: RequestSignTx & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const SummaryField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="field">
    <div className="label">{label}</div>
    <div className="value">{children}</div>
  </div>
);

const SignTx = (props: Props) => {
  const { data } = props;
  const [advancedConfirmed, setAdvancedConfirmed] = useState(false);
  const rawTransaction = JSON.stringify(data.tx, undefined, 2);
  const review = buildSignTxReview(data.tx);

  const requiresExplicitApproval = !!review?.requiresExplicitApproval;
  const confirmDisabled =
    !review || (requiresExplicitApproval && !advancedConfirmed);
  const warningHeader =
    review?.warningHeader ||
    'Unable to safely summarize this raw transaction. It cannot be approved as a blind signing request.';
  const warningItems =
    review?.warningItems || [
      'This request could not be safely summarized. Review the raw transaction details carefully.',
    ];
  const shouldUseRedHeader =
    !review ||
    requiresExplicitApproval ||
    !!review?.hasHighRiskOperation ||
    !!review?.hasLargePayload ||
    !!review?.hasMultipleOperations;

  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_sign_tx')}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}
      header={warningHeader}
      redHeader={shouldUseRedHeader}
      confirmDisabled={confirmDisabled}>
      <UsernameWithAvatar title="dialog_account" username={data.username} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_key" content={data.method} />
      {review && (
        <>
          <Separator type={'horizontal'} fullSize />
          <SummaryField label="Expiration">
            {review.expirationDisplay}
          </SummaryField>
          <SummaryField label="Operation count">
            {review.operationCount}
          </SummaryField>
          <SummaryField label="Operation types">
            <ul>
              {review.operationTypes.map((type, index) => (
                <li key={`${type}-${index}`}>
                  {index + 1}. {type}
                </li>
              ))}
            </ul>
          </SummaryField>
          <SummaryField label="Transaction summary">
            <div>
              {review.operations.map((operation) => (
                <div key={`${operation.type}-${operation.index}`}>
                  <strong>
                    {operation.index + 1}. {operation.summary}
                  </strong>
                  {operation.details.length > 0 && (
                    <ul>
                      {operation.details.map((detail, detailIndex) => (
                        <li key={`${operation.type}-detail-${detailIndex}`}>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </SummaryField>
          <SummaryField label="Warnings">
            <ul>
              {warningItems.map((warning, index) => (
                <li key={`warning-${index}`}>{warning}</li>
              ))}
            </ul>
          </SummaryField>
          {review.signatureCount > 0 && (
            <SummaryField label="Existing signatures">
              {review.signatureCount}
            </SummaryField>
          )}
        </>
      )}
      {!review && (
        <>
          <Separator type={'horizontal'} fullSize />
          <SummaryField label="Warnings">
            <ul>
              {warningItems.map((warning, index) => (
                <li key={`warning-${index}`}>{warning}</li>
              ))}
            </ul>
          </SummaryField>
        </>
      )}
      {requiresExplicitApproval && (
        <CheckboxPanelComponent
          checked={advancedConfirmed}
          onChange={setAdvancedConfirmed}
          skipTranslation
          title="I reviewed the advanced details and want to sign this partially summarized raw transaction."
        />
      )}
      <CollaspsibleItem
        title="Advanced details"
        content={rawTransaction}
        pre
        skipTitleTranslation
      />
    </Operation>
  );
};

export default SignTx;
