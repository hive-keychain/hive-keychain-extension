import { ChainRouterComponent } from '@popup/multichain/chain-router.component';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Theme } from 'react-toastify';
import { ErrorFallback } from 'src/common-ui/error-fallback/error-fallback.component';

const ChainComponent = ({ chain }: { theme: Theme; chain?: Chain }) => {
  return <ChainRouterComponent screen={screen} selectedChain={chain} />;
};

export const ChainComponentWithBoundary = withErrorBoundary(ChainComponent, {
  FallbackComponent: ErrorFallback,
});
