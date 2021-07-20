import Joi from 'joi';

const username = Joi.string().required().min(3);
const method = Joi.string().valid('Posting', 'Active', 'Memo').required();
const authority = Joi.string().valid('Posting', 'Active').required();
const message = Joi.string().required().min(2).regex(/^#/);
const currency = Joi.string().valid('HIVE', 'HBD', 'TESTS', 'TBD').required();
const amount = Joi.string()
  .regex(/^\d+(\.\d{3})$/)
  .required();
const amountVests = Joi.string()
  .regex(/^\d+(\.\d{6})$/)
  .required();
const daily_pay = Joi.string()
  .regex(/^\d+(\.\d{3}) HBD$/)
  .required();
const rpc = Joi.string();
const date = Joi.string()
  .regex(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/)
  .required();

const proposal_ids = Joi.string()
  .required()
  .regex(/\[[0-9,]+[0-9]+\]/);
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

const signBuffer = Joi.object({
  username: Joi.string(),
  message: Joi.string().required(),
  method,
  rpc,
});

const vote = Joi.object({
  username,
  permlink: Joi.string().required(),
  author: username,
  rpc,
});

//TODO : post
const post = Joi.object({
  username: Joi.string(),
});

const custom = Joi.object({
  username: Joi.string(),
  json: Joi.string().required(),
  id: Joi.string().required(),
  rpc,
});

const addAccountAuthority = Joi.object({
  username,
  authorizedUsername: username,
  role: authority,
  weight: Joi.number().integer().required(),
  rpc,
});

const removeAccountAuthority = Joi.object({
  username,
  authorizedUsername: username,
  role: authority,
  rpc,
});

const addKeyAuthority = Joi.object({
  username,
  authorizedKey: Joi.string().required(),
  role: authority,
  weight: Joi.number().integer().required(),
  rpc,
});

const removeKeyAuthority = Joi.object({
  username,
  authorizedKey: Joi.string().required(),
  role: authority,
  rpc,
});

const broadcast = Joi.object({
  username,
  operations: Joi.string().required(),
  method: authority,
  rpc,
});

const signTx = Joi.object({
  username,
  tx: Joi.string().required(),
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
  username: Joi.string(),
  witness: username,
  vote: Joi.boolean(),
  rpc,
});

const proxy = Joi.object({
  username: Joi.string(),
  proxy: Joi.string(),
  rpc,
});

const delegation = Joi.object({
  username: Joi.string(),
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
  username: Joi.alternatives()
    .conditional('enforce', {
      is: true,
      then: username,
      otherwise: Joi.alternatives().conditional('memo', {
        is: message,
        then: username,
        otherwise: Joi.string(),
      }),
    })
    .error(
      new Error(
        'If the memo needs to be encoded (starts with #) or enforce is selected, the username needs to be specified.',
      ),
    ),
  to: username,
  amount,
  currency,
  memo: Joi.string(),
  enforce: Joi.boolean(),
  rpc,
});

const sendToken = Joi.object({
  username,
  to: username,
  amount,
  currency: Joi.string().required(),
  memo: Joi.string(),
  rpc,
});

const powerUp = Joi.object({
  username,
  recipient: username,
  steem: amount,
  rpc,
}).rename('hive', 'steem');

const powerDown = Joi.object({
  username,
  steem_power: amount,
  rpc,
}).rename('hp', 'steem_power');

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
});

const removeProposal = Joi.object({
  username,
  proposal_ids,
  rpc,
});

const updateProposalVote = Joi.object({
  username,
  proposal_ids,
  approve: Joi.boolean().required(),
  rpc,
});

const addAccount = Joi.object({
  username,
  keys: Joi.object({
    posting: Joi.string(),
    active: Joi.string(),
    memo: Joi.string(),
  }).min(1),
  rpc,
});

const convert = Joi.object({
  username,
  amount,
  collaterized: Joi.boolean().required(),
  rpc,
});

const recurrentTransfer = Joi.object({
  username,
  to: username,
  amount: Joi.alternatives()
    .try(amount, Joi.string().valid('0'))
    .error(
      new Error(
        'Must either be equal to 0 (stop recurrent transfer) or have 3 decimals',
      ),
    ),
  currency,
  executions: Joi.number().integer().required(),
  recurrence: Joi.number().integer().required(),
  rpc,
});

//TODO : Verify all schemas for optional params

const schemas = {
  decode,
  encode,
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
};

export default schemas;
