import type { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import type { EvmTransactionVerificationInformation } from '@popup/evm/interfaces/evm-transactions.interface';
import type { EvmAccountPublic } from '@popup/evm/interfaces/wallet.interface';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import type { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import { EvmRequestItemLongText } from 'src/dialog/evm/components/evm-request-item/evm-request-item-long-text/evm-request-item-long-text';
import { formatDecodedArgumentDisplayValue } from 'src/dialog/evm/requests/send-transaction/send-transaction-argument-format';
import type { SendTransactionHookApi } from 'src/dialog/evm/requests/send-transaction/send-transaction.types';

/** Minimal ABI fragment shape from `ethers` `ParamType` / JSON ABI. */
export type AbiParamFragment = {
  type: string;
  name?: string;
  components?: readonly AbiParamFragment[];
  baseType?: string;
  arrayChildren?: AbiParamFragment;
};

const COLLAPSE_LONG_STRING_AT = 48;

/** Element shape for a decoded `tuple` or each element of `tuple[]`. */
export function resolveTupleShapeComponents(
  input: AbiParamFragment,
): readonly AbiParamFragment[] | null {
  const bt = input.baseType;
  if (bt === 'tuple') {
    const c = input.components;
    return Array.isArray(c) && c.length > 0 ? c : null;
  }
  if (bt === 'array') {
    const child = input.arrayChildren;
    if (child) {
      const c = child.components;
      if (child.baseType === 'tuple' && Array.isArray(c) && c.length > 0) {
        return c;
      }
    }
  }
  const t = `${input.type ?? ''}`.toLowerCase();
  if (t.startsWith('tuple') && Array.isArray(input.components)) {
    return input.components.length > 0 ? input.components : null;
  }
  return null;
}

export function isTupleAbiInput(input: AbiParamFragment): boolean {
  return resolveTupleShapeComponents(input) != null;
}

function isTupleArrayParam(input: AbiParamFragment): boolean {
  if (input.baseType === 'array') {
    return true;
  }
  return `${input.type ?? ''}`.toLowerCase().endsWith('[]');
}

function normalizeToArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value != null && typeof value === 'object' && Symbol.iterator in value) {
    return Array.from(value as Iterable<unknown>);
  }
  return [];
}

function readTupleMember(
  tuple: unknown,
  index: number,
  fieldName?: string,
): unknown {
  if (tuple == null || typeof tuple !== 'object') {
    return undefined;
  }
  const o = tuple as Record<string, unknown>;
  if (
    'length' in o &&
    typeof (o as { length?: unknown }).length === 'number' &&
    index < (o as { length: number }).length
  ) {
    return (o as unknown as unknown[])[index];
  }
  if (fieldName?.trim()) {
    const n = fieldName.trim();
    if (n in o) {
      return o[n];
    }
  }
  if (index in o) {
    return o[index as unknown as string];
  }
  return undefined;
}

function wrapLeafDisplay(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string' && node.length >= COLLAPSE_LONG_STRING_AT) {
    return <EvmRequestItemLongText value={node} />;
  }
  return node;
}

function bigintJsonReplacer(_key: string, v: unknown) {
  return typeof v === 'bigint' ? v.toString() : v;
}

function tupleDisplayFallbackText(argumentValue: unknown): string {
  if (argumentValue == null) {
    return '—';
  }
  if (typeof argumentValue === 'bigint') {
    return argumentValue.toString();
  }
  if (typeof argumentValue !== 'object') {
    return String(argumentValue);
  }
  try {
    return JSON.stringify(argumentValue, bigintJsonReplacer);
  } catch {
    return '—';
  }
}

type TupleFormatContext = {
  abi: any;
  methodName: string;
  usedToken: EvmSmartContractInfo;
  chain: EvmChain;
  transactionInfo: EvmTransactionVerificationInformation;
  accounts: EvmAccountPublic[];
  transactionHook: SendTransactionHookApi;
};

async function formatLeafForTupleComponent(
  component: AbiParamFragment,
  val: unknown,
  ctx: TupleFormatContext,
): Promise<React.ReactNode> {
  if (val === undefined || val === null) {
    return <span className="decoded-tuple-value--empty">—</span>;
  }

  const nestedComponents = resolveTupleShapeComponents(component);
  if (nestedComponents?.length) {
    const innerRows = await renderTupleRows(nestedComponents, val, ctx);
    return (
      <div className="decoded-tuple decoded-tuple--nested">
        <EvmRequestItemLongText allowExpandWithoutTitle value={innerRows} />
      </div>
    );
  }

  const displayType = EvmTransactionParserUtils.getDisplayInputType(
    ctx.abi,
    ctx.methodName,
    component.type ?? '',
    component.name ?? '',
    ctx.usedToken,
  );

  try {
    const rendered = await formatDecodedArgumentDisplayValue(
      displayType,
      val,
      ctx.usedToken,
      ctx.chain,
      ctx.transactionInfo,
      ctx.accounts,
      ctx.transactionHook,
    );
    return wrapLeafDisplay(rendered as React.ReactNode);
  } catch {
    try {
      return (
        <span className="decoded-tuple-value--fallback">
          {typeof val === 'object' && val !== null
            ? JSON.stringify(val, bigintJsonReplacer)
            : String(val)}
        </span>
      );
    } catch {
      return <span className="decoded-tuple-value--fallback">—</span>;
    }
  }
}

async function renderTupleRows(
  components: readonly AbiParamFragment[],
  tupleValue: unknown,
  ctx: TupleFormatContext,
): Promise<React.ReactNode> {
  const rowNodes = await Promise.all(
    components.map(async (comp, i) => {
      const v = readTupleMember(tupleValue, i, comp.name);
      const label = comp.name?.trim() ? comp.name : `field ${i + 1}`;
      const cell = await formatLeafForTupleComponent(comp, v, ctx);
      return (
        <div className="decoded-tuple-row" key={`${label}-${i}`}>
          <span className="decoded-tuple-row__label">{label}</span>
          <div className="decoded-tuple-row__value">{cell}</div>
        </div>
      );
    }),
  );

  return <div className="decoded-tuple-rows">{rowNodes}</div>;
}

async function renderTupleArrayBody(
  components: readonly AbiParamFragment[],
  argumentValue: unknown,
  ctx: TupleFormatContext,
): Promise<React.ReactNode> {
  const rows = normalizeToArray(argumentValue);
  const blocks = await Promise.all(
    rows.map(async (row, idx) => {
      const inner = await renderTupleRows(components, row, ctx);
      return (
        <div className="decoded-tuple-array__item" key={idx}>
          <div className="decoded-tuple-array__heading">#{idx + 1}</div>
          {inner}
        </div>
      );
    }),
  );
  return <div className="decoded-tuple-array">{blocks}</div>;
}

/**
 * Collapsible expanded rows for a decoded `tuple` or `tuple[]` on the
 * send-transaction confirmation screen.
 */
export async function formatDecodedTupleForConfirmationField(
  fragmentInput: AbiParamFragment,
  argumentValue: unknown,
  usedToken: EvmSmartContractInfo,
  chain: EvmChain,
  transactionInfo: EvmTransactionVerificationInformation,
  accounts: EvmAccountPublic[],
  transactionHook: SendTransactionHookApi,
  abi: any,
  methodName: string,
): Promise<React.ReactNode> {
  try {
    const components = resolveTupleShapeComponents(fragmentInput);
    if (!components?.length) {
      return <>{tupleDisplayFallbackText(argumentValue)}</>;
    }

    const ctx: TupleFormatContext = {
      abi,
      methodName,
      usedToken,
      chain,
      transactionInfo,
      accounts,
      transactionHook,
    };

    const isArray = isTupleArrayParam(fragmentInput);

    const body = isArray
      ? await renderTupleArrayBody(components, argumentValue, ctx)
      : await renderTupleRows(components, argumentValue, ctx);

    return (
      <div className="decoded-tuple decoded-tuple--top">
        <EvmRequestItemLongText allowExpandWithoutTitle value={body} />
      </div>
    );
  } catch {
    return (
      <span className="decoded-tuple-value--fallback">
        {tupleDisplayFallbackText(argumentValue)}
      </span>
    );
  }
}
