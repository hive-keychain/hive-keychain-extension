import { ethers } from 'ethers';

export type EvmSwapPreviewInput = {
  name: string;
  type: string;
  components?: EvmSwapPreviewInput[];
};

export type EvmSwapAmountLeg = {
  raw: bigint;
  native: boolean;
  tokenAddress?: string;
};

export type EvmSwapPreview =
  | {
      kind: 'bundled';
    }
  | {
      kind: 'exact-in' | 'exact-out';
      pay: EvmSwapAmountLeg;
      receive: EvmSwapAmountLeg;
      recipient?: string;
    };

export type ClassifyDecodedSwapParams = {
  method: string;
  inputs?: ReadonlyArray<EvmSwapPreviewInput>;
  args?: unknown;
  nativeValue?: ethers.BigNumberish | null;
};

const BUNDLED_METHODS = new Set([
  'multicall',
  'aggregate',
  'tryaggregate',
  'aggregate3',
]);

const toArgList = (value: unknown): unknown[] | undefined => {
  if (Array.isArray(value)) {
    return value;
  }
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { toArray?: unknown }).toArray === 'function'
  ) {
    return (value as { toArray: () => unknown[] }).toArray();
  }
  return undefined;
};

const toBigIntValue = (value: unknown): bigint | undefined => {
  if (typeof value === 'bigint') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return BigInt(Math.trunc(value));
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      return BigInt(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
};

const toAddress = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !ethers.isAddress(value)) {
    return undefined;
  }
  return value;
};

const readNamed = (
  value: unknown,
  name: string,
  components?: ReadonlyArray<EvmSwapPreviewInput>,
): unknown => {
  if (value && typeof value === 'object' && name in (value as object)) {
    return (value as Record<string, unknown>)[name];
  }
  const list = toArgList(value);
  const index =
    components?.findIndex((component) => component.name === name) ?? -1;
  if (list && index >= 0) {
    return list[index];
  }
  return undefined;
};

const readInput = (
  inputs: ReadonlyArray<EvmSwapPreviewInput>,
  args: unknown[],
  name: string,
): unknown => {
  const index = inputs.findIndex((input) => input.name === name);
  if (index < 0) {
    return undefined;
  }
  return args[index];
};

const readAddressList = (value: unknown): string[] => {
  const list = toArgList(value);
  if (!list) {
    return [];
  }
  return list
    .map((entry) => toAddress(entry))
    .filter((address): address is string => !!address);
};

const tokenLeg = (
  raw: bigint | undefined,
  tokenAddress?: string,
): EvmSwapAmountLeg | undefined => {
  if (raw == null) {
    return undefined;
  }
  return {
    raw,
    native: false,
    tokenAddress,
  };
};

const nativeLeg = (raw: bigint | undefined): EvmSwapAmountLeg | undefined => {
  if (raw == null) {
    return undefined;
  }
  return {
    raw,
    native: true,
  };
};

const classifyV2 = (
  method: string,
  inputs: ReadonlyArray<EvmSwapPreviewInput>,
  args: unknown[],
  nativeRaw: bigint | undefined,
): EvmSwapPreview | null => {
  const path = readAddressList(readInput(inputs, args, 'path'));
  const tokenIn = path[0];
  const tokenOut = path[path.length - 1];
  const recipient = toAddress(readInput(inputs, args, 'to'));
  const amountIn = toBigIntValue(readInput(inputs, args, 'amountIn'));
  const amountOutMin = toBigIntValue(readInput(inputs, args, 'amountOutMin'));
  const amountOut = toBigIntValue(readInput(inputs, args, 'amountOut'));
  const amountInMax = toBigIntValue(readInput(inputs, args, 'amountInMax'));

  switch (method) {
    case 'swapexacttokensfortokens': {
      const pay = tokenLeg(amountIn, tokenIn);
      const receive = tokenLeg(amountOutMin, tokenOut);
      if (!pay || !receive) return null;
      return { kind: 'exact-in', pay, receive, recipient };
    }
    case 'swapexactethfortokens': {
      const pay = nativeLeg(nativeRaw);
      const receive = tokenLeg(amountOutMin, tokenOut);
      if (!pay || !receive) return null;
      return { kind: 'exact-in', pay, receive, recipient };
    }
    case 'swapexacttokensforeth': {
      const pay = tokenLeg(amountIn, tokenIn);
      const receive = nativeLeg(amountOutMin);
      if (!pay || !receive) return null;
      return { kind: 'exact-in', pay, receive, recipient };
    }
    case 'swaptokensforexacttokens': {
      const pay = tokenLeg(amountInMax, tokenIn);
      const receive = tokenLeg(amountOut, tokenOut);
      if (!pay || !receive) return null;
      return { kind: 'exact-out', pay, receive, recipient };
    }
    case 'swaptokensforexacteth': {
      const pay = tokenLeg(amountInMax, tokenIn);
      const receive = nativeLeg(amountOut);
      if (!pay || !receive) return null;
      return { kind: 'exact-out', pay, receive, recipient };
    }
    case 'swapethforexacttokens': {
      const pay = nativeLeg(nativeRaw);
      const receive = tokenLeg(amountOut, tokenOut);
      if (!pay || !receive) return null;
      return { kind: 'exact-out', pay, receive, recipient };
    }
    default:
      return null;
  }
};

const classifyV3Tuple = (
  method: string,
  inputs: ReadonlyArray<EvmSwapPreviewInput>,
  args: unknown[],
): EvmSwapPreview | null => {
  const tupleInput = inputs.find((input) => input.type.startsWith('tuple'));
  const tupleValue = tupleInput
    ? readInput(inputs, args, tupleInput.name)
    : args[0];
  const components = tupleInput?.components;
  const tokenIn = toAddress(readNamed(tupleValue, 'tokenIn', components));
  const tokenOut = toAddress(readNamed(tupleValue, 'tokenOut', components));
  const recipient = toAddress(readNamed(tupleValue, 'recipient', components));

  if (method === 'exactinputsingle') {
    const pay = tokenLeg(
      toBigIntValue(readNamed(tupleValue, 'amountIn', components)),
      tokenIn,
    );
    const receive = tokenLeg(
      toBigIntValue(readNamed(tupleValue, 'amountOutMinimum', components)),
      tokenOut,
    );
    if (!pay || !receive) return null;
    return { kind: 'exact-in', pay, receive, recipient };
  }

  const pay = tokenLeg(
    toBigIntValue(readNamed(tupleValue, 'amountInMaximum', components)),
    tokenIn,
  );
  const receive = tokenLeg(
    toBigIntValue(readNamed(tupleValue, 'amountOut', components)),
    tokenOut,
  );
  if (!pay || !receive) return null;
  return { kind: 'exact-out', pay, receive, recipient };
};

const classifyV3Path = (
  method: string,
  inputs: ReadonlyArray<EvmSwapPreviewInput>,
  args: unknown[],
): EvmSwapPreview | null => {
  const recipient = toAddress(readInput(inputs, args, 'recipient'));
  if (method === 'exactinput') {
    const pay = tokenLeg(toBigIntValue(readInput(inputs, args, 'amountIn')));
    const receive = tokenLeg(
      toBigIntValue(readInput(inputs, args, 'amountOutMinimum')),
    );
    if (!pay || !receive) return null;
    return { kind: 'exact-in', pay, receive, recipient };
  }

  const pay = tokenLeg(
    toBigIntValue(readInput(inputs, args, 'amountInMaximum')),
  );
  const receive = tokenLeg(toBigIntValue(readInput(inputs, args, 'amountOut')));
  if (!pay || !receive) return null;
  return { kind: 'exact-out', pay, receive, recipient };
};

const classifyDecodedSwap = ({
  method,
  inputs = [],
  args,
  nativeValue,
}: ClassifyDecodedSwapParams): EvmSwapPreview | null => {
  const normalizedMethod = method.trim().toLowerCase();
  if (!normalizedMethod) {
    return null;
  }
  if (BUNDLED_METHODS.has(normalizedMethod)) {
    return { kind: 'bundled' };
  }

  const argList = toArgList(args) ?? [];
  const nativeRaw =
    nativeValue == null ? undefined : toBigIntValue(nativeValue);

  if (
    normalizedMethod === 'exactinputsingle' ||
    normalizedMethod === 'exactoutputsingle'
  ) {
    return classifyV3Tuple(normalizedMethod, inputs, argList);
  }
  if (normalizedMethod === 'exactinput' || normalizedMethod === 'exactoutput') {
    return classifyV3Path(normalizedMethod, inputs, argList);
  }

  return classifyV2(normalizedMethod, inputs, argList, nativeRaw);
};

export const EvmSwapPreviewUtils = {
  classifyDecodedSwap,
};
