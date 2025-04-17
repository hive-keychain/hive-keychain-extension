/* istanbul ignore file */
import { VscStakingOperation } from 'hive-keychain-commons';
import Joi from 'joi';

const arrayPublicKeys = Joi.array().items(Joi.string());
const username = Joi.string().required().min(3);
const method = Joi.string()
  .valid('Posting', 'Active', 'Memo', 'posting', 'active', 'memo')
  .required();
const authority = Joi.string()
  .valid('Posting', 'Active', 'posting', 'active')
  .required();
const strictAuthority = Joi.string().valid('Posting', 'Active').required();
const message = Joi.string().required().min(2).regex(/^#/);
const currency = Joi.string().valid('HIVE', 'HBD', 'TESTS', 'TBD').required();
const amount = Joi.string()
  .regex(/^\d+(\.\d{3})$/)
  .required()
  .error(new Error('Amount requires a string with 3 decimals'));
const vscOperation = Joi.string()
  .valid(VscStakingOperation.STAKING, VscStakingOperation.UNSTAKING)
  .required();
const amountToken = Joi.string()
  .regex(/^\d+(\.\d{1,8})?$/)
  .required();

const amountVests = Joi.string()
  .regex(/^\d+(\.\d{6})$/)
  .required()
  .error(new Error('Amount requires a string with 6 decimals'));
const daily_pay = Joi.string()
  .regex(/^\d+(\.\d{3}) HBD$/)
  .required()
  .error(new Error('Wrong daily_pay format. Ex: "1.000 HBD"'));
const rpc = Joi.string().allow(null);
const date = Joi.string()
  .regex(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/)
  .required()
  .error(new Error('Wrong date format. Ex : "2024-07-25T00:00:00"'));
const vscHiveAddress = Joi.string()
  .regex(/^hive:[a-zA-Z0-9\.\-]+$/)
  .error(new Error('The address needs to start by "hive:"'))
  .required();

const proposal_ids = Joi.alternatives(
  Joi.string()
    .required()
    .regex(/\[[0-9,]*[0-9]+\]/),
  Joi.array().items(Joi.number()),
);
const decode = Joi.object({
  username,
  message,
  method,
});

const encode = Joi.object({
  username,
  receiver: username,
  message,
  method,
});
const encodeWithKeys = Joi.object({
  username,
  publicKeys: arrayPublicKeys,
  message,
  method,
});

const signBuffer = Joi.object({
  username: Joi.string().allow(null),
  message: Joi.string().required(),
  method,
  rpc,
  title: Joi.string().allow(null),
});

const vote = Joi.object({
  username,
  permlink: Joi.string().required(),
  author: username,
  weight: Joi.number().required(),
  rpc,
});

const post = Joi.object({
  username,
  body: Joi.string().required(),
  title: Joi.string().allow(''),
  parent_username: Joi.alternatives().conditional('title', {
    is: Joi.valid(''),
    then: Joi.string().required(),
    otherwise: '',
  }),
  parent_perm: Joi.string().required(),
  json_metadata: Joi.string().required(),
  permlink: Joi.string().required(),
  comment_options: Joi.string().allow(''),
  // comment_options: Joi.object({
  //   author: username,
  //   permlink: Joi.string().required(),
  //   max_accepted_payout: Joi.string().required(),
  //   percent_steem_dollars: Joi.number(),
  //   allow_votes: Joi.boolean().required(),
  //   allow_curation_rewards: Joi.boolean().required(),
  //   extensions: Joi.array().items(
  //     Joi.array().items(
  //       0,
  //       Joi.object({
  //         beneficiaries: Joi.array().items(
  //           Joi.object({
  //             account: username,
  //             weight: Joi.number().required(),
  //           }),
  //         ),
  //       }),
  //     ),
  //   ),
  // }).rename('percent_hbd', 'percent_seteem_dollars'),
  rpc,
});

const custom = Joi.object({
  username: Joi.string().allow(null).allow(''),
  json: Joi.string().required(),
  id: Joi.string().required(),
  display_msg: Joi.string(),
  method: Joi.string().valid('Posting', 'Active'),
  rpc,
});

const addAccountAuthority = Joi.object({
  username,
  authorizedUsername: username,
  role: authority,
  weight: Joi.number().integer().required(),
  method: Joi.string().valid('Active'),
  rpc,
});

const removeAccountAuthority = Joi.object({
  username,
  authorizedUsername: username,
  role: authority,
  method: Joi.string().valid('Active'),
  rpc,
});

const addKeyAuthority = Joi.object({
  username,
  authorizedKey: Joi.string().required(),
  role: authority,
  weight: Joi.number().integer().required(),
  method: Joi.string().valid('Active'),
  rpc,
});

const removeKeyAuthority = Joi.object({
  username,
  authorizedKey: Joi.string().required(),
  role: authority,
  method: Joi.string().valid('Active'),
  rpc,
});

const broadcast = Joi.object({
  username,
  operations: Joi.array().items(Joi.array()).required(),
  method: authority,
  rpc,
});

const signTx = Joi.object({
  username,
  tx: Joi.any().required(),
  method: authority,
  rpc,
});

const signedCall = Joi.object({
  username,
  params: Joi.string().required(),
  method: Joi.string().required(),
  typeWif: method,
  rpc,
});

const witnessVote = Joi.object({
  username: Joi.string().allow(null),
  witness: username,
  vote: Joi.boolean(),
  rpc,
});

const proxy = Joi.object({
  username: Joi.string().allow(null),
  proxy: Joi.string().allow('').required(),
  rpc,
});

const delegation = Joi.object({
  username: Joi.string().allow(null),
  delegatee: username,
  amount: Joi.alternatives().conditional('unit', {
    is: 'VESTS',
    then: amountVests,
    otherwise: amount,
  }),
  unit: Joi.string().required().valid('HP', 'VESTS', 'TP'),
  rpc,
});

const transfer = Joi.object({
  username: Joi.alternatives().conditional('enforce', {
    is: true,
    then: username,
    otherwise: Joi.alternatives().conditional('memo', {
      is: message,
      then: username.error(
        new Error(
          'If the memo needs to be encoded (starts with #) or enforce is selected, the username needs to be specified.',
        ),
      ),
      otherwise: Joi.string().allow(null),
    }),
  }),
  to: username,
  amount,
  currency,
  memo: Joi.string().allow(''),
  enforce: Joi.boolean(),
  rpc,
});

const sendToken = Joi.object({
  username,
  to: username,
  amount: amountToken,
  currency: Joi.string().required(),
  memo: Joi.string().allow(''),
  rpc,
});

const powerUp = Joi.object({
  username,
  recipient: username,
  hive: amount,
  rpc,
});

const powerDown = Joi.object({
  username,
  hive_power: amount,
  rpc,
});

const createClaimedAccount = Joi.object({
  username,
  new_account: username,
  owner: Joi.string().required(),
  active: Joi.string().required(),
  posting: Joi.string().required(),
  memo: Joi.string().required(),
  rpc,
});

const createProposal = Joi.object({
  username,
  receiver: username,
  subject: Joi.string().required(),
  permlink: Joi.string().required(),
  daily_pay,
  start: date,
  end: date,
  rpc,
  extensions: Joi.string(),
});

const removeProposal = Joi.object({
  username,
  proposal_ids,
  extensions: Joi.string(),
  rpc,
});

const updateProposalVote = Joi.object({
  username: Joi.string().allow(null),
  proposal_ids,
  approve: Joi.boolean().required(),
  extensions: Joi.alternatives(Joi.array(), Joi.string()),
  rpc,
});

const addAccount = Joi.object({
  username,
  keys: Joi.object({
    posting: Joi.string(),
    active: Joi.string(),
    memo: Joi.string(),
  }).min(1),
});

const convert = Joi.object({
  username,
  amount,
  collaterized: Joi.boolean().required(),
  rpc,
});

const swap = Joi.object({
  username: Joi.string().allow(null),
  amount: Joi.number().required(),
  startToken: Joi.string().required(),
  endToken: Joi.string().required(),
  slippage: Joi.number().required(),
  rpc,
  steps: Joi.array(),
  partnerUsername: Joi.string(),
  partnerFee: Joi.number(),
});

const recurrentTransfer = Joi.object({
  username: Joi.string().allow(null),
  to: username,
  amount: Joi.alternatives()
    .try(amount, Joi.string().valid('0'))
    .error(
      new Error(
        'Must either be equal to 0 (stop recurrent transfer) or have 3 decimals',
      ),
    ),
  currency,
  memo: Joi.string().required().allow(''),
  executions: Joi.number().integer().required(),
  recurrence: Joi.number().integer().required(),
  rpc,
});

const encodeMultisig = Joi.object({
  username,
});

const vscCallContract = Joi.object({
  username,
  contractId: Joi.string().required(),
  action: Joi.string().required(),
  payload: Joi.object().required(),
  method: strictAuthority,
  rpc,
});

const vscDeposit = Joi.object({
  username: Joi.string().allow(null),
  to: Joi.string().allow(null),
  amount: Joi.string().required(),
  currency: Joi.string().required(),
  rpc,
});

const vscWithdrawal = Joi.object({
  username: Joi.string().allow(null),
  to: vscHiveAddress,
  amount: Joi.string().required(),
  currency: Joi.string().required(),
  memo: Joi.string().required().allow(''),
  rpc,
  netId: Joi.string(),
});

const vscTransfer = Joi.object({
  username: Joi.string().allow(null),
  to: Joi.string().required(),
  amount: Joi.string().required(),
  memo: Joi.string().required().allow(''),
  currency: Joi.string().required(),
  rpc,
  netId: Joi.string(),
});

const vscStaking = Joi.object({
  username: Joi.string().allow(null),
  to: Joi.string().required(),
  amount: Joi.string().required(),
  currency: Joi.string().required(),
  operation: vscOperation,
  rpc,
  netId: Joi.string(),
});

const schemas = {
  encodeMultisig,
  decode,
  encode,
  encodeWithKeys,
  signBuffer,
  vote,
  post,
  custom,
  addAccountAuthority,
  removeAccountAuthority,
  addKeyAuthority,
  removeKeyAuthority,
  broadcast,
  signTx,
  signedCall,
  witnessVote,
  proxy,
  delegation,
  transfer,
  sendToken,
  powerUp,
  powerDown,
  createClaimedAccount,
  createProposal,
  removeProposal,
  updateProposalVote,
  addAccount,
  convert,
  recurrentTransfer,
  swap,
  vscCallContract,
  vscDeposit,
  vscWithdrawal,
  vscTransfer,
  vscStaking,
};

export const commonRequestParams = {
  request_id: Joi.number().required(),
  type: Joi.string().required(),
};

// write a Joi validation that allows only null or string starting by either '0x' or 'hive:'

export default schemas;
