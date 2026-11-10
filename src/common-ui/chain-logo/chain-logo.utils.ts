/** First two characters of the chain name for logo fallback (uppercased). */
export const getChainInitials = (chainName: string): string => {
  const trimmed = chainName.trim();
  if (!trimmed) {
    return '—';
  }
  return trimmed.slice(0, 2).toUpperCase();
};
