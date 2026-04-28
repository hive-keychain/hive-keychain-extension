import { createHiveAccountCreationQuote } from '@api/hive-account-creation';
import {
  HiveAccountCreationPayment,
  HiveAccountCreationPaymentCurrency,
  PendingHiveAccountCreationRequest,
} from '@interfaces/hive-account-creation.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  AccountCreationUtils,
  GeneratedKeys,
} from '@popup/hive/utils/account-creation.utils';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { PendingHiveAccountCreationUtils } from 'src/utils/pending-hive-account-creation.utils';

const createPendingPaidHiveAccountCreation = async (
  username: string,
  generatedKeys: GeneratedKeys,
  paymentCurrency: HiveAccountCreationPaymentCurrency,
  mk: string,
): Promise<PendingHiveAccountCreationRequest> => {
  const authorities =
    AccountCreationUtils.generateAccountAuthorities(generatedKeys);
  const quote = await createHiveAccountCreationQuote({
    username,
    authorities,
    paymentCurrency,
  });
  const pendingAccount = {
    name: username,
    keys: {
      active: generatedKeys.active.private,
      activePubkey: generatedKeys.active.public,
      posting: generatedKeys.posting.private,
      postingPubkey: generatedKeys.posting.public,
      memo: generatedKeys.memo.private,
      memoPubkey: generatedKeys.memo.public,
    },
  } as LocalAccount;
  const encryptedAccount = await EncryptUtils.encryptJson(
    { list: [pendingAccount] },
    mk,
  );
  const payment = quote.payment as HiveAccountCreationPayment;

  return await PendingHiveAccountCreationUtils.savePendingHiveAccountCreationRequest(
    {
      requestId: quote.requestId,
      username: quote.username,
      encryptedAccount,
      paymentCurrency: payment.asset,
      paymentAddress: payment.account,
      memo: payment.memo,
      amount: payment.amount,
      expiresAt: quote.expiresAt,
      status: quote.status,
    },
    mk,
  );
};

export const PaidAccountCreationUtils = {
  createPendingPaidHiveAccountCreation,
};
