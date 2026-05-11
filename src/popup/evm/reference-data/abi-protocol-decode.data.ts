import {
  EvmAbi,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { Interface } from 'ethers';

const parseIface = (fragments: string[]) =>
  JSON.parse(new Interface(fragments).formatJson()) as any[];

/** EIP-2612 + compact permit(bytes) overload for decoding only. */
export const Erc20Eip2612PermitAbi = parseIface([
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
  'function permit(address owner, address spender, uint256 value, uint256 deadline, bytes signature)',
  'function nonces(address owner) view returns (uint256)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
]);

export const UniswapV2RouterAbiMinimal = parseIface([
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable',
  'function swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)',
  'function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline) payable',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)',
]);

export const UniswapV3SwapRouterAbiMinimal = parseIface([
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)',
  'function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountIn)',
  'function exactInput(bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum) payable returns (uint256 amountOut)',
  'function exactOutput(bytes path, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum) payable returns (uint256 amountIn)',
  'function multicall(uint256 deadline, bytes[] data) payable returns (bytes[] results)',
  'function multicall(bytes[] data) payable returns (bytes[] results)',
]);

export const Weth9AbiMinimal = parseIface([
  'function deposit() payable',
  'function withdraw(uint256 wad)',
]);

export const Multicall2AbiMinimal = parseIface([
  'function aggregate((address target, bytes callData)[] calls) returns (uint256 blockNumber, bytes[] returnData)',
  'function tryAggregate(bool requireSuccess, (address target, bytes callData)[] calls) returns ((bool success, bytes returnData)[] returnData)',
]);

export const Multicall3AbiMinimal = parseIface([
  'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)',
  'function multicall(bytes[] data) returns (bytes[] results)',
]);

export const GnosisSafeAbiMinimal = parseIface([
  'function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures) returns (bool)',
]);

export const GenericStakingAbiMinimal = parseIface([
  'function stake(uint256 amount)',
  'function withdraw(uint256 amount)',
  'function getReward()',
]);

/** Optimism-style bridge L1 entrypoints (representative; decode-only). */
export const GenericOptimisticBridgeAbiMinimal = parseIface([
  'function depositETH(uint32 _l2Gas, bytes _data) payable',
  'function withdraw(address _l2Token, uint256 _amount, uint256 _l1Gas, bytes _data)',
]);

/** Seaport-style marketplace (minimal; tuple shapes are approximate for decoding). */
export const SeaportMarketplaceAbiMinimal = parseIface([
  'function fulfillBasicOrder((address considerationToken,uint256 considerationIdentifier,uint256 considerationAmount,address offerer,address zone,address offerToken,uint256 offerIdentifier,uint256 offerAmount,uint8 basicOrderType,uint256 startTime,uint256 endTime,bytes32 zoneHash,uint256 salt,bytes32 offererConduitKey,bytes32 fulfillerConduitKey,uint256 totalOriginalAdditionalRecipients,(uint256 amount,address recipient)[] additionalRecipients,bytes signature)) payable returns (bool fulfilled)',
  'function fulfillOrder(((address offerer,address zone,address offerToken,uint256 offerIdentifier,uint256 offerAmount,uint8 offerItemType,uint256 startTime,uint256 endTime,bytes32 zoneHash,uint256 salt,bytes32 conduitKey,uint256 totalOriginalConsiderationItems,(uint256 itemType,address token,uint256 identifier,uint256 startAmount,uint256 endAmount,address recipient)[] considerationItems)[],bytes fulfillerConduitKey)) payable returns (bool fulfilled)',
]);

export const ProtocolDecodeOnlyAbiList: EvmAbi[] = [
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: Erc20Eip2612PermitAbi,
    methods: ['permit', 'nonces', 'DOMAIN_SEPARATOR'],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: UniswapV2RouterAbiMinimal,
    methods: [
      'swapExactTokensForTokens',
      'swapTokensForExactTokens',
      'swapExactETHForTokens',
      'swapTokensForExactETH',
      'swapExactTokensForETH',
      'swapETHForExactTokens',
      'getAmountsOut',
      'getAmountsIn',
    ],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: UniswapV3SwapRouterAbiMinimal,
    methods: [
      'exactInputSingle',
      'exactOutputSingle',
      'exactInput',
      'exactOutput',
      'multicall',
    ],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: Weth9AbiMinimal,
    methods: ['deposit', 'withdraw'],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: Multicall2AbiMinimal,
    methods: ['aggregate', 'tryAggregate'],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: Multicall3AbiMinimal,
    methods: ['aggregate3', 'multicall'],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: GnosisSafeAbiMinimal,
    methods: ['execTransaction'],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: GenericStakingAbiMinimal,
    methods: ['stake', 'withdraw', 'getReward'],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: GenericOptimisticBridgeAbiMinimal,
    methods: ['depositETH', 'withdraw'],
    decodeOnly: true,
  },
  {
    type: EVMSmartContractType.PROTOCOL,
    abi: SeaportMarketplaceAbiMinimal,
    methods: ['fulfillBasicOrder', 'fulfillOrder'],
    decodeOnly: true,
  },
];
