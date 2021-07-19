import Joi from 'joi';

const username = Joi.string().required().min(3);
const method = Joi.string().valid('Posting', 'Active', 'Memo').required();
const authority = Joi.string().valid('Posting', 'Active').required();
const message = Joi.string().required().min(2).regex(/^#/);
const currency = Joi.string().valid('HIVE', 'HBD').required();
const amount = Joi.string()
  .regex(/^\d+(\.\d{3})$/)
  .required();
const amountHp = Joi.string()
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
  rpc,
  //TODO : conditional rendering of the amounts
});

const transfer = Joi.object({
  username: Joi.string(),
  to: username,
  amount,
  currency,
  memo: Joi.string(),
  enforce: Joi.boolean(),
  rpc,
  //TODO : conditional rendering  memo / username
});

const sendToken = Joi.object({
  username,
  to: username,
  amount,
  currency: Joi.string().required(),
  memo: Joi.string(),
  rpc,
});
//TODO : powerup / down

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
  }),
  rpc,
  //TODO:check has one key
});

//TODO : Verify all schemas for optional params

const schemas = {
  decode,
  encode,
  signBuffer,
  vote,
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
  createClaimedAccount,
  createProposal,
  removeProposal,
  updateProposalVote,
  addAccount,
};

export default schemas;
