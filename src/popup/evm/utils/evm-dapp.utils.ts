export const getEvmDappFaviconUrl = (subdomain: string) => {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    subdomain,
  )}&sz=256`;
};

/** Prefer logo stored at connect time (`EVM_DAPPS_LOGO`), else Google favicon URL. */
export const getEvmDappConnectionIconUrl = (
  subdomain: string,
  savedLogos?: Record<string, string> | null,
) => {
  const saved = savedLogos?.[subdomain]?.trim();
  if (saved) {
    return saved;
  }
  return getEvmDappFaviconUrl(subdomain);
};
