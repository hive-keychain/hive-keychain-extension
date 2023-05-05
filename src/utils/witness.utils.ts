import { KeychainApi } from '@api/keychain';
import {
  AccountWitnessVoteOperation,
  WitnessUpdateOperation,
} from '@hiveio/dhive';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { Key } from '@interfaces/keys.interface';
import {
  Witness,
  WitnessInfo,
  WitnessParamsForm,
} from '@interfaces/witness.interface';
import moment from 'moment';
import FormatUtils from 'src/utils/format.utils';
import { GovernanceUtils } from 'src/utils/governance.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

export const WITNESS_DISABLED_KEY =
  'STM1111111111111111111111111111111114T1Anm';

/* istanbul ignore next */
const voteWitness = async (witness: Witness, voter: string, activeKey: Key) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    true,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, activeKey);
};
/* istanbul ignore next */
const unvoteWitness = async (
  witness: Witness,
  voter: string,
  activeKey: Key,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    false,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, activeKey);
};
/* istanbul ignore next */
const updateWitnessVote = async (
  voter: string,
  witness: Witness,
  approve: boolean,
  activeKey: Key,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    approve,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, activeKey);
};
/* istanbul ignore next */
const sendWitnessOperation = async (
  witnessOperation: AccountWitnessVoteOperation,
  username: string,
  activeKey: Key,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(username);

  return await HiveTxUtils.sendOperation([witnessOperation], activeKey);
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
        account_creation_fee: `${witnessParamsForm.accountCreationFee.toFixed(
          3,
        )} HIVE`,
        maximum_block_size: witnessParamsForm.maximumBlockSize,
        hbd_interest_rate: witnessParamsForm.hbdInterestRate * 100,
      },
      fee: '0.000 HIVE',
    },
  ] as WitnessUpdateOperation;
};

const updateWitnessParameters = async (
  witnessAccountName: string,
  witnessParamsForm: WitnessParamsForm,
  activeKey: Key,
) => {
  const witnessAccountUpdateOperation = getWitnessAccountUpdateOperation(
    witnessAccountName,
    witnessParamsForm,
  );
  return await HiveTxUtils.sendOperation(
    [witnessAccountUpdateOperation],
    activeKey,
  );
};

const getWitnessInfo = async (
  username: string,
  globalProperties: GlobalProperties,
): Promise<WitnessInfo> => {
  const result = await KeychainApi.get(`hive/witness/${username}`);
  return {
    username: result.name,
    votesCount: result.votes_count,
    voteValueInHP: FormatUtils.nFormatter(
      FormatUtils.toHP(
        (Number(result.votes) / 1000000).toString(),
        globalProperties.globals,
      ),
      3,
    ),
    blockMissed: result.total_missed,
    lastBlock: result.last_confirmed_block_num,
    lastBlockUrl: `https://hiveblocks.com/b/${result.last_confirmed_block_num}`,
    priceFeed: `${result.hbd_exchange_rate_base} ${result.hbd_exchange_rate_base_symbol}`,
    priceFeedUpdatedAt: moment(result.last_hbd_exchange_update),
    priceFeedUpdatedAtWarning: wasUpdatedAfterThreshold(
      moment(result.last_hbd_exchange_update),
    ),
    lastMonthValue: result.lastMonthValue,
    lastWeekValue: result.lastWeekValue,
    lastYearValue: result.lastYearValue,
    signingKey: result.signing_key,
    url: result.url,
    version: result.running_version,
    isDisabled: result.signing_key === WITNESS_DISABLED_KEY,
    params: {
      accountCreationFee: result.account_creation_fee,
      accountCreationFeeFormatted: `${result.account_creation_fee.toFixed(3)} ${
        result.account_creation_fee_symbol
      }`,
      maximumBlockSize: result.maximum_block_size,
      hbdInterestRate: result.hbd_interest_rate / 100,
    },
  };
};
const wasUpdatedAfterThreshold = (updatedAt: moment.Moment) => {
  const now = moment();
  var duration = moment.duration(now.diff(updatedAt));
  var hours = duration.asHours();

  // const lasUpdateTimestamp = new Date(last_hbd_exchange_update).getTime();
  // const lastUpdateHoursMs = Date.now() - lasUpdateTimestamp;
  // let seconds = Math.floor(lastUpdateHoursMs / 1000);
  // let minutes = Math.floor(seconds / 60);
  // let hours = Math.floor(minutes / 60);
  return hours > 5;
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
};

export default WitnessUtils;
