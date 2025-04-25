import { KeychainApi } from '@api/keychain';
import type {
  AccountWitnessVoteOperation,
  WitnessUpdateOperation,
} from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import {
  LastSigningKeys,
  Witness,
  WitnessInfo,
  WitnessParamsForm,
} from '@interfaces/witness.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  CurrencyPrices,
  FormatUtils,
  GlobalProperties,
} from 'hive-keychain-commons';
import moment from 'moment';
import Config from 'src/config';
import { GovernanceUtils } from 'src/popup/hive/utils/governance.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const WITNESS_DISABLED_KEY =
  'STM1111111111111111111111111111111114T1Anm';

/* istanbul ignore next */
const voteWitness = async (
  witness: Witness,
  voter: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    true,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(
    witnessOperation,
    voter,
    activeKey,
    options,
  );
};
/* istanbul ignore next */
const unvoteWitness = async (
  witness: Witness,
  voter: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    false,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(
    witnessOperation,
    voter,
    activeKey,
    options,
  );
};
/* istanbul ignore next */
const updateWitnessVote = async (
  voter: string,
  witness: Witness,
  approve: boolean,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    approve,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(
    witnessOperation,
    voter,
    activeKey,
    options,
  );
};
/* istanbul ignore next */
const sendWitnessOperation = async (
  witnessOperation: AccountWitnessVoteOperation,
  username: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(username);

  return await HiveTxUtils.sendOperation(
    [witnessOperation],
    activeKey,
    false,
    options,
  );
};
/* istanbul ignore next */
const getWitnessVoteOperation = (
  approve: boolean,
  voter: string,
  witnessName: string,
) => {
  return [
    'account_witness_vote',
    {
      account: voter,
      approve: approve,
      witness: witnessName,
    },
  ] as AccountWitnessVoteOperation;
};
/* istanbul ignore next */
const getUpdateWitnessTransaction = (
  voter: string,
  witness: Witness,
  approve: boolean,
) => {
  return HiveTxUtils.createTransaction([
    WitnessUtils.getWitnessVoteOperation(approve, voter, witness.name),
  ]);
};

const getWitnessAccountUpdateOperation = (
  witnessAccountName: string,
  witnessParamsForm: WitnessParamsForm,
) => {
  return [
    'witness_update',
    {
      owner: witnessAccountName,
      url: witnessParamsForm.url,
      block_signing_key: witnessParamsForm.signingKey,
      props: {
        account_creation_fee: `${Number(
          witnessParamsForm.accountCreationFee,
        ).toFixed(3)} HIVE`,
        maximum_block_size: Number(witnessParamsForm.maximumBlockSize),
        hbd_interest_rate: Number(witnessParamsForm.hbdInterestRate) * 100,
      },
      fee: '0.000 HIVE',
    },
  ] as WitnessUpdateOperation;
};

const updateWitnessParameters = async (
  witnessAccountName: string,
  witnessParamsForm: WitnessParamsForm,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  const witnessAccountUpdateOperation = getWitnessAccountUpdateOperation(
    witnessAccountName,
    witnessParamsForm,
  );
  return await HiveTxUtils.sendOperation(
    [witnessAccountUpdateOperation],
    activeKey,
    true,
    options,
  );
};

const getWitnessInfo = async (
  username: string,
  globalProperties: GlobalProperties,
  currencyPrices: CurrencyPrices,
): Promise<WitnessInfo> => {
  let resultFromAPI, resultFromBlockchain;
  [resultFromAPI, resultFromBlockchain] = await Promise.all([
    await KeychainApi.get(`hive/witness/${username}`),
    await HiveTxUtils.getData('database_api.find_witnesses', {
      owners: [username],
    }),
  ]);
  resultFromBlockchain = resultFromBlockchain.witnesses[0];

  const lastFeedUpdate = `${resultFromBlockchain.last_hbd_exchange_update}Z`;

  const witnessInfo: WitnessInfo = {
    username: resultFromBlockchain.owner,
    votesCount: resultFromAPI.votes_count,
    voteValueInHP: FormatUtils.nFormatter(
      FormatUtils.toHP(
        (Number(resultFromAPI.votes) / 1000000).toString(),
        globalProperties.globals,
      ),
      3,
    ),
    blockMissed: resultFromBlockchain.total_missed,
    lastBlock: resultFromBlockchain.last_confirmed_block_num,
    lastBlockUrl: `https://hiveblocks.com/b/${resultFromBlockchain.last_confirmed_block_num}`,
    priceFeed: FormatUtils.fromNaiAndSymbol(
      resultFromBlockchain.hbd_exchange_rate.base,
    ),
    priceFeedUpdatedAt: moment(lastFeedUpdate),
    priceFeedUpdatedAtWarning: wasUpdatedAfterThreshold(moment(lastFeedUpdate)),
    signingKey: resultFromBlockchain.signing_key,
    url: resultFromBlockchain.url,
    version: resultFromBlockchain.running_version,
    isDisabled: resultFromBlockchain.signing_key === WITNESS_DISABLED_KEY,
    params: {
      accountCreationFee: FormatUtils.getAmountFromNai(
        resultFromBlockchain.props.account_creation_fee,
      ),
      accountCreationFeeFormatted: FormatUtils.fromNaiAndSymbol(
        resultFromBlockchain.props.account_creation_fee,
      ),
      maximumBlockSize: resultFromBlockchain.props.maximum_block_size,
      hbdInterestRate: resultFromBlockchain.props.hbd_interest_rate / 100,
    },
    rewards: {
      lastMonthValue: resultFromAPI.lastMonthValue,
      lastMonthInHP: FormatUtils.toFormattedHP(
        resultFromAPI.lastMonthValue,
        globalProperties.globals!,
      ),
      lastMonthInUSD: FormatUtils.getUSDFromVests(
        resultFromAPI.lastMonthValue,
        globalProperties,
        currencyPrices,
      ),
      lastWeekValue: resultFromAPI.lastWeekValue,
      lastWeekInHP: FormatUtils.toFormattedHP(
        resultFromAPI.lastWeekValue,
        globalProperties.globals!,
      ),
      lastWeekInUSD: FormatUtils.getUSDFromVests(
        resultFromAPI.lastWeekValue,
        globalProperties,
        currencyPrices,
      ),
      lastYearValue: resultFromAPI.lastYearValue,
      lastYearInHP: FormatUtils.toFormattedHP(
        resultFromAPI.lastYearValue,
        globalProperties.globals!,
      ),
      lastYearInUSD: FormatUtils.getUSDFromVests(
        resultFromAPI.lastYearValue,
        globalProperties,
        currencyPrices,
      ),
    },
  };
  return witnessInfo;
};
const wasUpdatedAfterThreshold = (updatedAt: moment.Moment) => {
  const now = moment.utc();
  var duration = moment.duration(now.diff(updatedAt.utc()));
  var hours = duration.asHours();

  return hours > Config.witnesses.feedWarningLimitInHours;
};

const getLastSigningKeyForWitness = async (username: string) => {
  const result: LastSigningKeys =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.WITNESS_LAST_SIGNING_KEY,
    );
  return result ? result[username] : null;
};

const saveLastSigningKeyForWitness = async (username: string, key: string) => {
  let result: LastSigningKeys =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.WITNESS_LAST_SIGNING_KEY,
    );
  if (!result) {
    result = {};
  }
  result[username] = key;
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.WITNESS_LAST_SIGNING_KEY,
    result,
  );
};

const WitnessUtils = {
  unvoteWitness,
  voteWitness,
  getWitnessVoteOperation,
  sendWitnessOperation,
  updateWitnessVote,
  getUpdateWitnessTransaction,
  updateWitnessParameters,
  getWitnessInfo,
  wasUpdatedAfterThreshold,
  getLastSigningKeyForWitness,
  saveLastSigningKeyForWitness,
};

export default WitnessUtils;
